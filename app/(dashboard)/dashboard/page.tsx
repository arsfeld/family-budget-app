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
} from '@/components/ui/design-system'
import {
  IncomeCardSpotlight,
  ExpenseCardSpotlight,
  SummaryCardSpotlight,
  PrimaryButton,
  CardSkeletonLoader,
} from '@/components/ui/aceternity'
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
        isArchived: true,
        archivedAt: true,
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-100/20 via-transparent to-transparent" />
        <div className="container relative mx-auto max-w-4xl p-6">
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
                      className="flex-1 rounded-xl border border-gray-200/50 bg-white/80 px-5 py-3.5 backdrop-blur-sm transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300/50 hover:bg-white/90 focus:border-indigo-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08)] focus:outline-none"
                      required
                      autoFocus
                    />
                    <PrimaryButton type="submit">Create</PrimaryButton>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-100/20 via-transparent to-transparent" />
      <div className="container relative mx-auto max-w-6xl p-6">
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
            <div className="mb-10 grid gap-6 md:grid-cols-3">
              <AnimateIn delay={200}>
                <IncomeCardSpotlight className="p-8">
                  <p className="mb-3 text-[11px] font-semibold tracking-[0.08em] text-emerald-700/60 uppercase">
                    Total Income
                  </p>
                  <CurrencyDisplay
                    value={totalIncome}
                    size="xlarge"
                    color="income"
                  />
                  <p className="mt-4 text-sm font-medium text-emerald-600/70">Monthly revenue</p>
                </IncomeCardSpotlight>
              </AnimateIn>

              <AnimateIn delay={300}>
                <ExpenseCardSpotlight className="p-8">
                  <p className="mb-3 text-[11px] font-semibold tracking-[0.08em] text-amber-700/60 uppercase">
                    Total Expenses
                  </p>
                  <CurrencyDisplay
                    value={totalExpenses}
                    size="xlarge"
                    color="expense"
                  />
                  <p className="mt-4 text-sm font-medium text-amber-600/70">Fixed costs</p>
                </ExpenseCardSpotlight>
              </AnimateIn>

              <AnimateIn delay={400}>
                <SummaryCardSpotlight className="p-8" isPositive={remainingBudget >= 0}>
                  <p className="mb-3 text-[11px] font-semibold tracking-[0.08em] uppercase"
                     style={{ color: remainingBudget >= 0 ? 'rgb(99 102 241 / 0.6)' : 'rgb(244 63 94 / 0.6)' }}>
                    Balance
                  </p>
                  <CurrencyDisplay
                    value={remainingBudget}
                    size="xlarge"
                    color={remainingBudget >= 0 ? 'income' : 'expense'}
                  />
                  <p className="mt-4 text-sm font-medium"
                     style={{ color: remainingBudget >= 0 ? 'rgb(99 102 241 / 0.7)' : 'rgb(244 63 94 / 0.7)' }}>
                    {totalIncome > 0
                      ? `${((remainingBudget / totalIncome) * 100).toFixed(1)}% of income`
                      : '0% of income'}
                  </p>
                </SummaryCardSpotlight>
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
                  familyId={session.user.familyId}
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
                <button className="rounded-xl border border-gray-200/50 bg-white/60 px-7 py-3.5 font-medium text-gray-700 backdrop-blur-sm transition-all duration-200 hover:bg-white/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                  Edit Overview
                </button>
                <PrimaryButton className="rounded-xl px-7 py-3.5">
                  Export PDF
                </PrimaryButton>
              </div>
            </AnimateIn>
          </>
        )}
      </div>
    </div>
  )
}
