# AI Chatbot Implementation Guide for Family Budget App

## Overview

This guide provides a comprehensive implementation plan for adding an AI-powered chatbot to the Family Budget App using **Vercel AI SDK v5** with Next.js 15. The chatbot will have capabilities to manage incomes, expenses, analyze scenarios, and generate visualizations.

**Important Note**: This guide has been updated with correct AI SDK v5 patterns based on Context7 MCP documentation retrieval.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Next.js)                 │
├─────────────────────────────────────────────────────────────┤
│  Chat UI Component  │  Streaming Response  │  Tool Results   │
├─────────────────────────────────────────────────────────────┤
│                    Vercel AI SDK UI Hooks                    │
├─────────────────────────────────────────────────────────────┤
│                  API Routes (Server Actions)                 │
├─────────────────────────────────────────────────────────────┤
│                    Vercel AI SDK Core                        │
├─────────────────────────────────────────────────────────────┤
│   Tool Functions   │   LLM Provider   │   Database Access   │
├─────────────────────────────────────────────────────────────┤
│                    PostgreSQL (Prisma)                       │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Vercel AI SDK v5**: Core framework for AI integration (`ai@5.0.8`)
- **@ai-sdk/react v2**: React hooks for chat UI (`@ai-sdk/react@2.0.8`)
- **OpenAI/Anthropic/Google Gemini**: LLM providers (configurable)
- **Prisma**: Database ORM (already in use)
- **React Server Components**: For optimal performance
- **Framer Motion**: For chat animations (already available)
- **Recharts**: For data visualization (already available)

## Phase 1: Basic Setup

### 1.1 Install Dependencies

```bash
# Core AI SDK v5 and React hooks
npm install ai@5.0.8 @ai-sdk/react@2.0.8

# Provider SDKs
npm install @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google
```

### 1.2 Environment Variables

Add to `.env.local`:
```env
# Choose one or multiple providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...

# Feature flag to enable/disable AI
ENABLE_AI_FEATURES=true

# Optional: Rate limiting
AI_RATE_LIMIT_PER_MINUTE=20
```

### 1.3 Create AI Configuration

Create `lib/ai-config.ts`:
```typescript
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'

// Configure providers
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Default model selection
export const defaultModel = openai('gpt-4o-mini')
// Alternative: anthropic('claude-3-5-haiku-latest')
```

## Phase 2: Tool Functions Implementation

### 2.1 Budget Analysis Tools

Create `lib/ai/tools/budget-tools.ts`:
```typescript
import { tool } from 'ai'
import { z } from 'zod'
import { db } from '@/lib/db'

export const getBudgetOverview = tool({
  description: 'Get current budget overview and financial summary',
  parameters: z.object({
    overviewId: z.string().optional(),
  }),
  execute: async ({ overviewId }, { userId, familyId }) => {
    const overview = await db.monthlyOverview.findFirst({
      where: {
        familyId,
        ...(overviewId ? { id: overviewId } : { isActive: true }),
      },
      include: {
        incomes: true,
        userExpenses: {
          include: {
            category: true,
            user: true,
          },
        },
      },
    })
    
    const totalIncome = overview?.incomes.reduce(
      (sum, inc) => sum + Number(inc.monthlyAmount), 0
    ) ?? 0
    
    const totalExpenses = overview?.userExpenses.reduce(
      (sum, exp) => sum + Number(exp.amount), 0
    ) ?? 0
    
    return {
      name: overview?.name,
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
    }
  },
})

export const addIncome = tool({
  description: 'Add a new income source',
  parameters: z.object({
    name: z.string(),
    amount: z.number(),
    type: z.enum(['salary', 'freelance', 'property', 'investment', 'business', 'other']),
    frequency: z.enum(['weekly', 'biweekly', 'semimonthly', 'monthly', 'yearly', 'one-time']),
    userId: z.string().optional(),
  }),
  execute: async (params, { familyId }) => {
    const activeOverview = await db.monthlyOverview.findFirst({
      where: { familyId, isActive: true },
    })
    
    if (!activeOverview) {
      throw new Error('No active budget overview found')
    }
    
    // Calculate monthly amount based on frequency
    const monthlyAmount = calculateMonthlyAmount(params.amount, params.frequency)
    
    const income = await db.income.create({
      data: {
        overviewId: activeOverview.id,
        name: params.name,
        amount: params.amount,
        type: params.type,
        frequency: params.frequency,
        monthlyAmount,
        userId: params.userId,
      },
    })
    
    return { success: true, income }
  },
})

export const addExpense = tool({
  description: 'Add a new expense',
  parameters: z.object({
    name: z.string(),
    amount: z.number(),
    categoryName: z.string(),
    isShared: z.boolean().optional(),
    sharePercentage: z.number().optional(),
  }),
  execute: async (params, { userId, familyId }) => {
    const activeOverview = await db.monthlyOverview.findFirst({
      where: { familyId, isActive: true },
    })
    
    if (!activeOverview) {
      throw new Error('No active budget overview found')
    }
    
    // Find or create category
    let category = await db.category.findFirst({
      where: { familyId, name: params.categoryName },
    })
    
    if (!category) {
      category = await db.category.create({
        data: { familyId, name: params.categoryName },
      })
    }
    
    const expense = await db.userExpense.create({
      data: {
        overviewId: activeOverview.id,
        userId,
        categoryId: category.id,
        name: params.name,
        amount: params.amount,
        isShared: params.isShared ?? false,
        sharePercentage: params.sharePercentage,
      },
    })
    
    return { success: true, expense }
  },
})

export const compareScenarios = tool({
  description: 'Compare different budget scenarios',
  parameters: z.object({
    scenarioIds: z.array(z.string()).optional(),
  }),
  execute: async ({ scenarioIds }, { familyId }) => {
    const scenarios = await db.monthlyOverview.findMany({
      where: {
        familyId,
        ...(scenarioIds ? { id: { in: scenarioIds } } : { isArchived: false }),
      },
      include: {
        incomes: true,
        userExpenses: true,
      },
    })
    
    return scenarios.map(scenario => ({
      id: scenario.id,
      name: scenario.name,
      totalIncome: scenario.incomes.reduce((sum, inc) => sum + Number(inc.monthlyAmount), 0),
      totalExpenses: scenario.userExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
      netSavings: scenario.incomes.reduce((sum, inc) => sum + Number(inc.monthlyAmount), 0) -
                  scenario.userExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
    }))
  },
})

export const generateChart = tool({
  description: 'Generate chart data for visualization',
  parameters: z.object({
    chartType: z.enum(['income-expense', 'category-breakdown', 'scenario-comparison', 'trend']),
    timeRange: z.enum(['current', 'last-3-months', 'last-6-months', 'year']).optional(),
  }),
  execute: async ({ chartType, timeRange }, { familyId }) => {
    // Implementation would fetch data and format for Recharts
    const data = await getChartData(chartType, timeRange, familyId)
    return {
      type: chartType,
      data,
      config: getChartConfig(chartType),
    }
  },
})
```

