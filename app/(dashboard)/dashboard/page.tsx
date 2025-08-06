import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { IncomeSection } from '@/components/income-section'
import { ExpenseSection } from '@/components/expense-section'
import {
  CardSummary,
  CurrencyDisplay,
  AnimateIn,
  EmptyState,
  ButtonPrimary,
} from '@/components/ui/design-system'
import {
  updateUserIncome,
  updateUserExpense,
  deleteUserExpense,
  addUserExpense,
  createMonthlyOverview,
} from './actions'

async function getOverviewData(familyId: string) {
  const [activeOverview, categories, users, allOverviews] = await Promise.all([
    db.monthlyOverview.findFirst({
      where: {
        familyId,
        isActive: true,
      },
      include: {
        userIncome: {
          include: {
            user: true,
          },
        },
        userExpenses: {
          include: {
            user: true,
            category: true,
          },
        },
      },
    }),
    db.category.findMany({
      where: { familyId },
      orderBy: { name: 'asc' },
    }),
    db.user.findMany({
      where: { familyId },
      orderBy: { name: 'asc' },
    }),
    db.monthlyOverview.findMany({
      where: { familyId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
      },
    }),
  ])

  // Ensure all family members have income entries
  if (activeOverview) {
    const usersWithIncome = new Set(
      activeOverview.userIncome.map((ui) => ui.userId)
    )
    const usersWithoutIncome = users.filter((u) => !usersWithIncome.has(u.id))

    // Create default income entries for users without them
    for (const user of usersWithoutIncome) {
      await db.userIncome.create({
        data: {
          overviewId: activeOverview.id,
          userId: user.id,
          salaryAmount: 0,
          salaryFrequency: 'monthly',
          monthlySalary: 0,
          additionalIncome: 0,
          notes: user.isVerified ? null : 'Unverified family member',
        },
      })
    }

    // Refetch the overview with all income entries
    const updatedOverview = await db.monthlyOverview.findFirst({
      where: {
        id: activeOverview.id,
      },
      include: {
        userIncome: {
          include: {
            user: true,
          },
          orderBy: {
            user: {
              createdAt: 'asc',
            },
          },
        },
        userExpenses: {
          include: {
            user: true,
            category: true,
          },
        },
      },
    })

    return { activeOverview: updatedOverview, categories, users, allOverviews }
  }

  return { activeOverview, categories, users, allOverviews }
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.familyId) {
    redirect('/login')
  }

  const {
    activeOverview: overview,
    categories,
    users,
    allOverviews,
  } = await getOverviewData(session.user.familyId)

  // If no overviews exist, show the create form
  if (allOverviews.length === 0) {
    return (
      <div className="bg-surface-base min-h-screen">
        <div className="container mx-auto max-w-4xl p-6">
          <AnimateIn>
            <EmptyState
              title="Welcome to Your Family Budget"
              description="Let's create your first budget scenario to get started."
              action={
                <form
                  action={createMonthlyOverview}
                  className="mx-auto w-full max-w-md"
                >
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Budget Scenario Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g., Current Budget, 2024 Plan"
                      className="shadow-inner-subtle focus:border-brand-primary flex-1 rounded-lg border-2 border-transparent bg-white px-4 py-3 transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] focus:outline-none"
                      required
                      autoFocus
                    />
                    <ButtonPrimary type="submit">Create</ButtonPrimary>
                  </div>
                  <p className="mt-3 text-center text-xs text-gray-500">
                    You can create multiple scenarios later to compare different
                    financial situations.
                  </p>
                </form>
              }
            />
          </AnimateIn>
        </div>
      </div>
    )
  }

  // Calculate totals
  const totalIncome =
    overview?.userIncome.reduce(
      (sum, income) =>
        sum + Number(income.monthlySalary) + Number(income.additionalIncome),
      0
    ) || 0

  const userExpenseTotals = new Map<string, number>()
  const categoryTotals = new Map<string, number>()

  overview?.userExpenses.forEach((expense) => {
    const amount = Number(expense.amount)
    const userId = expense.userId

    // Add to user total
    const currentUserTotal = userExpenseTotals.get(userId) || 0
    userExpenseTotals.set(userId, currentUserTotal + amount)

    // Add to category total
    const categoryName = expense.category.name
    const currentCategoryTotal = categoryTotals.get(categoryName) || 0
    categoryTotals.set(categoryName, currentCategoryTotal + amount)
  })

  const totalExpenses = Array.from(userExpenseTotals.values()).reduce(
    (sum, amount) => sum + amount,
    0
  )
  const remainingBudget = totalIncome - totalExpenses

  return (
    <div className="bg-surface-base min-h-screen">
      <div className="container mx-auto max-w-6xl p-6">
        {!overview ? (
          <AnimateIn delay={200}>
            <EmptyState
              title="Loading budget data..."
              description="Please wait while we fetch your financial overview"
              className="mt-12"
            />
          </AnimateIn>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="mb-8 grid gap-6 md:grid-cols-3">
              <AnimateIn delay={200}>
                <CardSummary className="relative h-full overflow-hidden">
                  <div className="bg-income-primary/10 absolute top-0 right-0 -mt-12 -mr-12 h-24 w-24 rounded-full" />
                  <div className="relative">
                    <p className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                      Total Income
                    </p>
                    <CurrencyDisplay
                      value={totalIncome}
                      size="xlarge"
                      color="income"
                    />
                    <p className="mt-3 text-sm text-gray-600">Monthly</p>
                  </div>
                </CardSummary>
              </AnimateIn>

              <AnimateIn delay={300}>
                <CardSummary className="relative h-full overflow-hidden">
                  <div className="bg-expense-primary/10 absolute top-0 right-0 -mt-12 -mr-12 h-24 w-24 rounded-full" />
                  <div className="relative">
                    <p className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                      Total Expenses
                    </p>
                    <CurrencyDisplay
                      value={totalExpenses}
                      size="xlarge"
                      color="expense"
                    />
                    <p className="mt-3 text-sm text-gray-600">Fixed costs</p>
                  </div>
                </CardSummary>
              </AnimateIn>

              <AnimateIn delay={400}>
                <CardSummary className="relative h-full overflow-hidden">
                  <div className="bg-brand-primary/10 absolute top-0 right-0 -mt-12 -mr-12 h-24 w-24 rounded-full" />
                  <div className="relative">
                    <p className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                      Remaining
                    </p>
                    <CurrencyDisplay
                      value={remainingBudget}
                      size="xlarge"
                      color={remainingBudget >= 0 ? 'income' : 'expense'}
                    />
                    <p className="mt-3 text-sm text-gray-600">
                      {totalIncome > 0
                        ? `${((remainingBudget / totalIncome) * 100).toFixed(1)}% of income`
                        : '0% of income'}
                    </p>
                  </div>
                </CardSummary>
              </AnimateIn>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Income Section */}
              <AnimateIn delay={500}>
                <IncomeSection
                  userIncomes={overview.userIncome.map((income) => ({
                    ...income,
                    salaryAmount: Number(income.salaryAmount),
                    salaryFrequency: income.salaryFrequency,
                    monthlySalary: Number(income.monthlySalary),
                    additionalIncome: Number(income.additionalIncome),
                  }))}
                  onUpdate={updateUserIncome}
                />
              </AnimateIn>

              {/* Expenses Section */}
              <AnimateIn delay={600}>
                <ExpenseSection
                  userExpenses={overview.userExpenses.map((expense) => ({
                    ...expense,
                    amount: Number(expense.amount),
                    sharePercentage: expense.sharePercentage ?? 0,
                    category: {
                      ...expense.category,
                      icon: expense.category.icon ?? '',
                      color: expense.category.color ?? '',
                    },
                  }))}
                  categories={categories.map((cat) => ({
                    ...cat,
                    icon: cat.icon ?? '',
                    color: cat.color ?? '',
                  }))}
                  users={users.map((u) => ({ id: u.id, name: u.name }))}
                  onUpdate={updateUserExpense}
                  onDelete={deleteUserExpense}
                  onAdd={addUserExpense}
                />
              </AnimateIn>
            </div>

            {/* Bottom Actions */}
            <AnimateIn delay={700}>
              <div className="mt-12 flex justify-center gap-4">
                <button className="rounded-lg border-2 border-gray-200 bg-white px-6 py-3 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm">
                  Edit Overview
                </button>
                <ButtonPrimary className="bg-income-primary hover:bg-income-primary/90">
                  Export PDF
                </ButtonPrimary>
              </div>
            </AnimateIn>
          </>
        )}
      </div>
    </div>
  )
}
