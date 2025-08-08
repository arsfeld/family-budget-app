import { tool } from 'ai'
import { z } from 'zod'
import { db } from '@/lib/db'
import { 
  calculateMonthlyAmount, 
  formatCurrency, 
  calculateSavingsRate,
  getChartData,
  getChartConfig 
} from './helpers'
import { Prisma } from '@prisma/client'

interface ToolContext {
  userId: string
  familyId: string
}

export const getBudgetOverview = (context: ToolContext) => tool({
  description: 'Get current budget overview and financial summary for the active scenario or a specific one',
  parameters: z.object({
    overviewId: z.string().optional().describe('Optional specific overview ID, defaults to active overview'),
  }),
  execute: async ({ overviewId }: { overviewId?: string }) => {
    const { familyId } = context
    
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
    
    if (!overview) {
      return {
        error: 'No budget overview found. Please create one first.',
      }
    }
    
    const totalIncome = overview.incomes.reduce(
      (sum, inc) => sum.add(inc.monthlyAmount), 
      new Prisma.Decimal(0)
    )
    
    const totalExpenses = overview.userExpenses.reduce(
      (sum, exp) => sum.add(exp.amount), 
      new Prisma.Decimal(0)
    )
    
    const netSavings = totalIncome.sub(totalExpenses)
    const savingsRate = calculateSavingsRate(Number(totalIncome), Number(totalExpenses))
    
    // Group expenses by category
    const expensesByCategory = overview.userExpenses.reduce((acc, expense) => {
      const categoryName = expense.category.name
      if (!acc[categoryName]) {
        acc[categoryName] = new Prisma.Decimal(0)
      }
      acc[categoryName] = acc[categoryName].add(expense.amount)
      return acc
    }, {} as Record<string, Prisma.Decimal>)
    
    return {
      overviewName: overview.name,
      overviewId: overview.id,
      totalIncome: formatCurrency(totalIncome),
      totalExpenses: formatCurrency(totalExpenses),
      netSavings: formatCurrency(netSavings),
      savingsRate: `${savingsRate.toFixed(1)}%`,
      incomeCount: overview.incomes.length,
      expenseCount: overview.userExpenses.length,
      topExpenseCategories: Object.entries(expensesByCategory)
        .sort(([, a], [, b]) => Number(b) - Number(a))
        .slice(0, 3)
        .map(([category, amount]) => ({
          category,
          amount: formatCurrency(amount),
        })),
    }
  },
})

export const addIncome = (context: ToolContext) => tool({
  description: 'Add a new income source to the active budget overview',
  parameters: z.object({
    name: z.string().describe('Name of the income source (e.g., "John\'s Salary", "Rental Income")'),
    amount: z.number().positive().describe('Amount of income'),
    type: z.enum(['salary', 'freelance', 'property', 'investment', 'business', 'other'])
      .describe('Type of income'),
    frequency: z.enum(['weekly', 'biweekly', 'semimonthly', 'monthly', 'yearly', 'one-time'])
      .default('monthly')
      .describe('How often the income is received'),
    notes: z.string().optional().describe('Optional notes about this income'),
  }),
  execute: async (params: { name: string; amount: number; type: string; frequency: string; notes?: string }) => {
    const { userId, familyId } = context
    
    const activeOverview = await db.monthlyOverview.findFirst({
      where: { familyId, isActive: true },
    })
    
    if (!activeOverview) {
      return {
        error: 'No active budget overview found. Please create or activate a budget scenario first.',
      }
    }
    
    const monthlyAmount = calculateMonthlyAmount(params.amount, params.frequency)
    
    const income = await db.income.create({
      data: {
        overviewId: activeOverview.id,
        userId,
        name: params.name,
        amount: params.amount,
        type: params.type,
        frequency: params.frequency,
        monthlyAmount,
        notes: params.notes,
        isActive: true,
      },
    })
    
    return {
      success: true,
      message: `Added ${params.name} with ${formatCurrency(monthlyAmount)} monthly income`,
      income: {
        id: income.id,
        name: income.name,
        amount: formatCurrency(income.amount),
        monthlyAmount: formatCurrency(income.monthlyAmount),
        frequency: income.frequency,
        type: income.type,
      },
    }
  },
})

