'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

const DEFAULT_CATEGORIES = [
  { name: 'Housing', icon: '🏠', color: '#10b981' },
  { name: 'Utilities', icon: '💡', color: '#3b82f6' },
  { name: 'Insurance', icon: '🛡️', color: '#8b5cf6' },
  { name: 'Transportation', icon: '🚗', color: '#ec4899' },
  { name: 'Childcare', icon: '👶', color: '#06b6d4' },
  { name: 'Healthcare', icon: '🏥', color: '#14b8a6' },
  { name: 'Food & Groceries', icon: '🛒', color: '#84cc16' },
  { name: 'Subscriptions', icon: '📱', color: '#ef4444' },
  { name: 'Debt Payments', icon: '💳', color: '#f97316' },
  { name: 'Savings', icon: '💰', color: '#22c55e' },
  { name: 'Entertainment', icon: '🎬', color: '#a855f7' },
  { name: 'Other', icon: '📦', color: '#f59e0b' },
]

export async function updateProfile({
  name,
  email,
}: {
  name: string
  email: string
}) {
  const session = await auth()

  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Check if email is already taken by another user
    const existingUser = await db.user.findFirst({
      where: {
        email,
        NOT: {
          id: session.user.id,
        },
      },
    })

    if (existingUser) {
      return { error: 'Email already in use' }
    }

    await db.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
      },
    })

    revalidatePath('/profile')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Update profile error:', error)
    return { error: 'Failed to update profile' }
  }
}

export async function inviteFamilyMember({
  email,
  name,
  familyId,
}: {
  email: string
  name: string
  familyId: string
}) {
  const session = await auth()

  if (!session?.user || session.user.familyId !== familyId) {
    return { error: 'Unauthorized' }
  }

  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      if (existingUser.familyId === familyId) {
        return { error: 'This person is already a member of your family' }
      } else {
        return { error: 'This email is already registered to another family' }
      }
    }

    // Create unverified user
    const newUser = await db.user.create({
      data: {
        email,
        name,
        familyId,
        isVerified: false,
        invitedBy: session.user.id,
        invitedAt: new Date(),
        passwordHash: null, // No password yet
      },
    })

    // Get active overview to add default income entry
    const activeOverview = await db.monthlyOverview.findFirst({
      where: {
        familyId,
        isActive: true,
      },
    })

    if (activeOverview) {
      // Create default income entry for the new user
      await db.userIncome.create({
        data: {
          overviewId: activeOverview.id,
          userId: newUser.id,
          salaryAmount: 0,
          salaryFrequency: 'monthly',
          monthlySalary: 0,
          additionalIncome: 0,
          notes: 'Invited family member',
        },
      })
    }

    // In a real app, you would send an invitation email here
    // For now, we'll just log it
    console.log(
      `Invitation would be sent to ${email} to join family ${familyId}`
    )

    revalidatePath('/profile')
    revalidatePath('/dashboard')

    return { success: true, userId: newUser.id }
  } catch (error) {
    console.error('Invite family member error:', error)
    return { error: 'Failed to invite family member' }
  }
}

export async function removeFamilyMember(userId: string) {
  const session = await auth()

  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Verify the user is in the same family
    const userToRemove = await db.user.findFirst({
      where: {
        id: userId,
        familyId: session.user.familyId,
      },
    })

    if (!userToRemove) {
      return { error: 'User not found in your family' }
    }

    // Prevent removing yourself
    if (userId === session.user.id) {
      return { error: 'You cannot remove yourself from the family' }
    }

    // Check if this is the last verified user (prevent removing last admin)
    const verifiedUsers = await db.user.count({
      where: {
        familyId: session.user.familyId,
        isVerified: true,
      },
    })

    if (userToRemove.isVerified && verifiedUsers <= 1) {
      return { error: 'Cannot remove the last verified family member' }
    }

    // Delete all user's data (cascade will handle related records)
    await db.$transaction(async (tx) => {
      // Delete user's income records
      await tx.userIncome.deleteMany({
        where: { userId },
      })

      // Delete user's expense records
      await tx.userExpense.deleteMany({
        where: { userId },
      })

      // Delete the user
      await tx.user.delete({
        where: { id: userId },
      })
    })

    revalidatePath('/profile')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Remove family member error:', error)
    return { error: 'Failed to remove family member' }
  }
}

