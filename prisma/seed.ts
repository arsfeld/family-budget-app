import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create a demo family
  const demoFamily = await prisma.family.create({
    data: {
      name: 'Demo Family',
    },
  })

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const user1 = await prisma.user.create({
    data: {
      email: 'john@demo.com',
      passwordHash: hashedPassword,
      name: 'John Demo',
      familyId: demoFamily.id,
      isVerified: true,
      verifiedAt: new Date(),
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@demo.com',
      passwordHash: hashedPassword,
      name: 'Jane Demo',
      familyId: demoFamily.id,
      isVerified: true,
      verifiedAt: new Date(),
    },
  })

  // Create default expense categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        familyId: demoFamily.id,
        name: 'Housing',
        icon: '🏠',
        color: '#10b981',
      },
    }),
    prisma.category.create({
      data: {
        familyId: demoFamily.id,
        name: 'Utilities',
        icon: '💡',
        color: '#3b82f6',
      },
    }),
    prisma.category.create({
      data: {
        familyId: demoFamily.id,
        name: 'Insurance',
        icon: '🛡️',
        color: '#8b5cf6',
      },
    }),
    prisma.category.create({
      data: {
        familyId: demoFamily.id,
        name: 'Transportation',
        icon: '🚗',
        color: '#ec4899',
      },
    }),
    prisma.category.create({
      data: {
        familyId: demoFamily.id,
        name: 'Childcare',
        icon: '👶',
        color: '#06b6d4',
      },
    }),
    prisma.category.create({
      data: {
        familyId: demoFamily.id,
        name: 'Healthcare',
        icon: '🏥',
        color: '#14b8a6',
      },
    }),
    prisma.category.create({
      data: {
        familyId: demoFamily.id,
        name: 'Food & Groceries',
        icon: '🛒',
        color: '#84cc16',
      },
    }),
    prisma.category.create({
      data: {
        familyId: demoFamily.id,
        name: 'Subscriptions',
        icon: '📱',
        color: '#ef4444',
      },
    }),
    prisma.category.create({
      data: {
        familyId: demoFamily.id,
        name: 'Debt Payments',
        icon: '💳',
        color: '#f97316',
      },
    }),
    prisma.category.create({
      data: {
        familyId: demoFamily.id,
        name: 'Savings',
        icon: '💰',
        color: '#22c55e',
      },
    }),
    prisma.category.create({
      data: {
        familyId: demoFamily.id,
        name: 'Entertainment',
        icon: '🎬',
        color: '#a855f7',
      },
    }),
    prisma.category.create({
      data: {
        familyId: demoFamily.id,
        name: 'Other',
        icon: '📦',
        color: '#f59e0b',
      },
    }),
  ])

  // Create initial monthly overview (Current)
  const currentOverview = await prisma.monthlyOverview.create({
    data: {
      familyId: demoFamily.id,
      name: 'Current',
      isActive: true,
    },
  })

  // Create user income for current overview
  await prisma.userIncome.create({
    data: {
      overviewId: currentOverview.id,
      userId: user1.id,
      salaryAmount: 2500,
      salaryFrequency: 'biweekly',
      monthlySalary: 5416.67, // 2500 * 26 / 12
      additionalIncome: 0,
      notes: 'Software Engineer',
    },
  })

  await prisma.userIncome.create({
    data: {
      overviewId: currentOverview.id,
      userId: user2.id,
      salaryAmount: 4000,
      salaryFrequency: 'monthly',
      monthlySalary: 4000,
      additionalIncome: 500,
      notes: 'Marketing Manager + Freelance',
    },
  })

  // Create user expenses for current overview
  // John's expenses
  await prisma.userExpense.create({
    data: {
      overviewId: currentOverview.id,
      userId: user1.id,
      categoryId: categories[0].id, // Housing
      name: 'Mortgage',
      amount: 1200,
      isShared: true,
      sharePercentage: 50,
      notes: 'Monthly mortgage payment',
    },
  })

  await prisma.userExpense.create({
    data: {
      overviewId: currentOverview.id,
      userId: user1.id,
      categoryId: categories[3].id, // Transportation
      name: 'Car Payment',
      amount: 450,
      isShared: false,
      notes: 'Honda Civic loan',
    },
  })

  // Jane's expenses
  await prisma.userExpense.create({
    data: {
      overviewId: currentOverview.id,
      userId: user2.id,
      categoryId: categories[0].id, // Housing
      name: 'Mortgage',
      amount: 1200,
      isShared: true,
      sharePercentage: 50,
      notes: 'Monthly mortgage payment',
    },
  })

  await prisma.userExpense.create({
    data: {
      overviewId: currentOverview.id,
      userId: user2.id,
      categoryId: categories[1].id, // Utilities
      name: 'Utilities Bundle',
      amount: 300,
      isShared: true,
      sharePercentage: 50,
      notes: 'Electric, Water, Internet',
    },
  })

  await prisma.userExpense.create({
    data: {
      overviewId: currentOverview.id,
      userId: user2.id,
      categoryId: categories[2].id, // Insurance
      name: 'Health Insurance',
      amount: 250,
      isShared: false,
      notes: 'Family health plan',
    },
  })

  // Add more example expenses
  await prisma.userExpense.create({
    data: {
      overviewId: currentOverview.id,
      userId: user1.id,
      categoryId: categories[4].id, // Childcare
      name: 'Daycare',
      amount: 800,
      isShared: true,
      sharePercentage: 50,
      notes: 'Little Stars Daycare',
    },
  })

  // Create a planned overview (clone of current with modifications)
  const plannedOverview = await prisma.monthlyOverview.create({
    data: {
      familyId: demoFamily.id,
      name: 'Planned Budget',
      isActive: false,
    },
  })

  // Copy income to planned overview with raise
  await prisma.userIncome.create({
    data: {
      overviewId: plannedOverview.id,
      userId: user1.id,
      salaryAmount: 60000,
      salaryFrequency: 'yearly',
      monthlySalary: 5000, // 60000 / 12
      additionalIncome: 0,
      notes: 'Software Engineer (with raise)',
    },
  })

  await prisma.userIncome.create({
    data: {
      overviewId: plannedOverview.id,
      userId: user2.id,
      salaryAmount: 2000,
      salaryFrequency: 'semimonthly',
      monthlySalary: 4000, // 2000 * 2
      additionalIncome: 1000, // More freelance
      notes: 'Marketing Manager + More Freelance',
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('Demo users:')
  console.log('- Email: john@demo.com, Password: demo123')
  console.log('- Email: jane@demo.com, Password: demo123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })