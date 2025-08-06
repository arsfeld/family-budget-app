'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from './logout-button'
import {
  Plus,
  Settings,
  Trash2,
  ChevronDown,
  LayoutDashboard,
  User,
} from 'lucide-react'
import {
  createMonthlyOverview,
  switchMonthlyOverview,
  deleteMonthlyOverview,
} from '@/app/(dashboard)/dashboard/actions'

interface MonthlyOverview {
  id: string
  name: string
  isActive: boolean
  createdAt: Date
}

interface NavbarIntegratedProps {
  user: {
    name: string | null
    email: string | null
  }
  overviews?: MonthlyOverview[]
}

export function NavbarIntegrated({
  user,
  overviews = [],
}: NavbarIntegratedProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newOverviewName, setNewOverviewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [switching, setSwitching] = useState<string | null>(null)

  const activeOverview = overviews.find((o) => o.isActive)
  const isDashboard = pathname === '/dashboard'

  const handleCreate = async () => {
    if (!newOverviewName.trim()) return

    setCreating(true)
    try {
      const formData = new FormData()
      formData.append('name', newOverviewName)
      await createMonthlyOverview(formData)
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
      await switchMonthlyOverview(overviewId)
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
      await deleteMonthlyOverview(overviewId)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete overview:', error)
    }
  }

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-6">
            {isDashboard && overviews.length > 0 ? (
              <>
                {/* Budget Scenario Dropdown */}
                <div className="relative">
                  <button
                    className="flex min-w-[200px] items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 transition-all duration-200 hover:bg-gray-100"
                    onClick={(e) => {
                      const select = e.currentTarget
                        .nextElementSibling as HTMLSelectElement
                      select?.focus()
                      select?.click()
                    }}
                  >
                    <span className="font-semibold text-gray-900">
                      {activeOverview?.name || 'Select Scenario'}
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
                      <span className="text-xs text-gray-600">
                        Switching...
                      </span>
                    </div>
                  )}
                </div>

                {/* New Scenario Button */}
                {showCreateForm ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newOverviewName}
                      onChange={(e) => setNewOverviewName(e.target.value)}
                      placeholder="Scenario name..."
                      className="focus:border-brand-primary rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] focus:outline-none"
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
                      className="bg-brand-primary hover:bg-brand-primary/90 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-all duration-200 disabled:opacity-50"
                    >
                      {creating ? '...' : 'Create'}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false)
                        setNewOverviewName('')
                      }}
                      className="px-2 py-1.5 text-sm text-gray-600 transition-colors hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="text-brand-primary hover:bg-brand-primary/5 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all duration-200"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="font-medium">New Scenario</span>
                  </button>
                )}

                {/* Delete button for current scenario */}
                {overviews.length > 1 && activeOverview && (
                  <button
                    onClick={() => handleDelete(activeOverview.id)}
                    className="rounded-lg p-1.5 text-gray-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                    title="Delete current scenario"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </>
            ) : (
              <h1 className="text-xl font-semibold text-gray-900">
                Family Budget
              </h1>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Navigation Links */}
            <div className="hidden items-center gap-1 md:flex">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  pathname === '/dashboard'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/profile"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  pathname === '/profile'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </div>

            {/* Mobile Navigation */}
            <div className="flex items-center gap-1 md:hidden">
              <Link
                href="/dashboard"
                className={`rounded-lg p-2 transition-all duration-200 ${
                  pathname === '/dashboard'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
              </Link>
              <Link
                href="/profile"
                className={`rounded-lg p-2 transition-all duration-200 ${
                  pathname === '/profile'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>

            {/* User info and logout */}
            <div className="flex items-center gap-3 border-l border-gray-200 pl-3">
              <div className="hidden items-center gap-2 text-sm md:flex">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-700">{user.name}</span>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
