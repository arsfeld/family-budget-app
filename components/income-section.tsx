'use client'

import { useState } from 'react'
import {
  formatCurrency,
  SALARY_FREQUENCIES,
  calculateMonthlyAmount,
  type SalaryFrequency,
} from '@/lib/utils'
import {
  HeadingSection,
  CurrencyDisplay,
  StatusIndicator,
  EmptyState,
} from '@/components/ui/design-system'
import {
  IncomeCardSpotlight,
  StatefulButton,
  CardSpotlight,
} from '@/components/ui/aceternity'
import { Edit2, UserPlus, Mail, User } from 'lucide-react'
import { inviteFamilyMember } from '@/app/(dashboard)/profile/actions'
import { motion } from 'framer-motion'
import { cn } from '@/lib/aceternity-utils'

interface UserIncome {
  id: string
  userId: string
  salaryAmount: number
  salaryFrequency: string
  monthlySalary: number
  additionalIncome: number
  notes: string | null
  user: {
    id: string
    name: string
    email: string
    isVerified?: boolean
  }
}

interface IncomeSectionProps {
  userIncomes: UserIncome[]
  familyId: string
  onUpdate: (
    incomeId: string,
    data: {
      salaryAmount?: number
      salaryFrequency?: string
      monthlySalary?: number
      additionalIncome?: number
      notes?: string
    }
  ) => Promise<void>
}

