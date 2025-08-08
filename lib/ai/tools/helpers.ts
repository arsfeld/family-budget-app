import { Prisma } from '@prisma/client'

export function calculateMonthlyAmount(amount: number, frequency: string): number {
  const frequencyMultipliers: Record<string, number> = {
    'weekly': 52 / 12,
    'biweekly': 26 / 12,
    'semimonthly': 2,
    'monthly': 1,
    'yearly': 1 / 12,
    'one-time': 1,
  }
  
  return amount * (frequencyMultipliers[frequency] || 1)
}

export function formatCurrency(amount: number | Prisma.Decimal): string {
  const numAmount = typeof amount === 'number' ? amount : Number(amount)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numAmount)
}

export function calculateSavingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0
  return ((income - expenses) / income) * 100
}

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: any
}

export async function getChartData(
  type: string,
  data: any,
  _familyId: string
): Promise<ChartDataPoint[]> {
  switch (type) {
    case 'income-expense':
      return [
        { name: 'Income', value: data.totalIncome, fill: '#10b981' },
        { name: 'Expenses', value: data.totalExpenses, fill: '#ef4444' },
        { name: 'Savings', value: data.netSavings, fill: '#3b82f6' },
      ]
    
    case 'category-breakdown':
      // Group expenses by category
      const categoryMap = new Map<string, number>()
      for (const expense of data.expenses || []) {
        const categoryName = expense.category?.name || 'Uncategorized'
        const current = categoryMap.get(categoryName) || 0
        categoryMap.set(categoryName, current + Number(expense.amount))
      }
      
      return Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value,
      }))
    
    case 'scenario-comparison':
      return data.scenarios?.map((scenario: any) => ({
        name: scenario.name,
        value: scenario.netSavings,
        income: scenario.totalIncome,
        expenses: scenario.totalExpenses,
        savings: scenario.netSavings,
      })) || []
    
    case 'trend':
      // For now, return monthly projection
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      return months.map(month => ({
        name: month,
        value: data.netSavings,
        income: data.totalIncome,
        expenses: data.totalExpenses,
        savings: data.netSavings,
      }))
    
    default:
      return []
  }
}

export function getChartConfig(type: string) {
  const configs: Record<string, any> = {
    'income-expense': {
      type: 'bar',
      xAxis: 'name',
      yAxis: 'value',
      colors: ['#10b981', '#ef4444', '#3b82f6'],
    },
    'category-breakdown': {
      type: 'pie',
      dataKey: 'value',
      nameKey: 'name',
      colors: [
        '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
        '#3b82f6', '#ec4899', '#14b8a6', '#f97316',
      ],
    },
    'scenario-comparison': {
      type: 'bar',
      xAxis: 'name',
      bars: ['income', 'expenses', 'savings'],
      colors: ['#10b981', '#ef4444', '#3b82f6'],
    },
    'trend': {
      type: 'line',
      xAxis: 'name',
      lines: ['income', 'expenses', 'savings'],
      colors: ['#10b981', '#ef4444', '#3b82f6'],
    },
  }
  
  return configs[type] || configs['income-expense']
}