### 2.2 Helper Functions

Create `lib/ai/tools/helpers.ts`:
```typescript
export function calculateMonthlyAmount(amount: number, frequency: string): number {
  const frequencyMultipliers = {
    'weekly': 52 / 12,
    'biweekly': 26 / 12,
    'semimonthly': 2,
    'monthly': 1,
    'yearly': 1 / 12,
    'one-time': 1,
  }
  
  return amount * (frequencyMultipliers[frequency] || 1)
}

export async function getChartData(type: string, range: string, familyId: string) {
  // Implementation based on chart type
  switch (type) {
    case 'income-expense':
      // Return income vs expense data
      break
    case 'category-breakdown':
      // Return expense by category
      break
    case 'scenario-comparison':
      // Return scenario comparison data
      break
    case 'trend':
      // Return trend data over time
      break
  }
}

export function getChartConfig(type: string) {
  // Return Recharts configuration based on type
  return {
    xAxis: 'month',
    yAxis: 'amount',
    colors: ['#10b981', '#ef4444', '#3b82f6'],
  }
}
```

## Phase 3: Chat API Route

### 3.1 Create Chat Route

Create `app/api/chat/route.ts`:
```typescript
import { streamText } from 'ai'
import { defaultModel } from '@/lib/ai-config'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import * as budgetTools from '@/lib/ai/tools/budget-tools'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const { messages } = await req.json()
  
  const result = streamText({
    model: defaultModel,
    messages,
    system: `You are a helpful financial assistant for the ${session.user.familyName} family budget app.
    
    You can help with:
    - Adding and managing income sources
    - Adding and tracking expenses
    - Comparing budget scenarios
    - Analyzing spending patterns
    - Creating visualizations
    - Providing financial insights
    
    Current user: ${session.user.name}
    Family ID: ${session.user.familyId}
    
    Always be helpful, concise, and focus on actionable financial advice.`,
    tools: {
      getBudgetOverview: budgetTools.getBudgetOverview,
      addIncome: budgetTools.addIncome,
      addExpense: budgetTools.addExpense,
      compareScenarios: budgetTools.compareScenarios,
      generateChart: budgetTools.generateChart,
    },
    toolChoice: 'auto',
    maxSteps: 5,
    onStepFinish: async ({ toolCalls, toolResults }) => {
      // Log tool usage for debugging
      console.log('Tools executed:', toolCalls)
    },
  })
  
  return result.toDataStreamResponse()
}
```