export async function resendInvite(userId: string) {
  const session = await auth()

  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Verify the user is in the same family and not verified
    const userToInvite = await db.user.findFirst({
      where: {
        id: userId,
        familyId: session.user.familyId,
        isVerified: false,
      },
    })

    if (!userToInvite) {
      return { error: 'User not found or already verified' }
    }

    // Update the invitation timestamp
    await db.user.update({
      where: { id: userId },
      data: {
        invitedAt: new Date(),
        invitedBy: session.user.id,
      },
    })

    // In a real app, you would resend the invitation email here
    console.log(
      `Invitation resent to ${userToInvite.email} to join family ${session.user.familyId}`
    )

    revalidatePath('/profile')

    return { success: true }
  } catch (error) {
    console.error('Resend invite error:', error)
    return { error: 'Failed to resend invitation' }
  }
}

export async function createCategory({
  name,
  icon,
  color,
}: {
  name: string
  icon: string
  color: string
}) {
  const session = await auth()

  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    const category = await db.category.create({
      data: {
        familyId: session.user.familyId,
        name,
        icon,
        color,
      },
    })

    revalidatePath('/profile')
    revalidatePath('/dashboard')

    return { success: true, categoryId: category.id }
  } catch (error) {
    console.error('Create category error:', error)
    return { error: 'Failed to create category' }
  }
}

export async function updateCategory({
  id,
  name,
  icon,
  color,
}: {
  id: string
  name: string
  icon: string
  color: string
}) {
  const session = await auth()

  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Verify the category belongs to the user's family
    const category = await db.category.findFirst({
      where: {
        id,
        familyId: session.user.familyId,
      },
    })

    if (!category) {
      return { error: 'Category not found' }
    }

    await db.category.update({
      where: { id },
      data: { name, icon, color },
    })

    revalidatePath('/profile')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Update category error:', error)
    return { error: 'Failed to update category' }
  }
}

export async function deleteCategory(categoryId: string) {
  const session = await auth()

  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Verify the category belongs to the user's family
    const category = await db.category.findFirst({
      where: {
        id: categoryId,
        familyId: session.user.familyId,
      },
      include: {
        userExpenses: true,
      },
    })

    if (!category) {
      return { error: 'Category not found' }
    }

    if (category.userExpenses.length > 0) {
      return { error: 'Cannot delete category with existing expenses' }
    }

    await db.category.delete({
      where: { id: categoryId },
    })

    revalidatePath('/profile')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Delete category error:', error)
    return { error: 'Failed to delete category' }
  }
}

