# AI-Powered Budget Analysis Feature Guide

## Overview

This guide outlines the implementation of an always-on AI analysis system that automatically analyzes family budgets whenever changes occur. The AI provides real-time insights, anomaly detection, expense suggestions, and financial recommendations directly integrated into the dashboard UI.

## Core Features

### 1. Real-Time Budget Analysis
- **Automatic Triggers**: Analysis runs when budget data changes (income/expense modifications)
- **Comprehensive Analysis**: AI evaluates entire budget structure, spending patterns, and financial health
- **Smart Caching**: Results cached with intelligent invalidation to minimize API costs
- **Rate Limiting**: Configurable limits to prevent excessive API usage

### 2. Analysis Types

#### 2.1 Budget Summary
- Concise overview of financial health
- Key insights about spending patterns
- Actionable recommendations
- Display location: Top of dashboard as a card

#### 2.2 Anomaly Detection
- Identifies unusual expenses or patterns
- Flags potential missing expenses
- Warns about budget imbalances
- Display: Warning icons next to flagged items

#### 2.3 Expense Suggestions
- Suggests commonly forgotten expenses
- Recommends typical expenses based on family profile
- Proposes budget optimizations
- Display: Suggestion cards in dashboard

#### 2.4 Category Analysis
- Deep dive into spending by category
- Comparison with typical families
- Optimization opportunities
- Display: Enhanced category cards with insights

#### 2.5 Trend Analysis
- Month-over-month comparisons
- Seasonal pattern detection
- Future projections
- Display: Interactive charts with AI annotations

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Dashboard Component                       │
├─────────────────────────────────────────────────────────────┤
│  AI Summary Card  │  Expense Items  │  Category Cards       │
│  (with insights)  │  (with warnings) │  (with analysis)      │
├─────────────────────────────────────────────────────────────┤
│                    Analysis Hook System                       │
│  useAIAnalysis()  │  useAnomalyDetection()  │  useSuggestions()
├─────────────────────────────────────────────────────────────┤
│                    Analysis Trigger System                    │
│  Budget Change Listener  →  Debounced Analysis Queue         │
├─────────────────────────────────────────────────────────────┤
│                    AI Analysis Engine                         │
│  Context Builder  →  LLM Processing  →  Result Parser        │
├─────────────────────────────────────────────────────────────┤
│                    Caching & Storage Layer                    │
│  Redis/Memory Cache  │  Database Storage  │  Invalidation    │
├─────────────────────────────────────────────────────────────┤
│                    Family Profile System                      │
│  Demographics  │  Location  │  Preferences  │  History       │
└─────────────────────────────────────────────────────────────┘
```

## Phase 1: Database Schema

### 1.1 Family Profile Extension

```prisma
model FamilyProfile {
  id                String   @id @default(cuid())
  familyId          String   @unique
  family            Family   @relation(fields: [familyId], references: [id], onDelete: Cascade)
  
  // Demographics
  country           String?
  state             String?
  city              String?
  zipCode           String?
  adultsCount       Int      @default(2)
  childrenCount     Int      @default(0)
  childrenAges      Json?    // Array of ages
  petsCount         Int      @default(0)
  petTypes          Json?    // Array of pet types
  
  // Living situation
  housingType       String?  // apartment, house, condo, etc.
  housingSize       String?  // studio, 1br, 2br, 3br, 4br+
  ownsCar           Boolean  @default(true)
  carsCount         Int      @default(1)
  carTypes          Json?    // Array of car types (sedan, suv, etc.)
  
  // Employment & Income
  employmentTypes   Json?    // Array of employment types per adult
  industryTypes     Json?    // Array of industries
  incomeStability   String?  // stable, variable, seasonal
  
  // Financial preferences
  riskTolerance     String?  // conservative, moderate, aggressive
  savingsGoalType   String?  // emergency, retirement, vacation, etc.
  budgetPriorities  Json?    // Ordered list of priorities
  
  // Lifestyle
  dietaryPreferences Json?   // vegetarian, vegan, etc.
  hobbies           Json?    // List of family hobbies
  travelFrequency   String?  // never, rarely, occasionally, frequently
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([familyId])
}