export const addExpense = (context: ToolContext) => tool({
  description: 'Add a new expense to the active budget overview',
  parameters: z.object({
    name: z.string().describe('Name of the expense (e.g., "Netflix Subscription", "Car Insurance")'),
    amount: z.number().positive().describe('Monthly expense amount'),
    categoryName: z.string().describe('Category name (will be created if it doesn\'t exist)'),
    isShared: z.boolean().optional().default(false).describe('Is this expense shared with other family members?'),
    sharePercentage: z.number().min(0).max(100).optional()
      .describe('If shared, what percentage does this user pay?'),
    notes: z.string().optional().describe('Optional notes about this expense'),
  }),
  execute: async (params: { name: string; amount: number; categoryName: string; isShared?: boolean; sharePercentage?: number; notes?: string }) => {
    const { userId, familyId } = context
    
    const activeOverview = await db.monthlyOverview.findFirst({
      where: { familyId, isActive: true },
    })
    
    if (!activeOverview) {
      return {
        error: 'No active budget overview found. Please create or activate a budget scenario first.',
      }
    }
    
    // Find or create category
    let category = await db.category.findFirst({
      where: { 
        familyId, 
        name: {
          equals: params.categoryName,
          mode: 'insensitive',
        },
      },
    })
    
    if (!category) {
      category = await db.category.create({
        data: { 
          familyId, 
          name: params.categoryName,
          // Assign a color based on category name
          color: getCategoryColor(params.categoryName),
        },
      })
    }
    
    const expense = await db.userExpense.create({
      data: {
        overviewId: activeOverview.id,
        userId,
        categoryId: category.id,
        name: params.name,
        amount: params.amount,
        isShared: params.isShared,
        sharePercentage: params.sharePercentage,
        notes: params.notes,
      },
      include: {
        category: true,
      },
    })
    
    return {
      success: true,
      message: `Added ${params.name} expense of ${formatCurrency(params.amount)} to ${category.name}`,
      expense: {
        id: expense.id,
        name: expense.name,
        amount: formatCurrency(expense.amount),
        category: expense.category.name,
        isShared: expense.isShared,
        sharePercentage: expense.sharePercentage,
      },
    }
  },
})

export const compareScenarios = (context: ToolContext) => tool({
  description: 'Compare different budget scenarios to see differences',
  parameters: z.object({
    includeArchived: z.boolean().optional().default(false)
      .describe('Include archived scenarios in comparison'),
  }),
  execute: async ({ includeArchived }: { includeArchived?: boolean }) => {
    const { familyId } = context
    
    const scenarios = await db.monthlyOverview.findMany({
      where: {
        familyId,
        ...(!includeArchived && { isArchived: false }),
      },
      include: {
        incomes: true,
        userExpenses: true,
      },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' },
      ],
    })
    
    if (scenarios.length === 0) {
      return {
        error: 'No budget scenarios found. Please create at least one budget overview.',
      }
    }
    
    const comparisonData = scenarios.map(scenario => {
      const totalIncome = scenario.incomes.reduce(
        (sum, inc) => sum.add(inc.monthlyAmount), 
        new Prisma.Decimal(0)
      )
      const totalExpenses = scenario.userExpenses.reduce(
        (sum, exp) => sum.add(exp.amount), 
        new Prisma.Decimal(0)
      )
      const netSavings = totalIncome.sub(totalExpenses)
      
      return {
        id: scenario.id,
        name: scenario.name,
        isActive: scenario.isActive,
        isArchived: scenario.isArchived,
        totalIncome: Number(totalIncome),
        totalExpenses: Number(totalExpenses),
        netSavings: Number(netSavings),
        savingsRate: calculateSavingsRate(Number(totalIncome), Number(totalExpenses)),
      }
    })
    
    // Find best and worst scenarios
    const bestScenario = comparisonData.reduce((best, current) => 
      current.netSavings > best.netSavings ? current : best
    )
    const worstScenario = comparisonData.reduce((worst, current) => 
      current.netSavings < worst.netSavings ? current : worst
    )
    
    return {
      scenarioCount: scenarios.length,
      scenarios: comparisonData.map(s => ({
        ...s,
        totalIncome: formatCurrency(s.totalIncome),
        totalExpenses: formatCurrency(s.totalExpenses),
        netSavings: formatCurrency(s.netSavings),
        savingsRate: `${s.savingsRate.toFixed(1)}%`,
      })),
      analysis: {
        bestScenario: {
          name: bestScenario.name,
          netSavings: formatCurrency(bestScenario.netSavings),
        },
        worstScenario: {
          name: worstScenario.name,
          netSavings: formatCurrency(worstScenario.netSavings),
        },
        savingsDifference: formatCurrency(bestScenario.netSavings - worstScenario.netSavings),
      },
    }
  },
})

