import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { FlexibleIncomeSection } from '@/components/flexible-income-section'
import { ExpenseSection } from '@/components/expense-section'
import {
  IncomeCardSpotlight,
  ExpenseCardSpotlight,
  SummaryCardSpotlight,
} from '@/components/ui/aceternity'
import {
  CurrencyDisplay,
  AnimateIn,
  EmptyState,
  ButtonPrimary,
} from '@/components/ui/components'
import {
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
        incomes: {
          include: {
            user: true,
          },
          orderBy: [
            { type: 'asc' },
            { name: 'asc' },
          ],
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

  // Ensure all family members have at least one salary income entry
  if (activeOverview) {
    const usersWithSalaryIncome = new Set(
      activeOverview.incomes
        .filter(income => income.type === 'salary' && income.userId)
        .map(income => income.userId)
    )
    const usersWithoutSalaryIncome = users.filter((u) => !usersWithSalaryIncome.has(u.id))

    // Create default salary income entries for users without them
    for (const user of usersWithoutSalaryIncome) {
      await db.income.create({
        data: {
          overviewId: activeOverview.id,
          userId: user.id,
          name: `${user.name}'s Salary`,
          type: 'salary',
          amount: 0,
          frequency: 'monthly',
          monthlyAmount: 0,
          notes: user.isVerified ? null : 'Unverified family member',
        },
      })
    }

    // Refetch the overview with all income entries if we added any
    if (usersWithoutSalaryIncome.length > 0) {
      const updatedOverview = await db.monthlyOverview.findFirst({
        where: {
          id: activeOverview.id,
        },
        include: {
          incomes: {
            include: {
              user: true,
            },
            orderBy: [
              { type: 'asc' },
              { name: 'asc' },
            ],
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
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Budget Scenario Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g., Current Budget, 2024 Plan"
                      className="flex-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-neutral-800/80 px-5 py-3.5 backdrop-blur-sm transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:bg-white/90 dark:hover:bg-neutral-800/90 focus:border-indigo-300 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-neutral-800 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08)] dark:focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] focus:outline-none text-gray-900 dark:text-gray-100"
                      required
                      autoFocus
                    />
                    <ButtonPrimary type="submit">Create</ButtonPrimary>
                  </div>
                  <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
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
    overview?.incomes.reduce(
      (sum, income) => sum + Number(income.monthlyAmount),
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950/50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/20 via-transparent to-transparent dark:from-indigo-950/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-100/20 via-transparent to-transparent dark:from-emerald-950/20" />
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
                  <p className="mb-3 text-[11px] font-semibold tracking-[0.08em] text-emerald-700/60 dark:text-emerald-400/60 uppercase">
                    Total Income
                  </p>
                  <CurrencyDisplay
                    value={totalIncome}
                    size="large"
                    color="income"
                  />
                  <p className="mt-4 text-sm font-medium text-emerald-600/70 dark:text-emerald-400/70">Monthly revenue</p>
                </IncomeCardSpotlight>
              </AnimateIn>

              <AnimateIn delay={300}>
                <ExpenseCardSpotlight className="p-8">
                  <p className="mb-3 text-[11px] font-semibold tracking-[0.08em] text-amber-700/60 dark:text-amber-400/60 uppercase">
                    Total Expenses
                  </p>
                  <CurrencyDisplay
                    value={totalExpenses}
                    size="large"
                    color="expense"
                  />
                  <p className="mt-4 text-sm font-medium text-amber-600/70 dark:text-amber-400/70">Fixed costs</p>
                </ExpenseCardSpotlight>
              </AnimateIn>

              <AnimateIn delay={400}>
                <SummaryCardSpotlight className="p-8" isPositive={remainingBudget >= 0}>
                  <p className={`mb-3 text-[11px] font-semibold tracking-[0.08em] uppercase ${
                    remainingBudget >= 0 
                      ? 'text-indigo-600/60 dark:text-indigo-400/60' 
                      : 'text-rose-600/60 dark:text-rose-400/60'
                  }`}>
                    Balance
                  </p>
                  <CurrencyDisplay
                    value={remainingBudget}
                    size="large"
                    color={remainingBudget >= 0 ? 'income' : 'expense'}
                  />
                  <p className={`mt-4 text-sm font-medium ${
                    remainingBudget >= 0 
                      ? 'text-indigo-600/70 dark:text-indigo-400/70' 
                      : 'text-rose-600/70 dark:text-rose-400/70'
                  }`}>
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
                <FlexibleIncomeSection
                  incomes={overview.incomes.map((income) => ({
                    ...income,
                    amount: Number(income.amount),
                    monthlyAmount: Number(income.monthlyAmount),
                  }))}
                  users={users}
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
                  currentUserId={session.user.id}
                  onUpdate={updateUserExpense}
                  onDelete={deleteUserExpense}
                  onAdd={addUserExpense}
                />
              </AnimateIn>
            </div>

          </>
        )}
      </div>
    </div>
  )
}