model BudgetAnalysis {
  id                String   @id @default(cuid())
  familyId          String
  family            Family   @relation(fields: [familyId], references: [id], onDelete: Cascade)
  overviewId        String
  overview          MonthlyOverview @relation(fields: [overviewId], references: [id], onDelete: Cascade)
  
  // Analysis metadata
  analysisType      String   // summary, anomaly, suggestion, category, trend
  triggerType       String   // manual, auto, scheduled
  modelUsed         String   // gpt-4o, claude-3.5, etc.
  tokensUsed        Int?
  processingTimeMs  Int?
  
  // Analysis results
  summary           String?  @db.Text
  insights          Json     // Array of insight objects
  anomalies         Json?    // Array of detected anomalies
  suggestions       Json?    // Array of suggestions
  warnings          Json?    // Array of warnings
  metrics           Json?    // Calculated metrics and scores
  
  // Caching
  expiresAt         DateTime // When this analysis becomes stale
  isActive          Boolean  @default(true)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([familyId, overviewId])
  @@index([familyId, analysisType, isActive])
  @@index([expiresAt])
}

model AnalysisInteraction {
  id                String   @id @default(cuid())
  analysisId        String
  analysis          BudgetAnalysis @relation(fields: [analysisId], references: [id], onDelete: Cascade)
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  
  interactionType   String   // viewed, dismissed, applied, shared
  feedback          String?  // helpful, not_helpful, wrong
  feedbackText      String?  @db.Text
  
  createdAt         DateTime @default(now())
  
  @@index([analysisId])
  @@index([userId])
}

model ExpenseTemplate {
  id                String   @id @default(cuid())
  
  // Template matching criteria
  country           String?
  state             String?
  familySize        Int?
  hasChildren       Boolean?
  hasPets          Boolean?
  housingType       String?
  
  // Template data
  name              String
  categoryName      String
  typicalAmountMin  Decimal  @db.Decimal(10, 2)
  typicalAmountMax  Decimal  @db.Decimal(10, 2)
  frequency         String   // monthly, quarterly, yearly
  priority          Int      // 1-10, higher = more essential
  description       String?  @db.Text
  
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([country, state])
  @@index([housingType])
  @@index([priority])
}
```

## Phase 2: AI Analysis Engine

### 2.1 Core Analysis Service

```typescript
// lib/ai/analysis/budget-analyzer.ts
import { streamObject } from 'ai'
import { z } from 'zod'
import { defaultModel } from '@/lib/ai-config'
import { db } from '@/lib/db'

// Analysis result schemas
const BudgetSummarySchema = z.object({
  healthScore: z.number().min(0).max(100),
  mainInsight: z.string(),
  keyStrengths: z.array(z.string()).max(3),
  keyWeaknesses: z.array(z.string()).max(3),
  topRecommendation: z.string(),
  savingsPotential: z.number().optional(),
})

const AnomalySchema = z.object({
  expenseId: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.enum(['missing', 'unusual_amount', 'duplicate', 'category_mismatch']),
  severity: z.enum(['low', 'medium', 'high']),
  description: z.string(),
  suggestedAction: z.string(),
})

const ExpenseSuggestionSchema = z.object({
  name: z.string(),
  category: z.string(),
  estimatedAmount: z.number(),
  reason: z.string(),
  priority: z.enum(['essential', 'recommended', 'optional']),
})

export class BudgetAnalyzer {
  private familyProfile: FamilyProfile | null = null
  private analysisCache = new Map<string, BudgetAnalysis>()
  
  constructor(private familyId: string) {}
  
  async initialize() {
    this.familyProfile = await db.familyProfile.findUnique({
      where: { familyId: this.familyId }
    })
  }
  
