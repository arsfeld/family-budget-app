'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  X,
  Copy,
  Archive,
  ArchiveRestore,
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
  Settings,
} from 'lucide-react'

interface MonthlyOverview {
  id: string
  name: string
  isActive: boolean
  isArchived: boolean
  archivedAt: Date | null
  createdAt: Date
}

interface ScenarioDialogProps {
  isOpen: boolean
  onClose: () => void
  overviews: MonthlyOverview[]
  activeOverviewId?: string
  onSwitch: (overviewId: string) => Promise<void>
  onCreate: (name: string, cloneFromId?: string) => Promise<void>
  onDelete: (overviewId: string) => Promise<void>
  onArchive: (overviewId: string) => Promise<void>
  onUnarchive: (overviewId: string) => Promise<void>
}

export function ScenarioDialog({
  isOpen,
  onClose,
  overviews,
  activeOverviewId,
  onSwitch,
  onCreate,
  onDelete,
  onArchive,
  onUnarchive,
}: ScenarioDialogProps) {
  const router = useRouter()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newScenarioName, setNewScenarioName] = useState('')
  const [cloneFromId, setCloneFromId] = useState<string>('')
  const [creating, setCreating] = useState(false)
  const [switching, setSwitching] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  const activeScenarios = overviews.filter((o) => !o.isArchived)
  const archivedScenarios = overviews.filter((o) => o.isArchived)

  useEffect(() => {
    if (isOpen && activeOverviewId) {
      setCloneFromId(activeOverviewId)
    }
  }, [isOpen, activeOverviewId])

  const handleCreate = async () => {
    if (!newScenarioName.trim()) return

    setCreating(true)
    try {
      await onCreate(newScenarioName, cloneFromId || undefined)
      setNewScenarioName('')
      setCloneFromId('')
      setShowCreateForm(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to create scenario:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleSwitch = async (overviewId: string) => {
    setSwitching(overviewId)
    try {
      await onSwitch(overviewId)
      router.refresh()
      onClose()
    } catch (error) {
      console.error('Failed to switch scenario:', error)
    } finally {
      setSwitching(null)
    }
  }

  const handleArchive = async (overviewId: string) => {
    const overview = overviews.find((o) => o.id === overviewId)
    if (
      !confirm(
        `Archive "${overview?.name}"? You can restore it anytime from the archived section.`
      )
    ) {
      return
    }

    try {
      await onArchive(overviewId)
      router.refresh()
    } catch (error) {
      console.error('Failed to archive scenario:', error)
    }
  }

  const handleUnarchive = async (overviewId: string) => {
    try {
      await onUnarchive(overviewId)
      router.refresh()
    } catch (error) {
      console.error('Failed to unarchive scenario:', error)
    }
  }

  const handleDelete = async (overviewId: string) => {
    const overview = overviews.find((o) => o.id === overviewId)
    if (
      !confirm(
        `Permanently delete "${overview?.name}"? This action cannot be undone and will remove all income and expense data.`
      )
    ) {
      return
    }

    try {
      await onDelete(overviewId)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete scenario:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            Budget Scenarios
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Create new scenario section */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          {showCreateForm ? (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Scenario Name
                </label>
                <input
                  type="text"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  placeholder="e.g., 2025 Planning, Conservative Budget"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Clone from existing scenario (optional)
                </label>
                <select
                  value={cloneFromId}
                  onChange={(e) => setCloneFromId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition-all hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Start fresh (no data)</option>
                  {activeScenarios.map((overview) => (
                    <option key={overview.id} value={overview.id}>
                      Clone from: {overview.name}
                      {overview.id === activeOverviewId && ' (current)'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCreate}
                  disabled={creating || !newScenarioName.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Scenario'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewScenarioName('')
                    setCloneFromId('')
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create New Scenario
            </button>
          )}
        </div>

        {/* Active scenarios */}
        <div className="mb-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Active Scenarios
          </h3>
          <div className="space-y-2">
            {activeScenarios.map((overview) => (
              <div
                key={overview.id}
                className={`group relative rounded-lg border transition-all ${
                  overview.id === activeOverviewId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSwitch(overview.id)}
                      disabled={
                        switching !== null || overview.id === activeOverviewId
                      }
                      className="flex-1 text-left"
                    >
                      <div className="font-medium text-gray-900">
                        {overview.name}
                        {overview.id === activeOverviewId && (
                          <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500">
                        Created{' '}
                        {new Date(overview.createdAt).toLocaleDateString()}
                      </div>
                    </button>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setCloneFromId(overview.id)
                        setShowCreateForm(true)
                      }}
                      className="rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                      title="Clone scenario"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleArchive(overview.id)}
                      disabled={overview.id === activeOverviewId}
                      className="rounded p-1.5 text-gray-500 transition-colors hover:bg-amber-50 hover:text-amber-600 disabled:opacity-50"
                      title="Archive scenario"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                    {activeScenarios.length > 1 && (
                      <button
                        onClick={() => handleDelete(overview.id)}
                        disabled={overview.id === activeOverviewId}
                        className="rounded p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        title="Delete scenario"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {switching === overview.id && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80">
                    <span className="text-sm text-gray-600">Switching...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Archived scenarios */}
        {archivedScenarios.length > 0 && (
          <div>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="mb-3 flex w-full items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-700"
            >
              {showArchived ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Archived Scenarios ({archivedScenarios.length})
            </button>

            {showArchived && (
              <div className="space-y-2">
                {archivedScenarios.map((overview) => (
                  <div
                    key={overview.id}
                    className="group relative rounded-lg border border-gray-200 bg-gray-50 opacity-75"
                  >
                    <div className="flex items-center justify-between p-3">
                      <div>
                        <div className="font-medium text-gray-700">
                          {overview.name}
                        </div>
                        <div className="mt-0.5 text-xs text-gray-500">
                          Archived{' '}
                          {overview.archivedAt &&
                            new Date(overview.archivedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUnarchive(overview.id)}
                          className="rounded p-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          title="Restore scenario"
                        >
                          <ArchiveRestore className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(overview.id)}
                          className="rounded p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Delete permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}