'use client'

import { useState } from 'react'
import {
  formatCurrency,
  calculateMonthlyAmount,
  type SalaryFrequency,
} from '@/lib/utils'
import {
  IncomeCardSpotlight,
  StatefulButton,
  CardSpotlight,
} from '@/components/ui/aceternity'
import {
  HeadingSection,
  CurrencyDisplay,
  EmptyState,
} from '@/components/ui/components'
import { Edit2, Plus, Trash2, User, Building2, TrendingUp, Home, Briefcase, DollarSign } from 'lucide-react'
import { cn } from '@/lib/aceternity-utils'
import { createIncome, updateIncome, deleteIncome } from '@/app/(dashboard)/dashboard/actions'

interface Income {
  id: string
  name: string
  type: string
  amount: number
  frequency: string
  monthlyAmount: number
  userId: string | null
  notes: string | null
  user: {
    id: string
    name: string
    email: string
    isVerified?: boolean
  } | null
}

interface FlexibleIncomeSectionProps {
  incomes: Income[]
  familyId: string
  users: Array<{
    id: string
    name: string
    email: string
    isVerified?: boolean
  }>
}

const INCOME_TYPES = [
  { value: 'salary', label: 'Salary', icon: Briefcase, color: 'emerald' },
  { value: 'freelance', label: 'Freelance', icon: User, color: 'blue' },
  { value: 'property', label: 'Property', icon: Home, color: 'purple' },
  { value: 'investment', label: 'Investment', icon: TrendingUp, color: 'indigo' },
  { value: 'business', label: 'Business', icon: Building2, color: 'orange' },
  { value: 'other', label: 'Other', icon: DollarSign, color: 'gray' },
]

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'semimonthly', label: 'Semi-monthly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one-time', label: 'One-time' },
]