  async analyzeFullBudget(overviewId: string) {
    // Check cache first
    const cacheKey = `${this.familyId}-${overviewId}-full`
    const cached = await this.getCachedAnalysis(cacheKey)
    if (cached) return cached
    
    // Gather all budget data
    const overview = await db.monthlyOverview.findUnique({
      where: { id: overviewId },
      include: {
        incomes: true,
        userExpenses: {
          include: {
            category: true,
            user: true,
          }
        }
      }
    })
    
    if (!overview) throw new Error('Overview not found')
    
    // Get expense templates for comparison
    const templates = await this.getRelevantTemplates()
    
    // Build context for AI
    const context = this.buildAnalysisContext(overview, templates)
    
    // Perform parallel analyses
    const [summary, anomalies, suggestions] = await Promise.all([
      this.generateSummary(context),
      this.detectAnomalies(context),
      this.generateSuggestions(context),
    ])
    
    // Store analysis results
    const analysis = await db.budgetAnalysis.create({
      data: {
        familyId: this.familyId,
        overviewId,
        analysisType: 'full',
        triggerType: 'auto',
        modelUsed: 'gpt-4o',
        summary: summary.mainInsight,
        insights: {
          summary,
          topAnomalies: anomalies.slice(0, 5),
          topSuggestions: suggestions.slice(0, 5),
        },
        anomalies,
        suggestions,
        metrics: {
          healthScore: summary.healthScore,
          savingsPotential: summary.savingsPotential,
          anomalyCount: anomalies.length,
          suggestionCount: suggestions.length,
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isActive: true,
      }
    })
    
    // Cache the result
    this.cacheAnalysis(cacheKey, analysis)
    
    return analysis
  }
  
  private async generateSummary(context: AnalysisContext): Promise<BudgetSummary> {
    const { object } = await streamObject({
      model: defaultModel,
      schema: BudgetSummarySchema,
      system: `You are a personal finance advisor analyzing a family budget.
      
      Family Profile:
      - Location: ${context.profile?.city}, ${context.profile?.state}
      - Adults: ${context.profile?.adultsCount}, Children: ${context.profile?.childrenCount}
      - Housing: ${context.profile?.housingType}
      - Priorities: ${JSON.stringify(context.profile?.budgetPriorities)}
      
      Analyze the budget and provide:
      1. A health score (0-100) based on income/expense ratio, savings rate, and balance
      2. One main insight about their financial situation
      3. Up to 3 key strengths and weaknesses
      4. The most important recommendation
      5. Potential monthly savings amount if recommendations are followed`,
      
      prompt: `Budget Data:
      Total Income: $${context.totalIncome}
      Total Expenses: $${context.totalExpenses}
      Net Savings: $${context.netSavings}
      Savings Rate: ${context.savingsRate}%
      
      Expense Breakdown:
      ${context.categoryBreakdown}
      
      Typical Family Comparison:
      ${context.templateComparison}`,
    })
    
    return object
  }
  
  private async detectAnomalies(context: AnalysisContext): Promise<Anomaly[]> {
    const { object } = await streamObject({
      model: defaultModel,
      schema: z.object({
        anomalies: z.array(AnomalySchema)
      }),
      system: `You are a financial anomaly detection system.
      
      Detect the following types of anomalies:
      1. Missing expenses that typical families have
      2. Unusual amounts (too high or too low for category)
      3. Potential duplicates
      4. Miscategorized expenses
      
      Family context:
      ${JSON.stringify(context.profile)}`,
      
      prompt: `Current Expenses:
      ${JSON.stringify(context.expenses)}
      
      Typical Expenses for Similar Families:
      ${JSON.stringify(context.templates)}
      
      Find anomalies and rate their severity.`,
    })
    
    return object.anomalies
  }
  
  private async generateSuggestions(context: AnalysisContext): Promise<ExpenseSuggestion[]> {
    const { object } = await streamObject({
      model: defaultModel,
      schema: z.object({
        suggestions: z.array(ExpenseSuggestionSchema)
      }),
      system: `You are a budget optimization expert.
      
      Suggest missing or recommended expenses based on:
      1. Family composition and location
      2. Typical expenses for similar families
      3. Financial best practices
      4. Safety and wellbeing priorities
      
      Family has ${context.profile?.childrenCount} children ages ${context.profile?.childrenAges}
      Lives in ${context.profile?.city}, ${context.profile?.state}
      Housing type: ${context.profile?.housingType}`,
      
      prompt: `Current budget categories:
      ${context.existingCategories}
      
      Templates for similar families:
      ${JSON.stringify(context.templates)}
      
      Suggest missing essential expenses and optimizations.`,
    })
    
    return object.suggestions
  }
  
  private buildAnalysisContext(overview: any, templates: any[]): AnalysisContext {
    const totalIncome = overview.incomes.reduce((sum: number, inc: any) => 
      sum + Number(inc.monthlyAmount), 0)
    const totalExpenses = overview.userExpenses.reduce((sum: number, exp: any) => 
      sum + Number(exp.amount), 0)
    
    const categoryBreakdown = this.getCategoryBreakdown(overview.userExpenses)
    const existingCategories = [...new Set(overview.userExpenses.map((e: any) => 
      e.category.name))]
    
    return {
      profile: this.familyProfile,
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
      expenses: overview.userExpenses,
      categoryBreakdown,
      existingCategories,
      templates,
      templateComparison: this.compareWithTemplates(overview.userExpenses, templates),
    }
  }
  
  private async getRelevantTemplates(): Promise<ExpenseTemplate[]> {
    return db.expenseTemplate.findMany({
      where: {
        OR: [
          { country: this.familyProfile?.country },
          { state: this.familyProfile?.state },
          { housingType: this.familyProfile?.housingType },
          { hasChildren: (this.familyProfile?.childrenCount ?? 0) > 0 },
          { hasPets: (this.familyProfile?.petsCount ?? 0) > 0 },
        ],
        isActive: true,
      },
      orderBy: { priority: 'desc' },
      take: 50,
    })
  }
}
```

### 2.2 Analysis Trigger System

```typescript
// lib/ai/analysis/trigger-system.ts
import { BudgetAnalyzer } from './budget-analyzer'
import { Queue } from 'bullmq'
import { Redis } from 'ioredis'

export class AnalysisTriggerSystem {
  private analysisQueue: Queue
  private debounceTimers = new Map<string, NodeJS.Timeout>()
  private DEBOUNCE_DELAY = 5000 // 5 seconds
  private RATE_LIMIT_PER_HOUR = 10
  
