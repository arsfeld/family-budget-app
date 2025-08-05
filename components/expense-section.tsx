"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import { 
  CardExpense,
  HeadingSection,
  CurrencyDisplay,
  InputCurrency,
  StatusIndicator,
  EmptyState,
  ButtonPrimary,
  AnimateIn
} from "@/components/ui/design-system"
import { Edit2, Trash2, Plus } from "lucide-react"

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
  onUpdate: (expenseId: string, data: { name?: string; amount?: number; categoryId?: string; isShared?: boolean; sharePercentage?: number; notes?: string }) => Promise<void>
  onDelete: (expenseId: string) => Promise<void>
  onAdd: (data: { userId: string; categoryId: string; name: string; amount: number; isShared: boolean; sharePercentage: number; notes?: string }) => Promise<void>
}

export function ExpenseSection({ userExpenses, categories, users, onUpdate, onDelete, onAdd }: ExpenseSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<{
    name: string
    amount: string
    categoryId: string
    isShared: boolean
    sharePercentage: string
    notes: string
  }>({ name: "", amount: "", categoryId: "", isShared: false, sharePercentage: "100", notes: "" })
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newExpense, setNewExpense] = useState<{
    userId: string
    categoryId: string
    name: string
    amount: string
    isShared: boolean
    sharePercentage: string
    notes: string
  }>({ userId: users[0]?.id || "", categoryId: categories[0]?.id || "", name: "", amount: "", isShared: false, sharePercentage: "100", notes: "" })

  const startEditing = (expense: UserExpense) => {
    setEditingId(expense.id)
    setEditingData({
      name: expense.name,
      amount: expense.amount.toString(),
      categoryId: expense.categoryId,
      isShared: expense.isShared,
      sharePercentage: expense.sharePercentage.toString(),
      notes: expense.notes || "",
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingData({ name: "", amount: "", categoryId: "", isShared: false, sharePercentage: "100", notes: "" })
  }

  const saveChanges = async (expenseId: string) => {
    setSaving(true)
    try {
      await onUpdate(expenseId, {
        name: editingData.name,
        amount: parseFloat(editingData.amount) || 0,
        categoryId: editingData.categoryId,
        isShared: editingData.isShared,
        sharePercentage: parseInt(editingData.sharePercentage) || 100,
        notes: editingData.notes || null,
      })
      cancelEditing()
    } catch (error) {
      console.error("Failed to update expense:", error)
    } finally {
      setSaving(false)
    }
  }

  const deleteExpense = async (expenseId: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await onDelete(expenseId)
      } catch (error) {
        console.error("Failed to delete expense:", error)
      }
    }
  }

  const addNewExpense = async () => {
    setSaving(true)
    try {
      await onAdd({
        userId: newExpense.userId,
        categoryId: newExpense.categoryId,
        name: newExpense.name,
        amount: parseFloat(newExpense.amount) || 0,
        isShared: newExpense.isShared,
        sharePercentage: parseInt(newExpense.sharePercentage) || 100,
        notes: newExpense.notes || null,
      })
      setShowAddForm(false)
      setNewExpense({ 
        userId: users[0]?.id || "", 
        categoryId: categories[0]?.id || "", 
        name: "",
        amount: "", 
        isShared: false, 
        sharePercentage: "100", 
        notes: "" 
      })
    } catch (error) {
      console.error("Failed to add expense:", error)
    } finally {
      setSaving(false)
    }
  }

  // Group expenses by user
  const expensesByUser = userExpenses.reduce((acc, expense) => {
    if (!acc[expense.userId]) {
      acc[expense.userId] = []
    }
    acc[expense.userId].push(expense)
    return acc
  }, {} as Record<string, UserExpense[]>)

  // Calculate totals
  const userTotals = Object.entries(expensesByUser).reduce((acc, [userId, expenses]) => {
    acc[userId] = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    return acc
  }, {} as Record<string, number>)

  const categoryTotals = userExpenses.reduce((acc, expense) => {
    const categoryName = expense.category.name
    acc[categoryName] = (acc[categoryName] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)

  const totalExpenses = Object.values(userTotals).reduce((sum, amount) => sum + amount, 0)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <HeadingSection>Monthly Expenses</HeadingSection>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Total:</span>
            <CurrencyDisplay value={totalExpenses} color="expense" />
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-expense-primary hover:bg-expense-primary/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow-md"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Expense
          </button>
        </div>
      </div>

      {showAddForm && (
        <AnimateIn>
          <CardExpense className="mb-6 border-2 border-expense-primary/30 bg-expense-primary/5">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Add New Expense</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Person</label>
                  <select
                    value={newExpense.userId}
                    onChange={(e) => setNewExpense({ ...newExpense, userId: e.target.value })}
                    className="w-full px-4 py-3 bg-white rounded-lg border-2 border-transparent shadow-inner-subtle transition-all duration-200 hover:border-gray-300 focus:outline-none focus:border-expense-primary focus:shadow-[0_0_0_3px_rgba(245,158,11,0.1)]"
                  >
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newExpense.categoryId}
                    onChange={(e) => setNewExpense({ ...newExpense, categoryId: e.target.value })}
                    className="w-full px-4 py-3 bg-white rounded-lg border-2 border-transparent shadow-inner-subtle transition-all duration-200 hover:border-gray-300 focus:outline-none focus:border-expense-primary focus:shadow-[0_0_0_3px_rgba(245,158,11,0.1)]"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expense Name</label>
                <input
                  type="text"
                  value={newExpense.name}
                  onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white rounded-lg border-2 border-transparent shadow-inner-subtle transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:border-expense-primary focus:shadow-[0_0_0_3px_rgba(245,158,11,0.1)]"
                  placeholder="e.g., Mortgage, Daycare, Netflix"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <InputCurrency
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="0.00"
                    className="focus:border-expense-primary focus:shadow-[0_0_0_3px_rgba(245,158,11,0.1)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shared?</label>
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="checkbox"
                      checked={newExpense.isShared}
                      onChange={(e) => setNewExpense({ ...newExpense, isShared: e.target.checked })}
                      className="h-5 w-5 rounded border-gray-300 text-expense-primary focus:ring-expense-primary"
                    />
                    {newExpense.isShared && (
                      <>
                        <input
                          type="number"
                          value={newExpense.sharePercentage}
                          onChange={(e) => setNewExpense({ ...newExpense, sharePercentage: e.target.value })}
                          className="w-20 px-3 py-2 rounded-lg border-2 border-transparent shadow-inner-subtle font-mono"
                          placeholder="100"
                          min="0"
                          max="100"
                        />
                        <span className="text-sm text-gray-600">%</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-white rounded-lg border-2 border-transparent shadow-inner-subtle transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:border-expense-primary focus:shadow-[0_0_0_3px_rgba(245,158,11,0.1)]"
                  placeholder="e.g., Monthly subscription"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:shadow-sm transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <ButtonPrimary
                  onClick={addNewExpense}
                  disabled={saving || !newExpense.amount || !newExpense.name}
                  className="bg-expense-primary hover:bg-expense-primary/90"
                >
                  {saving ? "Adding..." : "Add Expense"}
                </ButtonPrimary>
              </div>
            </div>
          </CardExpense>
        </AnimateIn>
      )}

      <div className="space-y-6">
        {Object.entries(expensesByUser).map(([userId, expenses], index) => {
          const user = users.find(u => u.id === userId)
          const userTotal = userTotals[userId] || 0

          return (
            <AnimateIn key={userId} delay={index * 100}>
              <CardExpense>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
                  <CurrencyDisplay value={userTotal} color="expense" />
                </div>
                <div className="space-y-3">
                  {expenses.map((expense) => {
                    const isEditing = editingId === expense.id

                    if (isEditing) {
                      return (
                        <div key={expense.id} className="rounded-lg border-2 border-expense-primary/30 bg-expense-primary/5 p-4">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Expense Name</label>
                              <input
                                type="text"
                                value={editingData.name}
                                onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                                className="w-full px-4 py-2 bg-white rounded-lg border-2 border-transparent shadow-inner-subtle"
                                placeholder="e.g., Mortgage, Daycare"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                  value={editingData.categoryId}
                                  onChange={(e) => setEditingData({ ...editingData, categoryId: e.target.value })}
                                  className="w-full px-4 py-2 bg-white rounded-lg border-2 border-transparent shadow-inner-subtle"
                                >
                                  {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                      {category.icon} {category.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <InputCurrency
                                  value={editingData.amount}
                                  onChange={(e) => setEditingData({ ...editingData, amount: e.target.value })}
                                  className="h-[42px] text-base"
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={editingData.isShared}
                                  onChange={(e) => setEditingData({ ...editingData, isShared: e.target.checked })}
                                  className="h-4 w-4 rounded border-gray-300 text-expense-primary"
                                />
                                <span className="text-sm font-medium">Shared</span>
                              </label>
                              {editingData.isShared && (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={editingData.sharePercentage}
                                    onChange={(e) => setEditingData({ ...editingData, sharePercentage: e.target.value })}
                                    className="w-20 px-3 py-1 rounded-lg border-2 border-transparent shadow-inner-subtle font-mono"
                                    min="0"
                                    max="100"
                                  />
                                  <span className="text-sm text-gray-600">%</span>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                              <button
                                onClick={cancelEditing}
                                className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <ButtonPrimary
                                onClick={() => saveChanges(expense.id)}
                                disabled={saving}
                                className="bg-expense-primary hover:bg-expense-primary/90"
                              >
                                Save
                              </ButtonPrimary>
                            </div>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div key={expense.id} className="group flex items-center justify-between rounded-lg p-3 hover:bg-expense-light/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{expense.category.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900">{expense.name || expense.category.name}</p>
                            <p className="text-sm text-gray-500">
                              {expense.category.name}
                              {expense.isShared && (
                                <StatusIndicator type="neutral" className="ml-2 text-xs">
                                  {expense.sharePercentage}% shared
                                </StatusIndicator>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <CurrencyDisplay value={expense.amount} size="default" />
                          <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => startEditing(expense)}
                              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                              title="Edit expense"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteExpense(expense.id)}
                              className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                              title="Delete expense"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardExpense>
            </AnimateIn>
          )
        })}
      </div>

      {userExpenses.length === 0 && !showAddForm && (
        <EmptyState
          title="No expenses yet"
          description="Click 'Add Expense' to start tracking your monthly costs"
          action={
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-expense-primary hover:bg-expense-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              Add Your First Expense
            </button>
          }
        />
      )}

      {/* Category Summary */}
      {Object.keys(categoryTotals).length > 0 && (
        <AnimateIn delay={300}>
          <div className="mt-8 p-6 bg-gradient-brand rounded-xl border border-brand-primary/10">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Category Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(categoryTotals)
                .sort(([, a], [, b]) => b - a)
                .map(([category, total]) => {
                  const percentage = (total / totalExpenses) * 100
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{category}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
                          <CurrencyDisplay value={total} size="default" />
                        </div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-expense-primary to-expense-primary/70 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
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