export function FlexibleIncomeSection({ incomes, users }: FlexibleIncomeSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<{
    name: string
    type: string
    amount: string
    frequency: string
    userId: string | null
    notes: string
  }>({
    name: '',
    type: 'salary',
    amount: '',
    frequency: 'monthly',
    userId: null,
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [isAddingIncome, setIsAddingIncome] = useState(false)
  const [addingIncome, setAddingIncome] = useState(false)

  const startEditing = (income: Income) => {
    setEditingId(income.id)
    setEditingData({
      name: income.name,
      type: income.type,
      amount: income.amount.toString(),
      frequency: income.frequency,
      userId: income.userId,
      notes: income.notes || '',
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingData({
      name: '',
      type: 'salary',
      amount: '',
      frequency: 'monthly',
      userId: null,
      notes: '',
    })
  }

  const saveChanges = async (incomeId: string) => {
    setSaving(true)
    try {
      const amount = parseFloat(editingData.amount) || 0
      const monthlyAmount = editingData.frequency === 'one-time' 
        ? amount 
        : calculateMonthlyAmount(amount, editingData.frequency as SalaryFrequency)

      await updateIncome(incomeId, {
        name: editingData.name,
        type: editingData.type,
        amount,
        frequency: editingData.frequency,
        monthlyAmount,
        userId: editingData.userId,
        notes: editingData.notes || undefined,
      })
      cancelEditing()
    } catch (error) {
      console.error('Failed to update income:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (incomeId: string) => {
    setDeleting(incomeId)
    try {
      await deleteIncome(incomeId)
    } catch (error) {
      console.error('Failed to delete income:', error)
    } finally {
      setDeleting(null)
    }
  }

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingIncome(true)

    try {
      const amount = parseFloat(editingData.amount) || 0
      const monthlyAmount = editingData.frequency === 'one-time' 
        ? amount 
        : calculateMonthlyAmount(amount, editingData.frequency as SalaryFrequency)

      await createIncome({
        name: editingData.name,
        type: editingData.type,
        amount,
        frequency: editingData.frequency,
        monthlyAmount,
        userId: editingData.userId,
        notes: editingData.notes || undefined,
      })

      // Reset form
      setEditingData({
        name: '',
        type: 'salary',
        amount: '',
        frequency: 'monthly',
        userId: null,
        notes: '',
      })
      setIsAddingIncome(false)
    } catch (error) {
      console.error('Failed to add income:', error)
    } finally {
      setAddingIncome(false)
    }
  }

  const totalIncome = incomes.reduce(
    (sum, income) => sum + income.monthlyAmount,
    0
  )

  // Group incomes by type
  const incomesByType = incomes.reduce((acc, income) => {
    if (!acc[income.type]) {
      acc[income.type] = []
    }
    acc[income.type].push(income)
    return acc
  }, {} as Record<string, Income[]>)

  const getIncomeTypeInfo = (type: string) => {
    return INCOME_TYPES.find(t => t.value === type) || INCOME_TYPES[5]
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <HeadingSection>Monthly Income</HeadingSection>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Total:</span>
            <CurrencyDisplay value={totalIncome} color="income" />
          </div>
          <button
            onClick={() => {
              setIsAddingIncome(true)
              setEditingData({
                name: '',
                type: 'salary',
                amount: '',
                frequency: 'monthly',
                userId: null,
                notes: '',
              })
            }}
            className="rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-3 py-1.5 text-sm font-medium text-white transition-all hover:from-emerald-700 hover:to-green-700 hover:shadow-md flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Income
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {isAddingIncome && (
          <CardSpotlight className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 to-white p-6">
            <form onSubmit={handleAddIncome} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-100 to-green-100">
                  <Plus className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Add Income Source</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Income Name
                  </label>
                  <input
                    type="text"
                    value={editingData.name}
                    onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg border",
                      "bg-white",
                      "border-gray-200",
                      "focus:border-emerald-500",
                      "focus:ring-2 focus:ring-emerald-500/20",
                      "transition-all duration-200",
                      "placeholder:text-gray-400"
                    )}
                    placeholder="e.g., John's Salary, Rental Income"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={editingData.type}
                    onChange={(e) => setEditingData({ ...editingData, type: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg border",
                      "bg-white",
                      "border-gray-200",
                      "focus:border-emerald-500",
                      "focus:ring-2 focus:ring-emerald-500/20",
                      "transition-all duration-200"
                    )}
                  >
                    {INCOME_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={editingData.amount}
                    onChange={(e) => setEditingData({ ...editingData, amount: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg border",
                      "bg-white",
                      "border-gray-200",
                      "focus:border-emerald-500",
                      "focus:ring-2 focus:ring-emerald-500/20",
                      "transition-all duration-200",
                      "placeholder:text-gray-400"
                    )}
                    placeholder="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={editingData.frequency}
                    onChange={(e) => setEditingData({ ...editingData, frequency: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg border",
                      "bg-white",
                      "border-gray-200",
                      "focus:border-emerald-500",
                      "focus:ring-2 focus:ring-emerald-500/20",
                      "transition-all duration-200"
                    )}
                  >
                    {FREQUENCIES.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To (Optional)
                  </label>
                  <select
                    value={editingData.userId || ''}
                    onChange={(e) => setEditingData({ ...editingData, userId: e.target.value || null })}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg border",
                      "bg-white",
                      "border-gray-200",
                      "focus:border-emerald-500",
                      "focus:ring-2 focus:ring-emerald-500/20",
                      "transition-all duration-200"
                    )}
                  >
                    <option value="">Not assigned to anyone</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingData.notes}
                    onChange={(e) => setEditingData({ ...editingData, notes: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg border",
                      "bg-white",
                      "border-gray-200",
                      "focus:border-emerald-500",
                      "focus:ring-2 focus:ring-emerald-500/20",
                      "transition-all duration-200",
                      "placeholder:text-gray-400"
                    )}
                    placeholder="Additional details"
                  />
                </div>
              </div>

              {editingData.amount && editingData.frequency !== 'one-time' && (
                <p className="text-sm text-gray-600">
                  Monthly amount: {formatCurrency(
                    calculateMonthlyAmount(
                      parseFloat(editingData.amount) || 0,
                      editingData.frequency as SalaryFrequency
                    )
                  )}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingIncome(false)
                    cancelEditing()
                  }}
                  disabled={addingIncome}
                  className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <StatefulButton
                  type="submit"
                  disabled={addingIncome}
                  loading={addingIncome}
                  loadingText="Adding..."
                  successText="Added!"
                  variant="success"
                  size="sm"
                >
                  Add Income
                </StatefulButton>
              </div>
            </form>
          </CardSpotlight>
        )}

        {Object.entries(incomesByType).map(([type, typeIncomes]) => {
          const typeInfo = getIncomeTypeInfo(type)
          const Icon = typeInfo.icon
          const typeTotal = typeIncomes.reduce((sum, income) => sum + income.monthlyAmount, 0)

          return (
            <div key={type} className="space-y-2">
              <div className="flex items-center gap-2 px-2">
                <Icon className={cn("h-4 w-4", `text-${typeInfo.color}-600`)} />
                <span className="text-sm font-medium text-gray-700">{typeInfo.label}</span>
                <span className="text-sm text-gray-500">({formatCurrency(typeTotal)})</span>
              </div>

              {typeIncomes.map((income) => {
                const isEditing = editingId === income.id

                if (isEditing) {
                  return (
                    <IncomeCardSpotlight
                      key={income.id}
                      className="border-indigo-500/30 bg-gradient-to-br from-indigo-50/50 to-white border-2 p-6"
                    >
                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                              type="text"
                              value={editingData.name}
                              onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                              className="mt-1 w-full rounded-lg border px-3 py-2"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select
                              value={editingData.type}
                              onChange={(e) => setEditingData({ ...editingData, type: e.target.value })}
                              className="mt-1 w-full rounded-lg border px-3 py-2"
                            >
                              {INCOME_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <input
                              type="number"
                              value={editingData.amount}
                              onChange={(e) => setEditingData({ ...editingData, amount: e.target.value })}
                              className="mt-1 w-full rounded-lg border px-3 py-2"
                              step="0.01"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Frequency</label>
                            <select
                              value={editingData.frequency}
                              onChange={(e) => setEditingData({ ...editingData, frequency: e.target.value })}
                              className="mt-1 w-full rounded-lg border px-3 py-2"
                            >
                              {FREQUENCIES.map((freq) => (
                                <option key={freq.value} value={freq.value}>
                                  {freq.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                            <select
                              value={editingData.userId || ''}
                              onChange={(e) => setEditingData({ ...editingData, userId: e.target.value || null })}
                              className="mt-1 w-full rounded-lg border px-3 py-2"
                            >
                              <option value="">Not assigned</option>
                              {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Notes</label>
                            <input
                              type="text"
                              value={editingData.notes}
                              onChange={(e) => setEditingData({ ...editingData, notes: e.target.value })}
                              className="mt-1 w-full rounded-lg border px-3 py-2"
                              placeholder="Optional"
                            />
                          </div>
                        </div>

                        {editingData.amount && editingData.frequency !== 'one-time' && (
                          <p className="text-sm text-gray-600">
                            Monthly: {formatCurrency(
                              calculateMonthlyAmount(
                                parseFloat(editingData.amount) || 0,
                                editingData.frequency as SalaryFrequency
                              )
                            )}
                          </p>
                        )}

                        <div className="flex justify-end gap-2">
                          <button
                            onClick={cancelEditing}
                            disabled={saving}
                            className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <StatefulButton
                            onClick={() => saveChanges(income.id)}
                            disabled={saving}
                            loading={saving}
                            loadingText="Saving..."
                            successText="Saved!"
                            variant="success"
                            size="sm"
                          >
                            Save
                          </StatefulButton>
                        </div>
                      </div>
                    </IncomeCardSpotlight>
                  )
                }

                return (
                  <IncomeCardSpotlight
                    key={income.id}
                    className="group flex items-center justify-between p-6"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {income.name}
                        {income.user && (
                          <span className="ml-2 text-sm text-gray-500">
                            ({income.user.name})
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(income.amount)}{' '}
                        {FREQUENCIES.find(f => f.value === income.frequency)?.label || income.frequency}
                        {income.notes && ` • ${income.notes}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <CurrencyDisplay value={income.monthlyAmount} color="income" />
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => startEditing(income)}
                          className="p-1"
                          title="Edit income"
                        >
                          <Edit2 className="h-4 w-4 text-gray-500 transition-colors hover:text-gray-700" />
                        </button>
                        <button
                          onClick={() => handleDelete(income.id)}
                          disabled={deleting === income.id}
                          className="p-1"
                          title="Delete income"
                        >
                          <Trash2 className="h-4 w-4 text-gray-500 transition-colors hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  </IncomeCardSpotlight>
                )
              })}
            </div>
          )
        })}
      </div>

      {incomes.length === 0 && !isAddingIncome && (
        <EmptyState
          title="No income sources yet"
          description="Add income sources to start tracking your monthly revenue"
          action={
            <button
              onClick={() => setIsAddingIncome(true)}
              className="rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-emerald-700 hover:to-green-700 hover:shadow-md inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Income
            </button>
          }
        />
      )}
    </div>
  )
}