export async function resetCategoriesToDefaults() {
  const session = await auth()

  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Get all current categories with their expenses
    const currentCategories = await db.category.findMany({
      where: {
        familyId: session.user.familyId,
      },
      include: {
        userExpenses: true,
      },
    })

    // Start a transaction to ensure data consistency
    await db.$transaction(async (tx) => {
      // First check which default categories already exist
      const existingCategories = await tx.category.findMany({
        where: {
          familyId: session.user.familyId,
          name: { in: DEFAULT_CATEGORIES.map((c) => c.name) },
        },
      })

      const existingCategoryNames = new Set(
        existingCategories.map((c) => c.name)
      )

      // Create only missing default categories
      const categoriesToCreate = DEFAULT_CATEGORIES.filter(
        (cat) => !existingCategoryNames.has(cat.name)
      )

      const newCategories = await Promise.all(
        categoriesToCreate.map((cat) =>
          tx.category.create({
            data: {
              ...cat,
              familyId: session.user.familyId,
            },
          })
        )
      )

      // Combine existing and new categories
      const allDefaultCategories = [...existingCategories, ...newCategories]

      // Create a mapping of old categories to new categories
      const categoryMapping = new Map<string, string>()

      for (const oldCat of currentCategories) {
        // Skip if it's already a default category
        if (existingCategoryNames.has(oldCat.name)) {
          continue
        }

        // Try to find exact name match first
        let matchedNewCat = allDefaultCategories.find(
          (nc) => nc.name.toLowerCase() === oldCat.name.toLowerCase()
        )

        // If no exact match, try to find similar categories
        if (!matchedNewCat) {
          // Map common variations
          const mappings: Record<string, string> = {
            housing: 'Housing',
            home: 'Housing',
            mortgage: 'Housing',
            rent: 'Housing',
            utilities: 'Utilities',
            bills: 'Utilities',
            insurance: 'Insurance',
            transport: 'Transportation',
            transportation: 'Transportation',
            car: 'Transportation',
            vehicle: 'Transportation',
            childcare: 'Childcare',
            daycare: 'Childcare',
            kids: 'Childcare',
            healthcare: 'Healthcare',
            health: 'Healthcare',
            medical: 'Healthcare',
            food: 'Food & Groceries',
            groceries: 'Food & Groceries',
            shopping: 'Food & Groceries',
            subscriptions: 'Subscriptions',
            subscription: 'Subscriptions',
            streaming: 'Subscriptions',
            debt: 'Debt Payments',
            loan: 'Debt Payments',
            credit: 'Debt Payments',
            savings: 'Savings',
            investment: 'Savings',
            entertainment: 'Entertainment',
            fun: 'Entertainment',
            leisure: 'Entertainment',
          }

          const lowerName = oldCat.name.toLowerCase()
          for (const [key, defaultName] of Object.entries(mappings)) {
            if (lowerName.includes(key)) {
              matchedNewCat = allDefaultCategories.find(
                (nc) => nc.name === defaultName
              )
              break
            }
          }
        }

        // If still no match, default to "Other"
        if (!matchedNewCat) {
          matchedNewCat = allDefaultCategories.find(
            (nc) => nc.name === 'Other'
          )!
        }

        categoryMapping.set(oldCat.id, matchedNewCat.id)
      }

      // Update all expenses to use new categories
      for (const [oldCatId, newCatId] of Array.from(categoryMapping)) {
        await tx.userExpense.updateMany({
          where: {
            categoryId: oldCatId,
          },
          data: {
            categoryId: newCatId,
          },
        })
      }

      // Now delete old categories
      const defaultCategoryNames = DEFAULT_CATEGORIES.map((c) => c.name)
      await tx.category.deleteMany({
        where: {
          familyId: session.user.familyId,
          name: {
            notIn: defaultCategoryNames,
          },
        },
      })
    })

    revalidatePath('/profile')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Reset categories error:', error)
    return { error: 'Failed to reset categories' }
  }
}

export async function getResetCategoriesPreview() {
  const session = await auth()

  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Get all current categories with their expense counts
    const currentCategories = await db.category.findMany({
      where: {
        familyId: session.user.familyId,
      },
      include: {
        _count: {
          select: { userExpenses: true },
        },
      },
    })

    // Create migration preview
    const preview = currentCategories.map((cat) => {
      // Find matching default category
      let matchedDefault = DEFAULT_CATEGORIES.find(
        (dc) => dc.name.toLowerCase() === cat.name.toLowerCase()
      )

      if (!matchedDefault) {
        // Try fuzzy matching
        const lowerName = cat.name.toLowerCase()
        if (
          lowerName.includes('hous') ||
          lowerName.includes('home') ||
          lowerName.includes('mortgage') ||
          lowerName.includes('rent')
        ) {
          matchedDefault = DEFAULT_CATEGORIES.find(
            (dc) => dc.name === 'Housing'
          )
        } else if (
          lowerName.includes('transport') ||
          lowerName.includes('car') ||
          lowerName.includes('vehicle')
        ) {
          matchedDefault = DEFAULT_CATEGORIES.find(
            (dc) => dc.name === 'Transportation'
          )
        } else if (
          lowerName.includes('child') ||
          lowerName.includes('daycare') ||
          lowerName.includes('kids')
        ) {
          matchedDefault = DEFAULT_CATEGORIES.find(
            (dc) => dc.name === 'Childcare'
          )
        } else {
          matchedDefault = DEFAULT_CATEGORIES.find((dc) => dc.name === 'Other')
        }
      }

      return {
        current: {
          name: cat.name,
          icon: cat.icon,
          expenseCount: cat._count.userExpenses,
        },
        willMapTo: matchedDefault
          ? {
              name: matchedDefault.name,
              icon: matchedDefault.icon,
            }
          : null,
      }
    })

    return {
      success: true,
      preview,
      willAddCategories: DEFAULT_CATEGORIES.filter(
        (dc) =>
          !currentCategories.some(
            (cc) => cc.name.toLowerCase() === dc.name.toLowerCase()
          )
      ),
    }
  } catch (error) {
    console.error('Get reset preview error:', error)
    return { error: 'Failed to get reset preview' }
  }
}