  constructor() {
    const redis = new Redis(process.env.REDIS_URL!)
    this.analysisQueue = new Queue('budget-analysis', {
      connection: redis,
    })
  }
  
  async triggerAnalysis(familyId: string, overviewId: string, triggerType: 'manual' | 'auto' = 'auto') {
    const key = `${familyId}-${overviewId}`
    
    // Clear existing debounce timer
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key)!)
    }
    
    // Check rate limit
    const canAnalyze = await this.checkRateLimit(familyId)
    if (!canAnalyze && triggerType === 'auto') {
      console.log(`Rate limit exceeded for family ${familyId}`)
      return
    }
    
    // Set new debounce timer
    const timer = setTimeout(async () => {
      await this.analysisQueue.add('analyze-budget', {
        familyId,
        overviewId,
        triggerType,
        timestamp: Date.now(),
      })
      this.debounceTimers.delete(key)
    }, triggerType === 'manual' ? 0 : this.DEBOUNCE_DELAY)
    
    this.debounceTimers.set(key, timer)
  }
  
  private async checkRateLimit(familyId: string): Promise<boolean> {
    const key = `rate-limit:${familyId}`
    const hourAgo = Date.now() - 60 * 60 * 1000
    
    // Get recent analysis count
    const recentAnalyses = await db.budgetAnalysis.count({
      where: {
        familyId,
        createdAt: { gte: new Date(hourAgo) },
      },
    })
    
    return recentAnalyses < this.RATE_LIMIT_PER_HOUR
  }
}

// Worker to process analysis queue
export async function startAnalysisWorker() {
  const worker = new Worker(
    'budget-analysis',
    async (job) => {
      const { familyId, overviewId } = job.data
      
      const analyzer = new BudgetAnalyzer(familyId)
      await analyzer.initialize()
      const results = await analyzer.analyzeFullBudget(overviewId)
      
      // Notify via WebSocket or Server-Sent Events
      await notifyDashboard(familyId, results)
      
      return results
    },
    {
      connection: new Redis(process.env.REDIS_URL!),
      concurrency: 5,
    }
  )
  
  worker.on('failed', (job, err) => {
    console.error(`Analysis job ${job?.id} failed:`, err)
  })
}
```

## Phase 3: Dashboard Integration

### 3.1 Analysis Hooks

```typescript
// lib/hooks/use-ai-analysis.ts
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { useDebounce } from './use-debounce'