## Phase 4: Chat UI Component

### 4.1 Main Chat Component (AI SDK v5 with @ai-sdk/react v2)

Create `components/ai-chat/chat.tsx`:
```typescript
'use client'

import { useChat } from '@ai-sdk/react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, X, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChartDisplay } from './chart-display'
import { ToolResult } from './tool-result'

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  
  // AI SDK v5 with @ai-sdk/react v2 pattern
  const { messages, sendMessage, status, error } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Chat error:', error)
    },
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    
    // AI SDK v5: sendMessage expects { text: string }
    await sendMessage({ text: inputValue })
    setInputValue('')
  }
  
  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        className="fixed bottom-4 right-4 p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 w-96 h-[600px] bg-white dark:bg-gray-900 rounded-lg shadow-2xl z-40 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-800 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <Bot size={20} />
                Budget Assistant
              </h3>
              <p className="text-sm opacity-90">Ask me about your finances</p>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <Bot size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Hi! I can help you manage your budget.</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <button
                      onClick={() => handleQuickAction("What's my current budget overview?")}
                      className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      📊 Show budget overview
                    </button>
                    <button
                      onClick={() => handleQuickAction("Add a new expense")}
                      className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      💸 Add an expense
                    </button>
                    <button
                      onClick={() => handleQuickAction("Compare my budget scenarios")}
                      className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      🔄 Compare scenarios
                    </button>
                  </div>
                </div>
              )}
              
              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
              
              {isLoading && (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="animate-pulse">●</div>
                  <div className="animate-pulse animation-delay-200">●</div>
                  <div className="animate-pulse animation-delay-400">●</div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded">
                  Error: {error.message}
                </div>
              )}
            </div>
            
            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about your budget..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Message({ message }: { message: any }) {
  const isUser = message.role === 'user'
  
  // AI SDK v5: Messages have parts array with text content
  const textContent = message.parts
    ?.filter((part: any) => part.type === 'text')
    .map((part: any) => part.text)
    .join('') || message.content || ''
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', isUser && 'flex-row-reverse')}
    >
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
      )}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      <div className={cn(
        'flex-1 px-4 py-2 rounded-lg',
        isUser 
          ? 'bg-purple-600 text-white' 
          : 'bg-gray-100 dark:bg-gray-800'
      )}>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {textContent}
        </div>
        
        {/* Tool Results - handle parts that are tool calls */}
        {message.parts?.map((part: any, i: number) => {
          if (part.type !== 'text' && part.type.startsWith('tool-')) {
            return <ToolResult key={i} invocation={part} />
          }
          return null
        })}
      </div>
    </motion.div>
  )
}
```

### 4.2 Tool Result Display

Create `components/ai-chat/tool-result.tsx`:
```typescript
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Check, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

export function ToolResult({ invocation }: { invocation: any }) {
  if (invocation.state === 'pending') {
    return (
      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="animate-pulse">Executing {invocation.toolName}...</div>
      </div>
    )
  }
  
  if (invocation.toolName === 'getBudgetOverview') {
    const result = invocation.result
    return (
      <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total Income</span>
          <span className="text-green-600 font-bold">${result.totalIncome.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total Expenses</span>
          <span className="text-red-600 font-bold">${result.totalExpenses.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between border-t pt-2">
          <span className="text-sm font-medium">Net Savings</span>
          <span className={result.netSavings >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
            ${result.netSavings.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Savings Rate</span>
          <span className="font-bold">{result.savingsRate.toFixed(1)}%</span>
        </div>
      </div>
    )
  }
  
  if (invocation.toolName === 'generateChart') {
    return <ChartDisplay data={invocation.result} />
  }
  
  if (invocation.toolName === 'addIncome' || invocation.toolName === 'addExpense') {
    return (
      <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-2">
        <Check className="text-green-600" size={20} />
        <span className="text-sm">Successfully added!</span>
      </div>
    )
  }
  
  if (invocation.toolName === 'compareScenarios') {
    return (
      <div className="mt-2 space-y-2">
        {invocation.result.map((scenario: any) => (
          <div key={scenario.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="font-medium">{scenario.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Income: ${scenario.totalIncome} | Expenses: ${scenario.totalExpenses}
            </div>
            <div className="text-sm font-medium mt-1">
              Net: <span className={scenario.netSavings >= 0 ? 'text-green-600' : 'text-red-600'}>
                ${scenario.netSavings}
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  return null
}
```

### 4.3 Chart Display Component

Create `components/ai-chat/chart-display.tsx`:
```typescript
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export function ChartDisplay({ data }: { data: any }) {
  const { type, data: chartData, config } = data
  
  if (type === 'income-expense') {
    return (
      <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" fill="#10b981" />
            <Bar dataKey="expenses" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }
  
  // Add more chart types as needed
  
  return null
}
```

