import { tool } from 'ai'
import { z } from 'zod'
import { db } from '@/lib/db'
import { Decimal } from '@prisma/client/runtime/library'

export const extractFamilyInfo = tool({
  description: 'Extract and structure family information from conversation',
  parameters: z.object({
    text: z.string().describe('User input to parse'),
    stage: z.enum(['family', 'income', 'housing', 'expenses', 'goals']),
    onboardingId: z.string(),
  }),
  execute: async ({ text, stage, onboardingId }) => {
    const extractedData: any = {}
    
    switch (stage) {
      case 'family':
        // Extract family composition from natural language
        const adultsMatch = text.match(/(\d+)\s*adult/i)
        const childrenMatch = text.match(/(\d+)\s*child|kid/i)
        const agesMatch = text.match(/ages?\s*([\d,\s]+)/i)
        
        if (adultsMatch) extractedData.adultsCount = parseInt(adultsMatch[1])
        if (childrenMatch) extractedData.childrenCount = parseInt(childrenMatch[1])
        if (agesMatch) {
          const ages = agesMatch[1].split(',').map(age => parseInt(age.trim())).filter(age => !isNaN(age))
          if (ages.length > 0) extractedData.childrenAges = ages
        }
        break
        
      case 'income':
        // Extract income amounts
        const amounts = text.match(/\$?([\d,]+)\s*(?:per\s*month|monthly)?/gi)
        if (amounts && amounts.length > 0) {
          const primaryAmount = parseFloat(amounts[0].replace(/[$,]/g, ''))
          extractedData.primaryIncome = new Decimal(primaryAmount)
          
          if (amounts.length > 1) {
            const secondaryAmount = parseFloat(amounts[1].replace(/[$,]/g, ''))
            extractedData.secondaryIncome = new Decimal(secondaryAmount)
          }
        }
        break
        
      case 'housing':
        // Extract housing type and cost
        if (text.toLowerCase().includes('rent')) extractedData.housingType = 'rent'
        else if (text.toLowerCase().includes('mortgage')) extractedData.housingType = 'mortgage'
        else if (text.toLowerCase().includes('own')) extractedData.housingType = 'owned'
        
        const costMatch = text.match(/\$?([\d,]+)/i)
        if (costMatch) {
          const cost = parseFloat(costMatch[0].replace(/[$,]/g, ''))
          extractedData.housingCost = new Decimal(cost)
        }
        break
        
      case 'expenses':
        // Extract expense amounts and categories
        const expenseData: any = {}
        const expenseMatches = text.matchAll(/([a-z]+)[\s:]*\$?([\d,]+)/gi)
        for (const match of expenseMatches) {
          const category = match[1].toLowerCase()
          const amount = parseFloat(match[2].replace(/,/g, ''))
          expenseData[category] = amount
        }
        extractedData.expenses = expenseData
        break
        
      case 'goals':
        // Extract financial goals
        const goals = []
        const goalKeywords = ['emergency', 'retirement', 'education', 'home', 'debt', 'vacation', 'savings']
        for (const keyword of goalKeywords) {
          if (text.toLowerCase().includes(keyword)) {
            goals.push(keyword)
          }
        }
        extractedData.financialGoals = goals
        
        // Extract savings goal amount if mentioned
        const savingsMatch = text.match(/save\s*\$?([\d,]+)/i)
        if (savingsMatch) {
          const savings = parseFloat(savingsMatch[1].replace(/,/g, ''))
          extractedData.savingsGoal = new Decimal(savings)
        }
        break
    }
    
    // Update onboarding record with extracted data
    if (Object.keys(extractedData).length > 0) {
      await db.familyOnboarding.update({
        where: { id: onboardingId },
        data: extractedData
      })
    }
    
    return { success: true, extractedData }
  },
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
    
    if (!onboarding) {
      throw new Error('Onboarding record not found')
    }
    
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
    
    if (onboarding.secondaryIncome) {
      await db.income.create({
        data: {
          overviewId: overview.id,
          name: 'Secondary Income',
          amount: onboarding.secondaryIncome,
          type: 'salary',
          frequency: 'monthly',
          monthlyAmount: onboarding.secondaryIncome,
        }
      })
    }
    
    if (onboarding.otherIncome) {
      await db.income.create({
        data: {
          overviewId: overview.id,
          name: 'Other Income',
          amount: onboarding.otherIncome,
          type: 'other',
          frequency: 'monthly',
          monthlyAmount: onboarding.otherIncome,
        }
      })
    }
    
    // Create default categories
    const categories = await createDefaultCategories(onboarding.familyId)
    
    // Get the first user in the family for expense assignments
    const firstUser = await db.user.findFirst({
      where: { familyId: onboarding.familyId, isVerified: true }
    })
    
    if (!firstUser) {
      throw new Error('No verified user found in family')
    }
    
    // Add housing expense
    if (onboarding.housingCost && categories.housing) {
      await db.userExpense.create({
        data: {
          overviewId: overview.id,
          userId: firstUser.id,
          categoryId: categories.housing.id,
          name: onboarding.housingType === 'rent' ? 'Rent' : 'Mortgage',
          amount: onboarding.housingCost,
        }
      })
    }
    
    // Add investment/savings if specified
    if (onboarding.monthlyInvestmentAmount && categories.savings) {
      await db.userExpense.create({
        data: {
          overviewId: overview.id,
          userId: firstUser.id,
          categoryId: categories.savings.id,
          name: 'Monthly Investments',
          amount: onboarding.monthlyInvestmentAmount,
        }
      })
    }
    
    // Mark onboarding as complete
    await db.familyOnboarding.update({
      where: { id: onboardingId },
      data: { completedAt: new Date() }
    })
    
    return { 
      success: true, 
      overviewId: overview.id,
      message: 'Initial budget created successfully!'
    }
  },
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
      { category: 'Housing', items: ['Rent/Mortgage', 'Insurance', 'Maintenance', 'Property Tax'] },
      { category: 'Utilities', items: ['Electricity', 'Water', 'Gas', 'Internet', 'Phone'] },
      { category: 'Food', items: ['Groceries', 'Dining Out', 'Coffee/Snacks'] },
      { category: 'Transportation', items: ['Car Payment', 'Insurance', 'Fuel', 'Maintenance', 'Public Transit'] },
      { category: 'Healthcare', items: ['Insurance', 'Medications', 'Doctor Visits'] },
      { category: 'Personal', items: ['Clothing', 'Personal Care', 'Subscriptions'] }
    )
    
    // Add child-specific categories
    if (params.childrenCount > 0) {
      suggestions.push(
        { category: 'Childcare', items: ['Daycare', 'Babysitting', 'After-school Programs'] },
        { category: 'Education', items: ['School Supplies', 'Tuition', 'Books', 'Activities'] }
      )
      
      // Age-specific suggestions
      const hasToddlers = params.childrenAges?.some(age => age <= 3)
      const hasSchoolAge = params.childrenAges?.some(age => age >= 5 && age <= 12)
      const hasTeens = params.childrenAges?.some(age => age >= 13)
      
      if (hasToddlers) {
        suggestions.push(
          { category: 'Baby/Toddler', items: ['Diapers', 'Formula', 'Baby Food', 'Toys'] }
        )
      }
      
      if (hasSchoolAge) {
        suggestions.push(
          { category: 'School Activities', items: ['Sports', 'Music Lessons', 'Field Trips', 'Clubs'] }
        )
      }
      
      if (hasTeens) {
        suggestions.push(
          { category: 'Teen Expenses', items: ['Allowance', 'Phone Plan', 'Activities', 'College Prep'] }
        )
      }
    }
    
    // Add homeowner-specific categories
    if (params.housingType === 'mortgage' || params.housingType === 'owned') {
      suggestions.push(
        { category: 'Home Maintenance', items: ['Repairs', 'Lawn Care', 'HOA Fees', 'Improvements'] }
      )
    }
    
    return suggestions
  },
})