export const generateChart = (context: ToolContext) => tool({
  description: 'Generate chart data for visualization of financial data',
  parameters: z.object({
    chartType: z.enum(['income-expense', 'category-breakdown', 'scenario-comparison', 'trend'])
      .describe('Type of chart to generate'),
    overviewId: z.string().optional().describe('Specific overview ID, defaults to active overview'),
  }),
  execute: async ({ chartType, overviewId }: { chartType: string; overviewId?: string }) => {
    const { familyId } = context
    
    let data: any = {}
    
    if (chartType === 'scenario-comparison') {
      // Get all scenarios for comparison
      const scenarios = await db.monthlyOverview.findMany({
        where: { familyId, isArchived: false },
        include: {
          incomes: true,
          userExpenses: true,
        },
      })
      
      data.scenarios = scenarios.map(scenario => {
        const totalIncome = scenario.incomes.reduce(
          (sum, inc) => sum.add(inc.monthlyAmount), 
          new Prisma.Decimal(0)
        )
        const totalExpenses = scenario.userExpenses.reduce(
          (sum, exp) => sum.add(exp.amount), 
          new Prisma.Decimal(0)
        )
        
        return {
          name: scenario.name,
          totalIncome: Number(totalIncome),
          totalExpenses: Number(totalExpenses),
          netSavings: Number(totalIncome.sub(totalExpenses)),
        }
      })
    } else {
      // Get data for specific overview
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
            },
          },
        },
      })
      
      if (!overview) {
        return {
          error: 'No budget overview found.',
        }
      }
      
      const totalIncome = overview.incomes.reduce(
        (sum, inc) => sum.add(inc.monthlyAmount), 
        new Prisma.Decimal(0)
      )
      const totalExpenses = overview.userExpenses.reduce(
        (sum, exp) => sum.add(exp.amount), 
        new Prisma.Decimal(0)
      )
      
      data = {
        totalIncome: Number(totalIncome),
        totalExpenses: Number(totalExpenses),
        netSavings: Number(totalIncome.sub(totalExpenses)),
        expenses: overview.userExpenses,
      }
    }
    
    const chartData = await getChartData(chartType, data, familyId)
    const config = getChartConfig(chartType)
    
    return {
      type: chartType,
      data: chartData,
      config,
      summary: generateChartSummary(chartType, chartData),
    }
  },
})

export const listIncomes = (context: ToolContext) => tool({
  description: 'List all income sources in the active budget overview',
  parameters: z.object({
    overviewId: z.string().optional().describe('Optional specific overview ID, defaults to active overview'),
  }),
  execute: async ({ overviewId }: { overviewId?: string }) => {
    const { familyId } = context
    
    const overview = await db.monthlyOverview.findFirst({
      where: {
        familyId,
        ...(overviewId ? { id: overviewId } : { isActive: true }),
      },
      include: {
        incomes: {
          include: {
            user: true,
          },
        },
      },
    })
    
    if (!overview) {
      return {
        error: 'No budget overview found.',
      }
    }
    
    const incomes = overview.incomes.map(income => ({
      id: income.id,
      name: income.name,
      type: income.type,
      amount: formatCurrency(income.amount),
      frequency: income.frequency,
      monthlyAmount: formatCurrency(income.monthlyAmount),
      user: income.user?.name || 'Family',
      isActive: income.isActive,
    }))
    
    const totalMonthly = overview.incomes.reduce(
      (sum, inc) => sum.add(inc.monthlyAmount), 
      new Prisma.Decimal(0)
    )
    
    return {
      overviewName: overview.name,
      incomeCount: incomes.length,
      totalMonthlyIncome: formatCurrency(totalMonthly),
      incomes,
    }
  },
})