export function useAIAnalysis(overviewId: string | null) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Fetch latest analysis
  const { data: analysis, error, mutate } = useSWR(
    overviewId ? `/api/analysis/${overviewId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!overviewId) return
    
    const eventSource = new EventSource(`/api/analysis/stream/${overviewId}`)
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'analysis-complete') {
        mutate()
        setIsAnalyzing(false)
      } else if (data.type === 'analysis-started') {
        setIsAnalyzing(true)
      }
    }
    
    return () => eventSource.close()
  }, [overviewId, mutate])
  
  const triggerAnalysis = async () => {
    if (!overviewId || isAnalyzing) return
    
    setIsAnalyzing(true)
    try {
      await fetch(`/api/analysis/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overviewId }),
      })
    } catch (error) {
      console.error('Failed to trigger analysis:', error)
      setIsAnalyzing(false)
    }
  }
  
  return {
    analysis,
    isAnalyzing,
    error,
    triggerAnalysis,
    refresh: mutate,
  }
}

export function useAnomalyDetection(expenses: any[]) {
  const [anomalies, setAnomalies] = useState<Map<string, Anomaly>>(new Map())
  
  useEffect(() => {
    if (!expenses || expenses.length === 0) return
    
    // Fetch anomalies for these expenses
    fetch('/api/analysis/anomalies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expenseIds: expenses.map(e => e.id) }),
    })
      .then(res => res.json())
      .then(data => {
        const anomalyMap = new Map()
        data.anomalies.forEach((a: Anomaly) => {
          if (a.expenseId) {
            anomalyMap.set(a.expenseId, a)
          }
        })
        setAnomalies(anomalyMap)
      })
  }, [expenses])
  
  return anomalies
}
```

### 3.2 Dashboard Components

```typescript
// components/dashboard/ai-summary-card.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react'
import { CardSpotlight } from '@/components/ui/aceternity'