export const updateOnboardingData = tool({
  description: 'Update onboarding data with new information',
  parameters: z.object({
    onboardingId: z.string(),
    data: z.object({
      adultsCount: z.number().optional(),
      childrenCount: z.number().optional(),
      childrenAges: z.array(z.number()).optional(),
      primaryIncome: z.number().optional(),
      secondaryIncome: z.number().optional(),
      otherIncome: z.number().optional(),
      hasInvestments: z.boolean().optional(),
      investmentTypes: z.array(z.string()).optional(),
      monthlyInvestmentAmount: z.number().optional(),
      housingType: z.string().optional(),
      housingCost: z.number().optional(),
      savingsGoal: z.number().optional(),
      financialGoals: z.array(z.string()).optional(),
      budgetPriorities: z.array(z.string()).optional(),
    })
  }),
  execute: async ({ onboardingId, data }) => {
    // Convert number fields to Decimal for database
    const updateData: any = { ...data }
    
    if (data.primaryIncome !== undefined) {
      updateData.primaryIncome = new Decimal(data.primaryIncome)
    }
    if (data.secondaryIncome !== undefined) {
      updateData.secondaryIncome = new Decimal(data.secondaryIncome)
    }
    if (data.otherIncome !== undefined) {
      updateData.otherIncome = new Decimal(data.otherIncome)
    }
    if (data.monthlyInvestmentAmount !== undefined) {
      updateData.monthlyInvestmentAmount = new Decimal(data.monthlyInvestmentAmount)
    }
    if (data.housingCost !== undefined) {
      updateData.housingCost = new Decimal(data.housingCost)
    }
    if (data.savingsGoal !== undefined) {
      updateData.savingsGoal = new Decimal(data.savingsGoal)
    }
    
    const updated = await db.familyOnboarding.update({
      where: { id: onboardingId },
      data: updateData
    })
    
    return { success: true, updated }
  },
})

// Helper function to create default categories
async function createDefaultCategories(familyId: string) {
  const defaultCategories = [
    { name: 'Housing', icon: '🏠', color: '#3B82F6' },
    { name: 'Transportation', icon: '🚗', color: '#10B981' },
    { name: 'Food', icon: '🍔', color: '#F59E0B' },
    { name: 'Utilities', icon: '⚡', color: '#8B5CF6' },
    { name: 'Healthcare', icon: '🏥', color: '#EF4444' },
    { name: 'Personal', icon: '👤', color: '#EC4899' },
    { name: 'Entertainment', icon: '🎬', color: '#06B6D4' },
    { name: 'Savings', icon: '💰', color: '#84CC16' },
    { name: 'Education', icon: '📚', color: '#6366F1' },
    { name: 'Other', icon: '📦', color: '#6B7280' },
  ]
  
  const categories: Record<string, any> = {}
  
  for (const cat of defaultCategories) {
    const existing = await db.category.findFirst({
      where: { familyId, name: cat.name }
    })
    
    if (existing) {
      categories[cat.name.toLowerCase()] = existing
    } else {
      const created = await db.category.create({
        data: { ...cat, familyId }
      })
      categories[cat.name.toLowerCase()] = created
    }
  }
  
  return categories
}