export const listExpenses = (context: ToolContext) => tool({
  description: 'List all expenses in the active budget overview, optionally filtered by category',
  parameters: z.object({
    categoryName: z.string().optional().describe('Filter expenses by category name'),
    overviewId: z.string().optional().describe('Optional specific overview ID, defaults to active overview'),
  }),
  execute: async ({ categoryName, overviewId }: { categoryName?: string; overviewId?: string }) => {
    const { familyId } = context
    
    const overview = await db.monthlyOverview.findFirst({
      where: {
        familyId,
        ...(overviewId ? { id: overviewId } : { isActive: true }),
      },
      include: {
        userExpenses: {
          where: categoryName ? {
            category: {
              name: {
                equals: categoryName,
                mode: 'insensitive',
              },
            },
          } : undefined,
          include: {
            category: true,
            user: true,
          },
        },
      },
    })
    
    if (!overview) {
      return {
        error: 'No budget overview found.',
      }
    }
    
    const expenses = overview.userExpenses.map(expense => ({
      id: expense.id,
      name: expense.name || expense.category.name,
      amount: formatCurrency(expense.amount),
      category: expense.category.name,
      user: expense.user.name,
      isShared: expense.isShared,
      sharePercentage: expense.sharePercentage,
    }))
    
    const totalExpenses = overview.userExpenses.reduce(
      (sum, exp) => sum.add(exp.amount), 
      new Prisma.Decimal(0)
    )
    
    return {
      overviewName: overview.name,
      expenseCount: expenses.length,
      totalExpenses: formatCurrency(totalExpenses),
      filterApplied: categoryName ? `Filtered by category: ${categoryName}` : 'Showing all expenses',
      expenses,
    }
  },
})

// Helper functions
function getCategoryColor(categoryName: string): string {
  const colors: Record<string, string> = {
    housing: '#ef4444',
    transportation: '#f59e0b',
    food: '#10b981',
    utilities: '#3b82f6',
    entertainment: '#8b5cf6',
    healthcare: '#ec4899',
    insurance: '#14b8a6',
    savings: '#22c55e',
    debt: '#f87171',
    other: '#6b7280',
  }
  
  const lowerName = categoryName.toLowerCase()
  for (const [key, color] of Object.entries(colors)) {
    if (lowerName.includes(key)) {
      return color
    }
  }
  
  // Return a random color from the palette if no match
  const colorValues = Object.values(colors)
  return colorValues[Math.floor(Math.random() * colorValues.length)]
}

function generateChartSummary(chartType: string, data: any[]): string {
  switch (chartType) {
    case 'income-expense':
      const incomeData = data.find(d => d.name === 'Income')
      const expenseData = data.find(d => d.name === 'Expenses')
      const savingsData = data.find(d => d.name === 'Savings')
      return `Income: ${formatCurrency(incomeData?.value || 0)}, Expenses: ${formatCurrency(expenseData?.value || 0)}, Savings: ${formatCurrency(savingsData?.value || 0)}`
    
    case 'category-breakdown':
      const topCategory = data.sort((a, b) => b.value - a.value)[0]
      return `Top expense category: ${topCategory?.name} (${formatCurrency(topCategory?.value || 0)})`
    
    case 'scenario-comparison':
      const bestScenario = data.sort((a, b) => (b.savings || 0) - (a.savings || 0))[0]
      return `Best scenario: ${bestScenario?.name} with ${formatCurrency(bestScenario?.savings || 0)} in savings`
    
    default:
      return 'Chart generated successfully'
  }
}