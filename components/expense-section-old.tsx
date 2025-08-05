"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils"

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
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Monthly Expenses</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Total: <span className="font-semibold text-red-600">{formatCurrency(totalExpenses)}</span>
          </span>
          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Expense
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-3 font-medium text-gray-900">Add New Expense</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Person</label>
                <select
                  value={newExpense.userId}
                  onChange={(e) => setNewExpense({ ...newExpense, userId: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={newExpense.categoryId}
                  onChange={(e) => setNewExpense({ ...newExpense, categoryId: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700">Expense Name</label>
              <input
                type="text"
                value={newExpense.name}
                onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Mortgage, Daycare, Netflix"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Shared?</label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={newExpense.isShared}
                    onChange={(e) => setNewExpense({ ...newExpense, isShared: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  {newExpense.isShared && (
                    <input
                      type="number"
                      value={newExpense.sharePercentage}
                      onChange={(e) => setNewExpense({ ...newExpense, sharePercentage: e.target.value })}
                      className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
                      placeholder="100"
                      min="0"
                      max="100"
                    />
                  )}
                  {newExpense.isShared && <span className="text-sm text-gray-600">%</span>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
              <input
                type="text"
                value={newExpense.notes}
                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Monthly subscription"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                disabled={saving}
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={addNewExpense}
                disabled={saving || !newExpense.amount || !newExpense.name}
                className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(expensesByUser).map(([userId, expenses]) => {
          const user = users.find(u => u.id === userId)
          const userTotal = userTotals[userId] || 0

          return (
            <div key={userId} className="border-b pb-3 last:border-0">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="font-semibold text-red-600">{formatCurrency(userTotal)}</p>
              </div>
              <div className="space-y-1 pl-4">
                {expenses.map((expense) => {
                  const isEditing = editingId === expense.id

                  if (isEditing) {
                    return (
                      <div key={expense.id} className="rounded-md border border-blue-200 bg-blue-50 p-3">
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Expense Name</label>
                            <input
                              type="text"
                              value={editingData.name}
                              onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                              className="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                              placeholder="e.g., Mortgage, Daycare"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Category</label>
                              <select
                                value={editingData.categoryId}
                                onChange={(e) => setEditingData({ ...editingData, categoryId: e.target.value })}
                                className="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                              >
                                {categories.map((category) => (
                                  <option key={category.id} value={category.id}>
                                    {category.icon} {category.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Amount</label>
                              <input
                                type="number"
                                value={editingData.amount}
                                onChange={(e) => setEditingData({ ...editingData, amount: e.target.value })}
                                className="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={editingData.isShared}
                                onChange={(e) => setEditingData({ ...editingData, isShared: e.target.checked })}
                                className="rounded border-gray-300"
                              />
                              Shared
                            </label>
                            {editingData.isShared && (
                              <>
                                <input
                                  type="number"
                                  value={editingData.sharePercentage}
                                  onChange={(e) => setEditingData({ ...editingData, sharePercentage: e.target.value })}
                                  className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm"
                                  min="0"
                                  max="100"
                                />
                                <span className="text-xs text-gray-600">%</span>
                              </>
                            )}
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={cancelEditing}
                              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveChanges(expense.id)}
                              disabled={saving}
                              className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={expense.id} className="group flex items-center justify-between text-sm hover:bg-gray-50 rounded px-2 py-1">
                      <div className="flex items-center gap-2">
                        <span>{expense.category.icon}</span>
                        <span className="text-gray-600">{expense.name || expense.category.name}</span>
                        <span className="text-xs text-gray-400">({expense.category.name})</span>
                        {expense.isShared && (
                          <span className="text-xs text-blue-600">
                            {expense.sharePercentage}% shared
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700">{formatCurrency(expense.amount)}</span>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => startEditing(expense)}
                            className="text-gray-500 hover:text-gray-700"
                            title="Edit expense"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="text-gray-500 hover:text-red-600"
                            title="Delete expense"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {userExpenses.length === 0 && !showAddForm && (
        <p className="text-center text-sm text-gray-500">No expenses yet. Click "Add Expense" to get started.</p>
      )}

      {/* Category Summary */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="mt-6 border-t pt-4">
          <p className="mb-2 text-sm font-medium text-gray-600">By Category</p>
          <div className="space-y-1">
            {Object.entries(categoryTotals).map(([category, total]) => (
              <div key={category} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{category}</span>
                <span className="font-medium">{formatCurrency(total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}