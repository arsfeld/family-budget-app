'use client'

import { useRef } from 'react'
import { ExpenseGrid } from './expense-grid'
import { Plus } from 'lucide-react'
import {
  HeadingSection,
  CurrencyDisplay,
  AnimateIn,
} from '@/components/ui/components'

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

interface UserExpense {
  id: string
  userId: string
  categoryId: string
  name: string
  amount: number
  isShared: boolean
  sharePercentage: number
  notes: string | null
  category: Category
  user: {
    id: string
    name: string
    email: string
  }
}

interface ExpenseSectionProps {
  userExpenses: UserExpense[]
  categories: Category[]
  users: Array<{ id: string; name: string }>
  currentUserId?: string
  onUpdate: (
    expenseId: string,
    data: {
      name?: string
      amount?: number
      categoryId?: string
      isShared?: boolean
      sharePercentage?: number
      notes?: string
    }
  ) => Promise<void>
  onDelete: (expenseId: string) => Promise<void>
  onAdd: (data: {
    userId: string
    categoryId: string
    name: string
    amount: number
    isShared: boolean
    sharePercentage: number
    notes?: string
  }) => Promise<void>
}

export function ExpenseSection({
  userExpenses,
  categories,
  users,
  currentUserId,
  onUpdate,
  onDelete,
  onAdd,
}: ExpenseSectionProps) {
  const expenseGridRef = useRef<{ addNewRow: () => void }>(null)
  // Calculate totals
  const categoryTotals = userExpenses.reduce(
    (acc, expense) => {
      const categoryName = expense.category.name
      acc[categoryName] = (acc[categoryName] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>
  )


  const totalExpenses = userExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  const handleSaveExpense = async (expense: {
    id?: string
    userId: string
    name: string
    categoryId: string
    amount: number
    isShared?: boolean
    sharePercentage?: number
  }) => {
    if (expense.id && !expense.id.startsWith('new-')) {
      // Update existing expense
      await onUpdate(expense.id, {
        name: expense.name,
        categoryId: expense.categoryId,
        amount: expense.amount,
        isShared: expense.isShared,
        sharePercentage: expense.sharePercentage,
      })
    } else {
      // Add new expense
      await onAdd({
        userId: expense.userId,
        categoryId: expense.categoryId,
        name: expense.name,
        amount: expense.amount,
        isShared: expense.isShared || false,
        sharePercentage: expense.sharePercentage || 100,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <HeadingSection>Monthly Expenses</HeadingSection>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Total:</span>
            <CurrencyDisplay value={totalExpenses} color="expense" />
          </div>
          <button
            onClick={() => expenseGridRef.current?.addNewRow()}
            className="rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 px-3 py-1.5 text-sm font-medium text-white transition-all hover:from-amber-700 hover:to-orange-700 hover:shadow-md flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Expense Grid */}
      <AnimateIn>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <ExpenseGrid
            ref={expenseGridRef}
            users={users}
            categories={categories}
            existingExpenses={userExpenses.map((e) => ({
              id: e.id,
              userId: e.userId,
              name: e.name,
              categoryId: e.categoryId,
              amount: e.amount,
              isShared: e.isShared,
              sharePercentage: e.sharePercentage,
            }))}
            currentUserId={currentUserId}
            onSave={handleSaveExpense}
            onDelete={onDelete}
          />
        </div>
      </AnimateIn>

      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <AnimateIn delay={200}>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Spending by Category
            </h3>
            <div className="space-y-3">
              {Object.entries(categoryTotals)
                .sort(([, a], [, b]) => b - a)
                .map(([category, total]) => {
                  const percentage = (total / totalExpenses) * 100
                  const categoryObj = categories.find((c) => c.name === category)
                  
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-xl">{categoryObj?.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              {category}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500">
                                {percentage.toFixed(0)}%
                              </span>
                              <CurrencyDisplay value={total} size="small" />
                            </div>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </AnimateIn>
      )}
    </div>
  )
}