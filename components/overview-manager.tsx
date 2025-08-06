'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ButtonPrimary,
  EmptyState,
  AnimateIn,
} from '@/components/ui/design-system'
import { Plus, Settings, Trash2, ChevronDown } from 'lucide-react'

interface MonthlyOverview {
  id: string
  name: string
  isActive: boolean
  createdAt: Date
}

interface OverviewManagerProps {
  overviews: MonthlyOverview[]
  onCreateOverview: (name: string) => Promise<void>
  onSwitchOverview: (overviewId: string) => Promise<void>
  onDeleteOverview: (overviewId: string) => Promise<void>
}

export function OverviewManager({
  overviews,
  onCreateOverview,
  onSwitchOverview,
  onDeleteOverview,
}: OverviewManagerProps) {
  const router = useRouter()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newOverviewName, setNewOverviewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [switching, setSwitching] = useState<string | null>(null)

  const activeOverview = overviews.find((o) => o.isActive)

  const handleCreate = async () => {
    if (!newOverviewName.trim()) return

    setCreating(true)
    try {
      await onCreateOverview(newOverviewName)
      setNewOverviewName('')
      setShowCreateForm(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to create overview:', error)
      alert(
        error instanceof Error ? error.message : 'Failed to create overview'
      )
    } finally {
      setCreating(false)
    }
  }

  const handleSwitch = async (overviewId: string) => {
    setSwitching(overviewId)
    try {
      await onSwitchOverview(overviewId)
      router.refresh()
    } catch (error) {
      console.error('Failed to switch overview:', error)
    } finally {
      setSwitching(null)
    }
  }

  const handleDelete = async (overviewId: string) => {
    const overview = overviews.find((o) => o.id === overviewId)
    if (
      !confirm(
        `Are you sure you want to delete "${overview?.name}"? This will remove all income and expense data for this scenario.`
      )
    ) {
      return
    }

    try {
      await onDeleteOverview(overviewId)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete overview:', error)
    }
  }

  // If no overviews exist, show create form immediately
  if (overviews.length === 0) {
    return (
      <AnimateIn>
        <EmptyState
          title="Welcome to Your Family Budget"
          description="Let's create your first budget scenario to get started."
          action={
            <div className="mx-auto w-full max-w-md">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Budget Scenario Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOverviewName}
                  onChange={(e) => setNewOverviewName(e.target.value)}
                  placeholder="e.g., Current Budget, 2024 Plan"
                  className="shadow-inner-subtle focus:border-brand-primary flex-1 rounded-lg border-2 border-transparent bg-white px-4 py-3 transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  autoFocus
                />
                <ButtonPrimary
                  onClick={handleCreate}
                  disabled={creating || !newOverviewName.trim()}
                >
                  {creating ? 'Creating...' : 'Create'}
                </ButtonPrimary>
              </div>
              <p className="mt-3 text-center text-xs text-gray-500">
                You can create multiple scenarios later to compare different
                financial situations.
              </p>
            </div>
          }
        />
      </AnimateIn>
    )
  }

  return (
    <div className="flex items-center justify-between">
      {/* Left side - Budget Scenario Dropdown and New Scenario */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            className="flex min-w-[200px] items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 transition-all duration-200 hover:border-gray-300"
            onClick={(e) => {
              // In a real app, this would open a dropdown menu
              // For now, we'll use the select element
              const select = e.currentTarget
                .nextElementSibling as HTMLSelectElement
              select?.focus()
              select?.click()
            }}
          >
            <span className="font-medium text-gray-900">
              {activeOverview?.name}
            </span>
            <ChevronDown className="ml-auto h-4 w-4 text-gray-500" />
          </button>
          <select
            value={activeOverview?.id || ''}
            onChange={(e) => handleSwitch(e.target.value)}
            disabled={switching !== null}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            {overviews.map((overview) => (
              <option key={overview.id} value={overview.id}>
                {overview.name}
              </option>
            ))}
          </select>
          {switching && (
            <div className="bg-opacity-75 absolute inset-0 flex items-center justify-center rounded-lg bg-white">
              <span className="text-xs text-gray-600">Switching...</span>
            </div>
          )}
        </div>

        {showCreateForm ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newOverviewName}
              onChange={(e) => setNewOverviewName(e.target.value)}
              placeholder="Scenario name..."
              className="focus:border-brand-primary rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
                if (e.key === 'Escape') {
                  setShowCreateForm(false)
                  setNewOverviewName('')
                }
              }}
              autoFocus
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newOverviewName.trim()}
              className="bg-brand-primary hover:bg-brand-primary/90 rounded-lg px-3 py-2 text-sm font-medium text-white transition-all duration-200 disabled:opacity-50"
            >
              {creating ? '...' : 'Create'}
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false)
                setNewOverviewName('')
              }}
              className="px-3 py-2 text-gray-600 transition-colors hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCreateForm(true)}
            className="text-brand-primary hover:bg-brand-primary/5 flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span className="font-medium">New Scenario</span>
          </button>
        )}
      </div>

      {/* Right side - Settings and Delete */}
      <div className="flex items-center gap-2">
        {overviews.length > 1 && activeOverview && (
          <button
            onClick={() => handleDelete(activeOverview.id)}
            className="rounded-lg p-2 text-gray-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
            title="Delete current scenario"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        <button
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-gray-800"
          title="Budget settings"
        >
          <Settings className="h-4 w-4" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </div>
  )
}
