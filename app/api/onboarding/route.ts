import { streamText } from 'ai'
import { defaultModel } from '@/lib/ai-config'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import * as onboardingTools from '@/lib/ai/tools/onboarding-tools'

export const maxDuration = 30

// Stages are passed from the client
// const ONBOARDING_STAGES = [
//   'welcome',
//   'family_composition',
//   'income_sources',
//   'housing_expenses',
//   'regular_expenses',
//   'investments_savings',
//   'financial_goals',
//   'budget_creation',
//   'complete'
// ]

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const { messages, stage } = await req.json()
  
  // Get or create onboarding record
  let onboarding = await db.familyOnboarding.findUnique({
    where: { familyId: session.user.familyId }
  })
  
  if (!onboarding) {
    onboarding = await db.familyOnboarding.create({
      data: { familyId: session.user.familyId }
    })
  }
  
  // Store the user's message in conversation history
  const lastUserMessage = messages[messages.length - 1]
  if (lastUserMessage && lastUserMessage.role === 'user') {
    await db.onboardingConversation.create({
      data: {
        onboardingId: onboarding.id,
        role: 'user',
        content: lastUserMessage.content,
      }
    })
  }
  
  const result = streamText({
    model: defaultModel(),
    messages,
    system: `You are a friendly financial advisor helping the ${session.user.familyName || 'family'} set up their first budget.
    
    Current stage: ${stage}
    Family ID: ${session.user.familyId}
    Onboarding ID: ${onboarding.id}
    User Name: ${session.user.name}
    
    Guidelines:
    - Be conversational, friendly, and encouraging
    - Ask one question at a time to avoid overwhelming the user
    - Validate and confirm information before proceeding
    - Suggest reasonable defaults based on family size and common patterns
    - Extract and store all relevant information using the tools provided
    - Create a comprehensive initial budget at the end
    - Keep responses concise and focused
    
    Stage-specific prompts:
    
    WELCOME: Welcome them warmly and ask for their family name or how they'd like to be addressed.
    
    FAMILY_COMPOSITION: Ask about family members. Example: "Tell me about your family. How many adults and children are in your household?"
    
    INCOME_SOURCES: Ask about income. Example: "Let's talk about income. What's your family's primary monthly income? Do you have any additional income sources?"
    
    HOUSING_EXPENSES: Ask about housing costs. Example: "Now for housing - do you rent, have a mortgage, or own your home outright? What's your monthly housing cost?"
    
    REGULAR_EXPENSES: Ask about regular monthly expenses. Example: "What are your typical monthly expenses? Think about utilities, transportation, food, insurance, etc. You can give me rough estimates."
    
    INVESTMENTS_SAVINGS: Ask about savings and investments. Example: "Do you currently save or invest money each month? What types of investments do you have?"
    
    FINANCIAL_GOALS: Ask about goals. Example: "What are your top financial goals? For example: emergency fund, retirement, education, buying a home, paying off debt, vacation?"
    
    BUDGET_CREATION: Summarize what you've learned and ask for confirmation to create the budget. Example: "Based on what you've told me, I'll create your initial budget with [summary]. Should I proceed?"
    
    COMPLETE: Thank them and let them know the budget is ready to use.
    
    Remember to use the tools to:
    - Extract and save information (extractFamilyInfo)
    - Suggest appropriate expense categories (suggestExpenseCategories)
    - Update onboarding data (updateOnboardingData)
    - Create the initial budget (createInitialBudget) when confirmed`,
    tools: {
      extractFamilyInfo: onboardingTools.extractFamilyInfo,
      createInitialBudget: onboardingTools.createInitialBudget,
      suggestExpenseCategories: onboardingTools.suggestExpenseCategories,
      updateOnboardingData: onboardingTools.updateOnboardingData,
    },
    toolChoice: 'auto',
    onFinish: async ({ text, toolCalls }) => {
      // Store assistant's response in conversation history
      if (text) {
        await db.onboardingConversation.create({
          data: {
            onboardingId: onboarding.id,
            role: 'assistant',
            content: text,
            metadata: toolCalls?.length ? { toolCalls } : undefined,
          }
        })
      }
    },
  })
  
  return result.toTextStreamResponse()
}