## Phase 5: Integration

### 5.1 Add Chat to Dashboard

Update `app/(dashboard)/dashboard/page.tsx`:
```typescript
import { AIChat } from '@/components/ai-chat/chat'

export default function DashboardPage() {
  return (
    <div>
      {/* Existing dashboard content */}
      
      {/* Add AI Chat */}
      <AIChat />
    </div>
  )
}
```

### 5.2 Add Styles

Add to `app/globals.css`:
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-400 {
  animation-delay: 400ms;
}
```

## Phase 6: Advanced Features

### 6.1 Voice Input (Optional)

```typescript
// Add Web Speech API support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognition()

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript
  handleInputChange({ target: { value: transcript } })
}
```

### 6.2 Proactive Insights

```typescript
// Add scheduled insights
export async function generateDailyInsights(familyId: string) {
  const insights = await analyzeSpendingPatterns(familyId)
  // Send notifications or display in dashboard
}
```

### 6.3 Export Conversations

```typescript
export function exportChatHistory(messages: Message[]) {
  const content = messages.map(m => `${m.role}: ${m.content}`).join('\n')
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  // Trigger download
}
```

## Deployment Considerations

### Environment Variables

```env
# Production
OPENAI_API_KEY=sk-...
AI_RATE_LIMIT_PER_MINUTE=20
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7
```

### Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 m'),
})
```

### Error Handling

```typescript
try {
  const result = await streamText({...})
} catch (error) {
  if (error.code === 'rate_limit_exceeded') {
    return new Response('Rate limit exceeded', { status: 429 })
  }
  // Handle other errors
}
```

## Testing Checklist

- [ ] Test all tool functions with various inputs
- [ ] Verify authentication and authorization
- [ ] Test rate limiting
- [ ] Check mobile responsiveness
- [ ] Test with different LLM providers
- [ ] Verify data persistence
- [ ] Test error scenarios
- [ ] Check accessibility features

## Security Considerations

1. **Input Validation**: All tool parameters are validated with Zod
2. **SQL Injection**: Prisma ORM prevents SQL injection
3. **Rate Limiting**: Implement per-user rate limits
4. **Data Scoping**: All queries filtered by familyId
5. **API Key Security**: Store in environment variables
6. **CORS**: Configure appropriate CORS headers

## Phase 7: Chat Persistence and History Management

### Overview

Complete chat persistence system that saves all conversations to the database and automatically restores the last active conversation when users return. Users can manage multiple chat sessions with full history.

### 7.1 Database Schema

```prisma
// Chat conversations - stores entire chat sessions
model ChatConversation {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  familyId  String
  family    Family   @relation(fields: [familyId], references: [id], onDelete: Cascade)
  
  title     String?  // Auto-generated title or first message snippet
  messages  Json     // Store all messages with their parts
  metadata  Json?    // Store any additional metadata (model used, tokens, etc.)
  
  isActive  Boolean  @default(false) // Only one active chat per user
  lastMessageAt DateTime @default(now())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId, lastMessageAt])
  @@index([familyId])
  @@index([userId, isActive])
}
```

### 7.2 API Routes for Chat Management

```typescript
// app/api/chat/conversations/route.ts - List and create conversations
export async function GET(req: Request) {
  // Get all conversations for the user
  const conversations = await db.chatConversation.findMany({
    where: { userId: session.user.id },
    orderBy: { lastMessageAt: 'desc' },
    take: limit,
  })
  return NextResponse.json(conversations)
}

export async function POST(req: Request) {
  // Create new conversation and deactivate others
  await db.chatConversation.updateMany({
    where: { userId: session.user.id, isActive: true },
    data: { isActive: false },
  })
  
  const conversation = await db.chatConversation.create({
    data: {
      userId: session.user.id,
      familyId: session.user.familyId,
      title: title || 'New conversation',
      messages: messages || [],
      isActive: true,
    },
  })
  return NextResponse.json(conversation)
}

// app/api/chat/conversations/[id]/route.ts - Update specific conversation
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  // Update conversation with new messages
  const conversation = await db.chatConversation.update({
    where: { id: params.id, userId: session.user.id },
    data: {
      messages,
      title,
      metadata,
      lastMessageAt: new Date(),
    },
  })
  return NextResponse.json(conversation)
}

// app/api/chat/conversations/active/route.ts - Get/restore active conversation
export async function GET(req: Request) {
  // Get active conversation or most recent
  let conversation = await db.chatConversation.findFirst({
    where: { userId: session.user.id, isActive: true },
  })
  
  if (!conversation) {
    // Get most recent and mark as active
    conversation = await db.chatConversation.findFirst({
      where: { userId: session.user.id },
      orderBy: { lastMessageAt: 'desc' },
    })
    if (conversation) {
      await db.chatConversation.update({
        where: { id: conversation.id },
        data: { isActive: true },
      })
    }
  }
  
  return NextResponse.json(conversation)
}
```