export function IncomeSection({ userIncomes, familyId, onUpdate }: IncomeSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<{
    salaryAmount: string
    salaryFrequency: string
    additionalIncome: string
    notes: string
  }>({
    salaryAmount: '',
    salaryFrequency: 'monthly',
    additionalIncome: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [addingMember, setAddingMember] = useState(false)
  const [addMemberError, setAddMemberError] = useState<string | null>(null)
  const [addMemberSuccess, setAddMemberSuccess] = useState(false)

  const startEditing = (income: UserIncome) => {
    setEditingId(income.id)
    setEditingData({
      salaryAmount: income.salaryAmount.toString(),
      salaryFrequency: income.salaryFrequency || 'monthly',
      additionalIncome: income.additionalIncome.toString(),
      notes: income.notes || '',
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingData({
      salaryAmount: '',
      salaryFrequency: 'monthly',
      additionalIncome: '',
      notes: '',
    })
  }

  const saveChanges = async (incomeId: string) => {
    setSaving(true)
    try {
      const salaryAmount = parseFloat(editingData.salaryAmount) || 0
      const monthlySalary = calculateMonthlyAmount(
        salaryAmount,
        editingData.salaryFrequency as SalaryFrequency
      )

      await onUpdate(incomeId, {
        salaryAmount,
        salaryFrequency: editingData.salaryFrequency,
        monthlySalary,
        additionalIncome: parseFloat(editingData.additionalIncome) || 0,
        notes: editingData.notes || undefined,
      })
      cancelEditing()
    } catch (error) {
      console.error('Failed to update income:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingMember(true)
    setAddMemberError(null)

    try {
      const result = await inviteFamilyMember({
        email: newMemberEmail,
        name: newMemberName,
        familyId,
      })

      if (result.error) {
        setAddMemberError(result.error)
      } else {
        setAddMemberSuccess(true)
        setTimeout(() => {
          setNewMemberName('')
          setNewMemberEmail('')
          setIsAddingMember(false)
          setAddMemberSuccess(false)
        }, 1500)
      }
    } catch {
      setAddMemberError('Failed to add family member')
    } finally {
      setAddingMember(false)
    }
  }

  const totalIncome = userIncomes.reduce(
    (sum, income) => sum + income.monthlySalary + income.additionalIncome,
    0
  )

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
            onClick={() => setIsAddingMember(true)}
            className="rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-3 py-1.5 text-sm font-medium text-white transition-all hover:from-emerald-700 hover:to-green-700 hover:shadow-md flex items-center gap-1.5"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add Member
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {isAddingMember && (
          <CardSpotlight className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 to-white p-6">
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-100 to-green-100">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Add Family Member</h3>
              </div>

              {addMemberError && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
                >
                  {addMemberError}
                </motion.div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className={cn(
                        "w-full pl-10 pr-3 py-2 rounded-lg border",
                        "bg-white",
                        "border-gray-200",
                        "focus:border-emerald-500",
                        "focus:ring-2 focus:ring-emerald-500/20",
                        "transition-all duration-200",
                        "placeholder:text-gray-400"
                      )}
                      placeholder="Family member's name"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className={cn(
                        "w-full pl-10 pr-3 py-2 rounded-lg border",
                        "bg-white",
                        "border-gray-200",
                        "focus:border-emerald-500",
                        "focus:ring-2 focus:ring-emerald-500/20",
                        "transition-all duration-200",
                        "placeholder:text-gray-400"
                      )}
                      placeholder="member@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-xs text-emerald-700">
                  The new member will appear here immediately. You can assign income right away.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingMember(false)
                    setNewMemberName('')
                    setNewMemberEmail('')
                    setAddMemberError(null)
                  }}
                  disabled={addingMember}
                  className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <StatefulButton
                  type="submit"
                  disabled={addingMember}
                  loading={addingMember}
                  success={addMemberSuccess}
                  loadingText="Adding..."
                  successText="Added!"
                  variant="success"
                  size="sm"
                >
                  Add Member
                </StatefulButton>
              </div>
            </form>
          </CardSpotlight>
        )}

        {userIncomes.map((income) => {
          const total = income.monthlySalary + income.additionalIncome
          const isEditing = editingId === income.id

          if (isEditing) {
            return (
              <IncomeCardSpotlight
                key={income.id}
                className="border-indigo-500/30 bg-gradient-to-br from-indigo-50/50 to-white border-2 p-6"
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {income.user.name}&apos;s Salary
                    </label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="number"
                        value={editingData.salaryAmount}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            salaryAmount: e.target.value,
                          })
                        }
                        className="shadow-inner-subtle focus:border-brand-primary flex-1 rounded-lg border-2 border-transparent bg-white px-4 py-3 font-mono text-lg font-semibold transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] focus:outline-none"
                        placeholder="0"
                      />
                      <select
                        value={editingData.salaryFrequency}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            salaryFrequency: e.target.value,
                          })
                        }
                        className="shadow-inner-subtle focus:border-brand-primary rounded-lg border-2 border-transparent bg-white px-4 py-3 transition-all duration-200 hover:border-gray-300 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] focus:outline-none"
                      >
                        {SALARY_FREQUENCIES.map((freq) => (
                          <option key={freq.value} value={freq.value}>
                            {freq.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Monthly:{' '}
                      {formatCurrency(
                        calculateMonthlyAmount(
                          parseFloat(editingData.salaryAmount) || 0,
                          editingData.salaryFrequency as SalaryFrequency
                        )
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Additional Income
                    </label>
                    <input
                      type="number"
                      value={editingData.additionalIncome}
                      onChange={(e) =>
                        setEditingData({
                          ...editingData,
                          additionalIncome: e.target.value,
                        })
                      }
                      className="shadow-inner-subtle focus:border-brand-primary mt-1 block w-full rounded-lg border-2 border-transparent bg-white px-4 py-3 font-mono text-lg font-semibold transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] focus:outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Notes (optional)
                    </label>
                    <input
                      type="text"
                      value={editingData.notes}
                      onChange={(e) =>
                        setEditingData({
                          ...editingData,
                          notes: e.target.value,
                        })
                      }
                      className="shadow-inner-subtle focus:border-brand-primary mt-1 block w-full rounded-lg border-2 border-transparent bg-white px-4 py-3 transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] focus:outline-none"
                      placeholder="e.g., includes bonus"
                    />
                  </div>

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
                  {income.user.name}
                  {income.user.isVerified === false && (
                    <StatusIndicator type="neutral" className="ml-2 text-xs">
                      Pending
                    </StatusIndicator>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(income.salaryAmount)}{' '}
                  {SALARY_FREQUENCIES.find(
                    (f) => f.value === income.salaryFrequency
                  )?.label || 'Monthly'}
                  {income.additionalIncome > 0 && (
                    <span className="ml-2 text-green-600">
                      + {formatCurrency(income.additionalIncome)}
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  Monthly total: {formatCurrency(income.monthlySalary)}
                  {income.notes && ` • ${income.notes}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <CurrencyDisplay value={total} color="income" />
                <button
                  onClick={() => startEditing(income)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  title="Edit income"
                >
                  <Edit2 className="h-4 w-4 text-gray-500 transition-colors hover:text-gray-700" />
                </button>
              </div>
            </IncomeCardSpotlight>
          )
        })}
      </div>

      {userIncomes.length === 0 && !isAddingMember && (
        <EmptyState
          title="No income sources yet"
          description="Add family members to start tracking monthly income"
          action={
            <button
              onClick={() => setIsAddingMember(true)}
              className="rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-emerald-700 hover:to-green-700 hover:shadow-md inline-flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Your First Member
            </button>
          }
        />
      )}
    </div>
  )
}
