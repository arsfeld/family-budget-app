'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function updateUserIncome(
  incomeId: string,
  data: {
    salaryAmount?: number
    salaryFrequency?: string
    monthlySalary?: number
    additionalIncome?: number
    notes?: string
  }
) {
  const session = await auth()
  if (!session?.user?.familyId) {
    throw new Error('Unauthorized')
  }

  // Verify the income belongs to the user's family
  const income = await db.userIncome.findFirst({
    where: {
      id: incomeId,
      overview: {
        familyId: session.user.familyId,
      },
    },
  })

  if (!income) {
    throw new Error('Income not found')
  }

  // Update the income
  await db.userIncome.update({
    where: { id: incomeId },
    data: {
      salaryAmount: data.salaryAmount ?? income.salaryAmount,
      salaryFrequency: data.salaryFrequency ?? income.salaryFrequency,
      monthlySalary: data.monthlySalary ?? income.monthlySalary,
      additionalIncome: data.additionalIncome ?? income.additionalIncome,
      notes: data.notes !== undefined ? data.notes : income.notes,
    },
  })

  revalidatePath('/dashboard')
}

export async function updateUserExpense(
  expenseId: string,
  data: {
    name?: string
    amount?: number
    categoryId?: string
    isShared?: boolean
    sharePercentage?: number
    notes?: string
  }
) {
  const session = await auth()
  if (!session?.user?.familyId) {
    throw new Error('Unauthorized')
  }

  // Verify the expense belongs to the user's family
  const expense = await db.userExpense.findFirst({
    where: {
      id: expenseId,
      overview: {
        familyId: session.user.familyId,
      },
    },
  })

  if (!expense) {
    throw new Error('Expense not found')
  }

  // Update the expense
  await db.userExpense.update({
    where: { id: expenseId },
    data: {
      name: data.name ?? expense.name,
      amount: data.amount ?? expense.amount,
      categoryId: data.categoryId ?? expense.categoryId,
      isShared: data.isShared ?? expense.isShared,
      sharePercentage: data.sharePercentage ?? expense.sharePercentage,
      notes: data.notes !== undefined ? data.notes : expense.notes,
    },
  })

  revalidatePath('/dashboard')
}

export async function deleteUserExpense(expenseId: string) {
  const session = await auth()
  if (!session?.user?.familyId) {
    throw new Error('Unauthorized')
  }

  // Verify the expense belongs to the user's family
  const expense = await db.userExpense.findFirst({
    where: {
      id: expenseId,
      overview: {
        familyId: session.user.familyId,
      },
    },
  })

  if (!expense) {
    throw new Error('Expense not found')
  }

  // Delete the expense
  await db.userExpense.delete({
    where: { id: expenseId },
  })

  revalidatePath('/dashboard')
}

export async function addUserExpense(data: {
  userId: string
  categoryId: string
  name: string
  amount: number
  isShared: boolean
  sharePercentage: number
  notes?: string
}) {
  const session = await auth()
  if (!session?.user?.familyId) {
    throw new Error('Unauthorized')
  }

  // Get the active overview
  const activeOverview = await db.monthlyOverview.findFirst({
    where: {
      familyId: session.user.familyId,
      isActive: true,
    },
  })

  if (!activeOverview) {
    throw new Error('No active overview found')
  }

  // Verify the user and category belong to the family
  const [user, category] = await Promise.all([
    db.user.findFirst({
      where: {
        id: data.userId,
        familyId: session.user.familyId,
      },
    }),
    db.category.findFirst({
      where: {
        id: data.categoryId,
        familyId: session.user.familyId,
      },
    }),
  ])

  if (!user || !category) {
    throw new Error('Invalid user or category')
  }

  // Create the expense
  await db.userExpense.create({
    data: {
      overviewId: activeOverview.id,
      userId: data.userId,
      categoryId: data.categoryId,
      name: data.name,
      amount: data.amount,
      isShared: data.isShared,
      sharePercentage: data.sharePercentage,
      notes: data.notes,
    },
  })

  revalidatePath('/dashboard')
}

export async function createMonthlyOverview(formData: FormData) {
  const session = await auth()
  if (!session?.user?.familyId) {
    throw new Error('Unauthorized - no family ID in session')
  }

  const name = formData.get('name') as string

  console.log('Creating overview for family:', session.user.familyId)

  // Verify the family exists
  const family = await db.family.findUnique({
    where: { id: session.user.familyId },
  })

  if (!family) {
    console.error('Family not found:', session.user.familyId)
    throw new Error(
      `Family not found (${session.user.familyId}). Please log out and log in again.`
    )
  }

  // Create the overview in a transaction to ensure data consistency
  await db.$transaction(async (tx) => {
    // First, set all existing overviews to inactive
    await tx.monthlyOverview.updateMany({
      where: { familyId: session.user.familyId },
      data: { isActive: false },
    })

    // Create the new overview
    const overview = await tx.monthlyOverview.create({
      data: {
        familyId: session.user.familyId,
        name,
        isActive: true,
      },
    })

    // Get all users in the family
    const users = await tx.user.findMany({
      where: { familyId: session.user.familyId },
    })

    // Create initial income entries for all users
    await tx.userIncome.createMany({
      data: users.map((user) => ({
        overviewId: overview.id,
        userId: user.id,
        salaryAmount: 0,
        salaryFrequency: 'monthly',
        monthlySalary: 0,
        additionalIncome: 0,
        notes: null,
      })),
    })
  })

  revalidatePath('/dashboard')
}

export async function switchMonthlyOverview(overviewId: string) {
  const session = await auth()
  if (!session?.user?.familyId) {
    throw new Error('Unauthorized')
  }

  // Verify the overview belongs to the user's family
  const overview = await db.monthlyOverview.findFirst({
    where: {
      id: overviewId,
      familyId: session.user.familyId,
    },
  })

  if (!overview) {
    throw new Error('Overview not found')
  }

  // Update all overviews in a transaction
  await db.$transaction(async (tx) => {
    // Set all overviews to inactive
    await tx.monthlyOverview.updateMany({
      where: { familyId: session.user.familyId },
      data: { isActive: false },
    })

    // Set the selected overview to active
    await tx.monthlyOverview.update({
      where: { id: overviewId },
      data: { isActive: true },
    })
  })

  revalidatePath('/dashboard')
}

export async function deleteMonthlyOverview(overviewId: string) {
  const session = await auth()
  if (!session?.user?.familyId) {
    throw new Error('Unauthorized')
  }

  // Verify the overview belongs to the user's family
  const overview = await db.monthlyOverview.findFirst({
    where: {
      id: overviewId,
      familyId: session.user.familyId,
    },
  })

  if (!overview) {
    throw new Error('Overview not found')
  }

  // Don't allow deleting the last overview
  const overviewCount = await db.monthlyOverview.count({
    where: { familyId: session.user.familyId },
  })

  if (overviewCount <= 1) {
    throw new Error('Cannot delete the last overview')
  }

  // Delete the overview (cascade will handle related records)
  await db.monthlyOverview.delete({
    where: { id: overviewId },
  })

  // If this was the active overview, activate another one
  if (overview.isActive) {
    const firstOverview = await db.monthlyOverview.findFirst({
      where: { familyId: session.user.familyId },
      orderBy: { createdAt: 'desc' },
    })

    if (firstOverview) {
      await db.monthlyOverview.update({
        where: { id: firstOverview.id },
        data: { isActive: true },
      })
    }
  }

  revalidatePath('/dashboard')
}