### 7.3 Persistent Chat Hook

```typescript
// lib/hooks/use-persistent-chat.ts
import { useChat } from '@ai-sdk/react'
import { useEffect, useRef, useState } from 'react'
import { useDebounce } from './use-debounce'

export function usePersistentChat(options: PersistentChatOptions = {}) {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([])
  
  // Use regular useChat with initial messages
  const chatProps = useChat({
    api: options.api || '/api/chat',
    id: conversationId || undefined,
    initialMessages,
    onError: options.onError,
  })
  
  const { messages } = chatProps
  const debouncedMessages = useDebounce(messages, 2000)
  
  // Load active conversation on mount
  useEffect(() => {
    loadActiveConversation()
  }, [])
  
  // Auto-save messages when they change (debounced)
  useEffect(() => {
    if (debouncedMessages.length > 0) {
      if (!conversationId) {
        createConversationForMessages()
      } else {
        saveConversation()
      }
    }
  }, [debouncedMessages, conversationId])
  
  const loadActiveConversation = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/chat/conversations/active')
      
      if (response.ok) {
        const conversation = await response.json()
        if (conversation) {
          setConversationId(conversation.id)
          if (conversation.messages) {
            setInitialMessages(conversation.messages)
            // Messages will be loaded via initialMessages in useChat
          }
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const saveConversation = async () => {
    if (!conversationId || messages.length === 0) return
    
    try {
      setIsSaving(true)
      
      // Extract title from first user message
      const firstUserMessage = messages.find(m => m.role === 'user')
      let title = 'New conversation'
      if (firstUserMessage?.parts) {
        const textPart = firstUserMessage.parts.find(p => p.type === 'text')
        title = textPart?.text?.slice(0, 100) || title
      }
      
      await fetch(`/api/chat/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, title }),
      })
    } catch (error) {
      console.error('Error saving conversation:', error)
    } finally {
      setIsSaving(false)
    }
  }
  
  const newConversation = async () => {
    const response = await fetch('/api/chat/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [], title: 'New conversation' }),
    })
    
    if (response.ok) {
      const conversation = await response.json()
      setConversationId(conversation.id)
      setInitialMessages([])
      return conversation
    }
  }
  
  const loadConversation = async (id: string) => {
    // Mark as active and load
    await fetch(`/api/chat/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: true }),
    })
    
    const response = await fetch(`/api/chat/conversations/${id}`)
    if (response.ok) {
      const conversation = await response.json()
      setConversationId(conversation.id)
      setInitialMessages(conversation.messages || [])
      return conversation
    }
  }
  
  return {
    ...chatProps,
    conversationId,
    isLoading,
    isSaving,
    newConversation,
    loadConversation,
    deleteConversation,
    getConversations,
  }
}
```

### 7.4 Enhanced Chat UI with History Management

```typescript
// components/ai-chat/chat.tsx
import { usePersistentChat } from '@/lib/hooks/use-persistent-chat'
import { Plus, History, Trash2 } from 'lucide-react'

export function AIChat() {
  const [showHistory, setShowHistory] = useState(false)
  const [conversations, setConversations] = useState<any[]>([])
  
  const { 
    messages, 
    append, 
    status,
    conversationId,
    isLoading: isLoadingConversation,
    isSaving,
    newConversation,
    loadConversation,
    deleteConversation,
    getConversations,
  } = usePersistentChat({
    api: '/api/chat',
  })
  
  return (
    <>
      {/* Chat Header with Controls */}
      <div className="flex items-center gap-1">
        {/* New Chat Button */}
        <button
          onClick={async () => {
            await newConversation()
            setShowHistory(false)
          }}
          className="p-2 hover:bg-white/20 rounded-lg"
          title="New conversation"
        >
          <Plus size={18} />
        </button>
        
        {/* History Button */}
        <button
          onClick={async () => {
            const convs = await getConversations(10)
            setConversations(convs)
            setShowHistory(!showHistory)
          }}
          className="p-2 hover:bg-white/20 rounded-lg"
          title="Chat history"
        >
          <History size={18} />
        </button>
        
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isSaving ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
          }`} />
          <span className="text-xs">
            {isSaving ? 'Saving...' : 'Saved'}
          </span>
        </div>
      </div>
      
      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div className="border-b bg-white overflow-hidden">
            <div className="p-3 max-h-48 overflow-y-auto">
              <div className="text-xs font-medium mb-2">Recent Conversations</div>
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer",
                    conv.id === conversationId && "bg-purple-100"
                  )}
                  onClick={() => {
                    loadConversation(conv.id)
                    setShowHistory(false)
                  }}
                >
                  <MessageSquare size={14} />
                  <div className="flex-1">
                    <div className="text-sm truncate">
                      {conv.title || 'Untitled'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(conv.lastMessageAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      if (confirm('Delete?')) {
                        await deleteConversation(conv.id)
                        setConversations(await getConversations(10))
                      }
                    }}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Messages */}
      {/* ... existing message display ... */}
    </>
  )
}
```

### 7.5 Key Features

1. **Automatic Persistence**: Messages are automatically saved every 2 seconds (debounced)
2. **Session Restoration**: Last active conversation is restored on page load
3. **Multiple Conversations**: Users can have unlimited chat histories
4. **History Management**: View, switch between, and delete conversations
5. **Title Generation**: Automatically uses first message as conversation title
6. **Visual Indicators**: Shows saving status and active conversation

### 7.6 Implementation Checklist

- [x] Database schema with ChatConversation model
- [x] API routes for CRUD operations on conversations
- [x] Active conversation endpoint for auto-restore
- [x] Custom hook for persistent chat (usePersistentChat)
- [x] Debounced auto-save functionality
- [x] UI controls for new chat and history
- [x] History panel with conversation list
- [x] Delete conversation functionality
- [x] Visual indicators for save status
- [x] Automatic title generation from first message

## Phase 8: AI-Powered Onboarding

### Overview

An intelligent onboarding flow that uses conversational AI to gather family information and automatically set up an initial budget based on the collected data.

### 7.1 Database Schema

```prisma
model FamilyOnboarding {
  id                String   @id @default(cuid())
  familyId          String   @unique
  family            Family   @relation(fields: [familyId], references: [id])
  
  // Family composition
  adultsCount       Int?
  childrenCount     Int?
  childrenAges      Json?    // Array of ages
  
  // Financial overview
  primaryIncome     Decimal?
  secondaryIncome   Decimal?
  otherIncome       Decimal?
  hasInvestments    Boolean  @default(false)
  investmentTypes   Json?    // Array of investment types
  monthlyInvestmentAmount Decimal?
  
  // Housing
  housingType       String?  // rent, mortgage, owned
  housingCost       Decimal?
  
  // Goals and preferences
  savingsGoal       Decimal?
  financialGoals    Json?    // Array of goals
  budgetPriorities  Json?    // Array of priorities
  
  // Conversation history
  conversations     OnboardingConversation[]
  
  completedAt       DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model OnboardingConversation {
  id             String   @id @default(cuid())
  onboardingId   String
  onboarding     FamilyOnboarding @relation(fields: [onboardingId], references: [id])
  
  role           String   // 'user' or 'assistant'
  content        String   @db.Text
  metadata       Json?    // Store extracted entities, intents
  
  createdAt      DateTime @default(now())
  
  @@index([onboardingId])
}
```

### 7.2 Onboarding Flow

```typescript
// Onboarding stages
enum OnboardingStage {
  WELCOME = 'welcome',
  FAMILY_COMPOSITION = 'family_composition',
  INCOME_SOURCES = 'income_sources',
  HOUSING_EXPENSES = 'housing_expenses',
  REGULAR_EXPENSES = 'regular_expenses',
  INVESTMENTS_SAVINGS = 'investments_savings',
  FINANCIAL_GOALS = 'financial_goals',
  BUDGET_CREATION = 'budget_creation',
  COMPLETE = 'complete'
}

// Sample conversation flow
const onboardingQuestions = {
  welcome: [
    "Hi! I'm your AI budget assistant. I'll help you set up your family budget in just a few minutes.",
    "What should I call your family? (e.g., 'The Smith Family')"
  ],
  family_composition: [
    "Tell me about your family. How many adults and children are in your household?",
    "If you have children, what are their ages? This helps me suggest appropriate expense categories."
  ],
  income_sources: [
    "Let's talk about income. What's your family's primary monthly income?",
    "Do you have any additional income sources? (side jobs, rental income, investments, etc.)"
  ],
  housing_expenses: [
    "Now for housing - do you rent, have a mortgage, or own your home outright?",
    "What's your monthly housing cost (rent/mortgage, HOA, property tax)?"
  ],
  regular_expenses: [
    "What are your typical monthly expenses? I'll suggest some common categories:",
    "• Utilities (electricity, water, gas, internet)",
    "• Transportation (car payments, insurance, fuel)",
    "• Food (groceries, dining out)",
    "• Insurance (health, life)",
    "You can just give me rough estimates."
  ],
  investments_savings: [
    "Do you currently save or invest money each month?",
    "What types of investments do you have? (401k, stocks, real estate, etc.)"
  ],
  financial_goals: [
    "What are your top financial goals?",
    "• Building emergency fund",
    "• Saving for retirement",
    "• Children's education",
    "• Buying a home",
    "• Paying off debt",
    "• Taking a vacation"
  ],
  budget_creation: [
    "Based on what you've told me, I'll create your initial budget with:",
    "• Monthly income: $X",
    "• Fixed expenses: $Y",
    "• Savings goal: $Z",
    "Should I proceed with creating this budget?"
  ]
}
```

### 7.3 Onboarding Tools

```typescript
export const extractFamilyInfo = tool({
  description: 'Extract and structure family information from conversation',
  parameters: z.object({
    text: z.string().describe('User input to parse'),
    stage: z.enum(['family', 'income', 'housing', 'expenses', 'goals']),
  }),
  execute: async ({ text, stage }) => {
    // Use NLP to extract entities based on stage
    // Return structured data
  }
})

export const createInitialBudget = tool({
  description: 'Create initial budget from onboarding data',
  parameters: z.object({
    onboardingId: z.string(),
  }),
  execute: async ({ onboardingId }) => {
    const onboarding = await db.familyOnboarding.findUnique({
      where: { id: onboardingId },
      include: { family: true }
    })
    
    // Create MonthlyOverview
    const overview = await db.monthlyOverview.create({
      data: {
        familyId: onboarding.familyId,
        name: 'Initial Budget',
        isActive: true,
      }
    })
    
    // Add income sources
    if (onboarding.primaryIncome) {
      await db.income.create({
        data: {
          overviewId: overview.id,
          name: 'Primary Income',
          amount: onboarding.primaryIncome,
          type: 'salary',
          frequency: 'monthly',
          monthlyAmount: onboarding.primaryIncome,
        }
      })
    }
    
    // Add expense categories
    const categories = await createDefaultCategories(onboarding.familyId)
    
    // Add housing expense
    if (onboarding.housingCost) {
      await db.userExpense.create({
        data: {
          overviewId: overview.id,
          categoryId: categories.housing.id,
          name: onboarding.housingType === 'rent' ? 'Rent' : 'Mortgage',
          amount: onboarding.housingCost,
        }
      })
    }
    
    return { success: true, overviewId: overview.id }
  }
})

export const suggestExpenseCategories = tool({
  description: 'Suggest expense categories based on family profile',
  parameters: z.object({
    adultsCount: z.number(),
    childrenCount: z.number(),
    childrenAges: z.array(z.number()).optional(),
    housingType: z.string(),
  }),
  execute: async (params) => {
    const suggestions = []
    
    // Base categories for all families
    suggestions.push(
      { category: 'Housing', items: ['Rent/Mortgage', 'Insurance', 'Maintenance'] },
      { category: 'Utilities', items: ['Electricity', 'Water', 'Gas', 'Internet'] },
      { category: 'Food', items: ['Groceries', 'Dining Out'] },
      { category: 'Transportation', items: ['Car Payment', 'Insurance', 'Fuel'] }
    )
    
    // Add child-specific categories
    if (params.childrenCount > 0) {
      suggestions.push(
        { category: 'Childcare', items: ['Daycare', 'Babysitting', 'After-school'] },
        { category: 'Education', items: ['School Supplies', 'Tuition', 'Activities'] }
      )
      
      // Age-specific suggestions
      const hasTeens = params.childrenAges?.some(age => age >= 13)
      if (hasTeens) {
        suggestions.push(
          { category: 'Teen Expenses', items: ['Allowance', 'Phone', 'Activities'] }
        )
      }
    }
    
    return suggestions
  }
})
```

### 7.4 Onboarding API Route

```typescript
// app/api/onboarding/route.ts
import { streamText } from 'ai'
import { getAIModel } from '@/lib/ai-config'
import * as onboardingTools from '@/lib/ai/tools/onboarding-tools'

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
  
  const result = streamText({
    model: getAIModel(),
    messages,
    system: `You are a friendly financial advisor helping a family set up their first budget.
    
    Current stage: ${stage}
    Family ID: ${session.user.familyId}
    Onboarding ID: ${onboarding.id}
    
    Guidelines:
    - Be conversational and friendly
    - Ask one question at a time
    - Validate and confirm information before proceeding
    - Suggest reasonable defaults based on family size
    - Extract and store all relevant information
    - Create a comprehensive initial budget at the end`,
    tools: {
      extractFamilyInfo: onboardingTools.extractFamilyInfo,
      createInitialBudget: onboardingTools.createInitialBudget,
      suggestExpenseCategories: onboardingTools.suggestExpenseCategories,
    },
  })
  
  // Store conversation
  await db.onboardingConversation.create({
    data: {
      onboardingId: onboarding.id,
      role: 'user',
      content: messages[messages.length - 1].content,
    }
  })
  
  return result.toTextStreamResponse()
}
```

### 7.5 Onboarding UI Component

```typescript
// components/ai-onboarding/onboarding.tsx
'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { motion, AnimatePresence } from 'framer-motion'
import { DefaultChatTransport } from 'ai'

