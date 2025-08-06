import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create family and user in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create family
      const family = await tx.family.create({
        data: {
          name: `${name}'s Family`,
        },
      })

      // Create user
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          name,
          familyId: family.id,
          isVerified: true,
          verifiedAt: new Date(),
        },
      })

      // Create default categories for the family
      const defaultCategories = [
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

      await tx.category.createMany({
        data: defaultCategories.map((cat) => ({
          ...cat,
          familyId: family.id,
        })),
      })

      return { user, family }
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
