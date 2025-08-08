import { streamText, convertToModelMessages } from 'ai'
import { getAIModel, SYSTEM_PROMPT, aiConfig } from '@/lib/ai-config'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import * as budgetTools from '@/lib/ai/tools/budget-tools'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    // Check if AI features are enabled
    if (process.env.ENABLE_AI_FEATURES !== 'true') {
      return new Response(
        JSON.stringify({ error: 'AI features are disabled' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Get user session
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Check if AI provider is configured
    let model
    try {
      model = getAIModel()
      if (process.env.NODE_ENV === 'development') {
        console.log('AI Model loaded successfully')
      }
    } catch (error) {
      console.error('AI Model configuration error:', error)
      return new Response(
        JSON.stringify({ error: 'AI assistant is not configured. Please add an API key for OpenAI, Anthropic, or Google in your environment variables.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    let body
    try {
      body = await req.json()
    } catch (e) {
      console.error('Failed to parse request body:', e)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const { messages: uiMessages } = body
    
    // Log incoming request for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Chat API received:', { 
        hasMessages: !!uiMessages, 
        messagesLength: uiMessages?.length,
        body: JSON.stringify(body).substring(0, 200)
      })
    }
    
    // Validate messages
    if (!uiMessages || !Array.isArray(uiMessages)) {
      console.error('Invalid messages:', uiMessages)
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Convert UI messages to model messages
    const messages = convertToModelMessages(uiMessages)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Converted messages:', JSON.stringify(messages).substring(0, 200))
    }
    
    // Create context for tools
    const toolContext = {
      userId: session.user.id,
      familyId: session.user.familyId,
      userName: session.user.name,
    }
    
    // Stream the response
    const result = streamText({
      model,
      messages,
      system: `${SYSTEM_PROMPT}
      
Current context:
- User: ${session.user.name}
- Family ID: ${session.user.familyId}
- User ID: ${session.user.id}

When using tools, the context object containing userId and familyId will be automatically provided.

REMINDER: Always provide conversational text responses along with tool results. Don't just call tools silently - explain what you're doing and what the results mean.`,
      tools: {
        getBudgetOverview: budgetTools.getBudgetOverview(toolContext),
        addIncome: budgetTools.addIncome(toolContext),
        addExpense: budgetTools.addExpense(toolContext),
        compareScenarios: budgetTools.compareScenarios(toolContext),
        generateChart: budgetTools.generateChart(toolContext),
        listIncomes: budgetTools.listIncomes(toolContext),
        listExpenses: budgetTools.listExpenses(toolContext),
      },
      toolChoice: 'auto',
      maxRetries: 3,
      temperature: aiConfig.temperature,
      maxSteps: 5, // Allow multiple steps for tool calls and responses
      experimental_telemetry: {
        isEnabled: false,
      },
      onStepFinish: async ({ toolCalls, text }) => {
        // Log tool usage for debugging in development
        if (process.env.NODE_ENV === 'development') {
          if (toolCalls?.length) {
            console.log('AI Tools executed:', toolCalls.map(tc => tc.toolName))
          }
          if (text) {
            console.log('AI Response text:', text.substring(0, 100))
          }
        }
      },
    })
    
    // For AI SDK v5, use toUIMessageStreamResponse for streaming
    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return new Response(
          JSON.stringify({ error: 'AI service configuration error. Please check your API keys.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      }
      if (error.message.includes('rate limit')) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please try again later.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }
    
    // Return a more detailed error response for debugging
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing your request.'
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}