const ONBOARDING_STAGES = [
  'welcome',
  'family_composition', 
  'income_sources',
  'housing_expenses',
  'regular_expenses',
  'investments_savings',
  'financial_goals',
  'budget_creation',
  'complete'
]

export function AIOnboarding({ onComplete }: { onComplete: () => void }) {
  const [currentStage, setCurrentStage] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  
  const transport = new DefaultChatTransport({ 
    api: '/api/onboarding',
    headers: {
      'X-Onboarding-Stage': ONBOARDING_STAGES[currentStage]
    }
  })
  
  const { messages, sendMessage, status } = useChat({
    transport,
    initialMessages: [{
      id: '1',
      role: 'assistant',
      content: "Welcome! I'm here to help you set up your family budget. This will only take a few minutes. Let's start with your family name - what should I call your family?"
    }]
  })
  
  const handleResponse = async (response: string) => {
    await sendMessage({ content: response, role: 'user' })
    
    // Progress to next stage based on completion
    if (currentStage < ONBOARDING_STAGES.length - 1) {
      setTimeout(() => setCurrentStage(prev => prev + 1), 1000)
    } else {
      onComplete()
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <ProgressBar current={currentStage} total={ONBOARDING_STAGES.length} />
      
      <div className="mt-8 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <OnboardingMessage 
              key={message.id} 
              message={message}
              isLatest={index === messages.length - 1}
            />
          ))}
        </AnimatePresence>
        
        {status === 'streaming' && <TypingIndicator />}
      </div>
      
      <QuickResponseButtons 
        stage={ONBOARDING_STAGES[currentStage]}
        onSelect={handleResponse}
        disabled={status === 'streaming'}
      />
      
      <OnboardingInput 
        onSubmit={handleResponse}
        disabled={status === 'streaming'}
      />
    </div>
  )
}
```

## Performance Optimization

1. **Streaming**: Use streaming for real-time responses
2. **Caching**: Cache frequent queries (budget overviews)
3. **Database Indexes**: Already configured in schema
4. **Lazy Loading**: Load chat component on demand
5. **Token Optimization**: Limit context window size
6. **Onboarding Context**: Store and reuse onboarding data for personalized assistance

## Estimated Timeline

- **Phase 1-2**: 2-3 days (Setup and tool implementation)
- **Phase 3-4**: 2-3 days (API and UI components)
- **Phase 5**: 1 day (Integration)
- **Phase 6**: 2-3 days (Advanced features)
- **Testing**: 2 days
- **Total**: ~10-12 days

## AI SDK v5 Key Patterns and Common Issues

### useChat Hook API (Based on Context7 Documentation)

The `useChat` hook from `@ai-sdk/react` v2 has specific patterns:

```typescript
// Correct patterns for AI SDK v5 with @ai-sdk/react v2
const { messages, sendMessage, status, error } = useChat({
  api: '/api/chat',
})