export function AISummaryCard({ analysis }: { analysis: BudgetAnalysis | null }) {
  if (!analysis) return <AISummaryCardSkeleton />
  
  const summary = analysis.insights.summary
  const healthColor = summary.healthScore > 70 ? 'green' : 
                      summary.healthScore > 40 ? 'yellow' : 'red'
  
  return (
    <CardSpotlight className="relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Brain className="w-3 h-3" />
          AI Analysis
        </div>
      </div>
      
      <div className="p-6">
        {/* Health Score */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Budget Health</h3>
          <HealthScore score={summary.healthScore} color={healthColor} />
        </div>
        
        {/* Main Insight */}
        <AnimatePresence mode="wait">
          <motion.div
            key={summary.mainInsight}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg"
          >
            <p className="text-sm font-medium">{summary.mainInsight}</p>
          </motion.div>
        </AnimatePresence>
        
        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-xs font-semibold text-green-600 mb-2">Strengths</h4>
            <ul className="space-y-1">
              {summary.keyStrengths.map((strength, i) => (
                <li key={i} className="text-xs flex items-start gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mt-0.5" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold text-orange-600 mb-2">Areas to Improve</h4>
            <ul className="space-y-1">
              {summary.keyWeaknesses.map((weakness, i) => (
                <li key={i} className="text-xs flex items-start gap-1">
                  <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5" />
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Top Recommendation */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Recommendation
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {summary.topRecommendation}
              </p>
              {summary.savingsPotential && (
                <p className="text-xs font-semibold text-blue-600 mt-2">
                  Potential savings: ${summary.savingsPotential}/month
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </CardSpotlight>
  )
}

// components/dashboard/expense-item-with-anomaly.tsx
export function ExpenseItemWithAnomaly({ expense, anomaly }: { 
  expense: UserExpense, 
  anomaly?: Anomaly 
}) {
  const [showDetails, setShowDetails] = useState(false)
  
  return (
    <div className="relative group">
      <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-3">
          {anomaly && (
            <AnomalyIndicator
              severity={anomaly.severity}
              onClick={() => setShowDetails(!showDetails)}
            />
          )}
          <div>
            <p className="font-medium">{expense.name}</p>
            <p className="text-sm text-gray-500">{expense.category.name}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="font-semibold">${expense.amount}</p>
          {expense.isShared && (
            <p className="text-xs text-gray-500">Shared: {expense.sharePercentage}%</p>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {showDetails && anomaly && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {anomaly.description}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                Suggestion: {anomaly.suggestedAction}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// components/dashboard/expense-suggestions.tsx
export function ExpenseSuggestions({ suggestions }: { suggestions: ExpenseSuggestion[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  
  const visibleSuggestions = suggestions.filter(s => !dismissed.has(s.name))
  
  if (visibleSuggestions.length === 0) return null
  
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-600" />
        Suggested Expenses
      </h3>
      
      <div className="space-y-2">
        {visibleSuggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.name}
            suggestion={suggestion}
            onDismiss={() => setDismissed(prev => new Set([...prev, suggestion.name]))}
            onAdd={() => handleAddSuggestion(suggestion)}
          />
        ))}
      </div>
    </div>
  )
}
```

### 3.3 Family Profile UI

```typescript
// components/dashboard/family-profile-modal.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const FamilyProfileSchema = z.object({
  country: z.string().min(1),
  state: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().optional(),
  adultsCount: z.number().min(1).max(10),
  childrenCount: z.number().min(0).max(10),
  childrenAges: z.array(z.number()).optional(),
  housingType: z.enum(['apartment', 'house', 'condo', 'townhouse', 'other']),
  housingSize: z.enum(['studio', '1br', '2br', '3br', '4br', '5br+']),
  ownsCar: z.boolean(),
  carsCount: z.number().min(0).max(10),
  petsCount: z.number().min(0).max(10),
  petTypes: z.array(z.string()).optional(),
})

export function FamilyProfileModal({ isOpen, onClose, onSave }: {
  isOpen: boolean
  onClose: () => void
  onSave: (profile: FamilyProfile) => void
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(FamilyProfileSchema),
  })
  
  const childrenCount = watch('childrenCount', 0)
  const petsCount = watch('petsCount', 0)
  
  const onSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/family/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (response.ok) {
        const profile = await response.json()
        onSave(profile)
        onClose()
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-2xl font-bold">Complete Your Family Profile</h2>
        <p className="text-sm text-gray-600">
          Help our AI provide better insights by telling us about your family
        </p>
        
        {/* Location Section */}
        <div className="space-y-4">
          <h3 className="font-semibold">Location</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Country"
              {...register('country')}
              error={errors.country?.message}
            />
            <Input
              label="State/Province"
              {...register('state')}
              error={errors.state?.message}
            />
            <Input
              label="City"
              {...register('city')}
              error={errors.city?.message}
            />
            <Input
              label="ZIP/Postal Code"
              {...register('zipCode')}
              error={errors.zipCode?.message}
            />
          </div>
        </div>
        
        {/* Family Composition */}
        <div className="space-y-4">
          <h3 className="font-semibold">Family Members</h3>
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="Number of Adults"
              {...register('adultsCount', { valueAsNumber: true })}
              min={1}
              max={10}
            />
            <NumberInput
              label="Number of Children"
              {...register('childrenCount', { valueAsNumber: true })}
              min={0}
              max={10}
            />
          </div>
          
          {childrenCount > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Children Ages</label>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: childrenCount }).map((_, i) => (
                  <input
                    key={i}
                    type="number"
                    placeholder={`Child ${i + 1}`}
                    className="w-20 px-2 py-1 border rounded"
                    min={0}
                    max={25}
                    onChange={(e) => {
                      const ages = [...(watch('childrenAges') || [])]
                      ages[i] = parseInt(e.target.value)
                      setValue('childrenAges', ages)
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Housing */}
        <div className="space-y-4">
          <h3 className="font-semibold">Housing</h3>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Housing Type"
              {...register('housingType')}
              options={[
                { value: 'apartment', label: 'Apartment' },
                { value: 'house', label: 'House' },
                { value: 'condo', label: 'Condo' },
                { value: 'townhouse', label: 'Townhouse' },
                { value: 'other', label: 'Other' },
              ]}
            />
            <Select
              label="Size"
              {...register('housingSize')}
              options={[
                { value: 'studio', label: 'Studio' },
                { value: '1br', label: '1 Bedroom' },
                { value: '2br', label: '2 Bedrooms' },
                { value: '3br', label: '3 Bedrooms' },
                { value: '4br', label: '4 Bedrooms' },
                { value: '5br+', label: '5+ Bedrooms' },
              ]}
            />
          </div>
        </div>
        
        {/* Transportation */}
        <div className="space-y-4">
          <h3 className="font-semibold">Transportation</h3>
          <div className="flex items-center gap-4">
            <Checkbox
              label="Own a car"
              {...register('ownsCar')}
            />
            {watch('ownsCar') && (
              <NumberInput
                label="Number of cars"
                {...register('carsCount', { valueAsNumber: true })}
                min={1}
                max={10}
              />
            )}
          </div>
        </div>
        
        {/* Pets */}
        <div className="space-y-4">
          <h3 className="font-semibold">Pets</h3>
          <NumberInput
            label="Number of pets"
            {...register('petsCount', { valueAsNumber: true })}
            min={0}
            max={10}
          />
          {petsCount > 0 && (
            <div className="flex gap-2 flex-wrap">
              {['Dog', 'Cat', 'Bird', 'Fish', 'Other'].map(type => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={type.toLowerCase()}
                    onChange={(e) => {
                      const types = watch('petTypes') || []
                      if (e.target.checked) {
                        setValue('petTypes', [...types, e.target.value])
                      } else {
                        setValue('petTypes', types.filter(t => t !== e.target.value))
                      }
                    }}
                  />
                  {type}
                </label>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90"
          >
            Save Profile
          </button>
        </div>
      </form>
    </Modal>
  )
}
```

## Phase 4: API Implementation

### 4.1 Analysis API Routes

```typescript
// app/api/analysis/[overviewId]/route.ts
export async function GET(
  req: Request,
  { params }: { params: { overviewId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Get latest active analysis
  const analysis = await db.budgetAnalysis.findFirst({
    where: {
      familyId: session.user.familyId,
      overviewId: params.overviewId,
      isActive: true,
      expiresAt: { gte: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })
  
  if (!analysis) {
    // Trigger new analysis if none exists or expired
    const triggerSystem = new AnalysisTriggerSystem()
    await triggerSystem.triggerAnalysis(
      session.user.familyId,
      params.overviewId,
      'auto'
    )
    
    return new Response('Analysis in progress', { status: 202 })
  }
  
  return NextResponse.json(analysis)
}

// app/api/analysis/trigger/route.ts
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const { overviewId } = await req.json()
  
  const triggerSystem = new AnalysisTriggerSystem()
  await triggerSystem.triggerAnalysis(
    session.user.familyId,
    overviewId,
    'manual'
  )
  
  return NextResponse.json({ success: true })
}

// app/api/analysis/stream/[overviewId]/route.ts
export async function GET(
  req: Request,
  { params }: { params: { overviewId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const stream = new ReadableStream({
    start(controller) {
      // Subscribe to Redis pub/sub for this family
      const redis = new Redis(process.env.REDIS_URL!)
      const channel = `analysis:${session.user.familyId}:${params.overviewId}`
      
      redis.subscribe(channel)
      
      redis.on('message', (_, message) => {
        controller.enqueue(`data: ${message}\n\n`)
      })
      
      req.signal.addEventListener('abort', () => {
        redis.unsubscribe(channel)
        redis.quit()
        controller.close()
      })
    },
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

## Phase 5: Deployment & Monitoring

### 5.1 Environment Variables

```env
# AI Configuration
OPENAI_API_KEY=sk-...
AI_ANALYSIS_MODEL=gpt-4o
AI_ANALYSIS_MAX_TOKENS=2000
AI_ANALYSIS_TEMPERATURE=0.3

# Rate Limiting
AI_ANALYSIS_RATE_LIMIT_PER_HOUR=10
AI_ANALYSIS_DEBOUNCE_DELAY=5000

# Caching
AI_ANALYSIS_CACHE_TTL=86400
REDIS_URL=redis://...

# Feature Flags
ENABLE_AI_ANALYSIS=true
AI_ANALYSIS_AUTO_TRIGGER=true
```

### 5.2 Monitoring & Analytics

```typescript
// lib/ai/analysis/monitoring.ts
export class AnalysisMonitoring {
  static async trackAnalysis(analysis: BudgetAnalysis) {
    // Track metrics
    await analytics.track({
      event: 'ai_analysis_completed',
      properties: {
        familyId: analysis.familyId,
        analysisType: analysis.analysisType,
        healthScore: analysis.metrics?.healthScore,
        anomalyCount: analysis.metrics?.anomalyCount,
        suggestionCount: analysis.metrics?.suggestionCount,
        tokensUsed: analysis.tokensUsed,
        processingTimeMs: analysis.processingTimeMs,
      },
    })
  }
  
  static async trackInteraction(
    analysisId: string, 
    userId: string,
    interactionType: string,
    feedback?: string
  ) {
    await db.analysisInteraction.create({
      data: {
        analysisId,
        userId,
        interactionType,
        feedback,
      },
    })
    
    // Track in analytics
    await analytics.track({
      event: 'ai_analysis_interaction',
      userId,
      properties: {
        analysisId,
        interactionType,
        feedback,
      },
    })
  }
}
```

## Implementation Checklist

### Phase 1: Foundation (Days 1-2)
- [ ] Create database schema for FamilyProfile, BudgetAnalysis, etc.
- [ ] Run database migrations
- [ ] Set up Redis for caching and queuing
- [ ] Configure environment variables
- [ ] Create base analysis service structure

### Phase 2: Analysis Engine (Days 3-4)
- [ ] Implement BudgetAnalyzer class
- [ ] Create analysis context builder
- [ ] Implement summary generation
- [ ] Implement anomaly detection
- [ ] Implement suggestion generation
- [ ] Set up expense templates

### Phase 3: Trigger System (Day 5)
- [ ] Implement trigger system with debouncing
- [ ] Set up BullMQ for job processing
- [ ] Create analysis worker
- [ ] Implement rate limiting
- [ ] Set up caching layer

### Phase 4: Dashboard UI (Days 6-7)
- [ ] Create AI summary card component
- [ ] Add anomaly indicators to expenses
- [ ] Create suggestion cards
- [ ] Implement family profile modal
- [ ] Add real-time update system (SSE)

### Phase 5: API & Integration (Days 8-9)
- [ ] Create analysis API routes
- [ ] Implement streaming endpoint
- [ ] Add profile management endpoints
- [ ] Integrate with existing dashboard
- [ ] Add loading states and error handling

### Phase 6: Testing & Optimization (Days 10-11)
- [ ] Test analysis accuracy
- [ ] Optimize token usage
- [ ] Test rate limiting
- [ ] Performance testing
- [ ] User acceptance testing

### Phase 7: Deployment (Day 12)
- [ ] Deploy database changes
- [ ] Configure production Redis
- [ ] Deploy application updates
- [ ] Monitor initial usage
- [ ] Gather user feedback

## Cost Optimization Strategies

1. **Smart Caching**
   - Cache analyses for 24 hours
   - Invalidate only on significant changes
   - Use Redis for fast retrieval

2. **Batched Analysis**
   - Combine multiple analysis types in single API call
   - Use structured output to reduce tokens

3. **Progressive Enhancement**
   - Start with basic analysis
   - Add detailed analysis on demand
   - Use cheaper models for simple tasks

4. **Rate Limiting**
   - 10 auto-analyses per hour per family
   - Unlimited manual triggers (with confirmation)
   - Weekly/monthly limits for free tiers

## Security Considerations

1. **Data Privacy**
   - All analysis happens server-side
   - No PII sent to external APIs
   - Anonymized data for templates

2. **Access Control**
   - Family-scoped data access
   - User authentication required
   - Rate limiting per family

3. **Input Validation**
   - Validate all user inputs
   - Sanitize data before AI processing
   - Limit context size to prevent abuse

## Future Enhancements

1. **Advanced Analysis**
   - Predictive budgeting
   - Seasonal adjustment detection
   - Investment recommendations
   - Debt payoff strategies

2. **Comparative Analysis**
   - Compare with similar families
   - Regional cost of living adjustments
   - Industry-specific insights

3. **Learning System**
   - Learn from user feedback
   - Improve suggestions over time
   - Personalized insights

4. **Integrations**
   - Bank account connections
   - Receipt scanning
   - Bill tracking
   - Investment tracking

## Success Metrics

1. **Engagement Metrics**
   - Analysis views per user
   - Suggestion acceptance rate
   - Profile completion rate
   - Dashboard time spent

2. **Quality Metrics**
   - Analysis accuracy (user feedback)
   - Anomaly detection precision
   - Suggestion relevance score
   - User satisfaction rating

3. **Performance Metrics**
   - Analysis generation time
   - API response time
   - Cache hit rate
   - Error rate

4. **Business Metrics**
   - User retention improvement
   - Premium conversion rate
   - Support ticket reduction
   - User activation rate