// Sending messages - use { text: string }
await sendMessage({ text: 'Hello AI' })

// Message structure
// Messages have a parts array:
message.parts = [
  { type: 'text', text: 'Content here' },
  { type: 'tool-xxx', ...toolData }
]

// Status values
status: 'ready' | 'streaming' | 'error'
```

### Common Migration Issues from Older Versions

1. **sendMessage API Change**: 
   - Old: `sendMessage({ content: 'text', role: 'user' })`
   - New: `sendMessage({ text: 'text' })`

2. **Message Content Access**:
   - Messages use `parts` array, not direct `content`
   - Extract text: `message.parts.filter(p => p.type === 'text').map(p => p.text).join('')`

3. **Status Property**:
   - Use `status` instead of `isLoading`
   - Check: `status === 'streaming'` for loading state

### Context7 MCP for Documentation

To get up-to-date AI SDK documentation:

```typescript
// Use Context7 MCP to retrieve documentation
// 1. Resolve library ID
mcp__context7__resolve-library-id({ libraryName: '@ai-sdk/react' })

// 2. Get documentation
mcp__context7__get-library-docs({ 
  context7CompatibleLibraryID: '/vercel/ai',
  topic: 'useChat react hooks',
  tokens: 10000 
})
```

## Resources

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [AI SDK v5 Migration Guide](https://sdk.vercel.ai/docs/migrations/v5)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- Context7 MCP - For retrieving up-to-date library documentation

## Next Steps

1. Review and approve the implementation plan
2. Set up API keys for chosen LLM provider
3. Start with Phase 1 basic setup
4. Implement core tool functions
5. Build and test incrementally
6. Gather user feedback and iterate