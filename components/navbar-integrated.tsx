'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from './logout-button'
import { ScenarioDialog } from './scenario-dialog'
import {
  Settings as SettingsIcon,
  ChevronDown,
  LayoutDashboard,
  User,
} from 'lucide-react'
import {
  switchMonthlyOverview,
  deleteMonthlyOverview,
  archiveMonthlyOverview,
  unarchiveMonthlyOverview,
  cloneMonthlyOverview,
} from '@/app/(dashboard)/dashboard/actions'

interface MonthlyOverview {
  id: string
  name: string
  isActive: boolean
  isArchived: boolean
  archivedAt: Date | null
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
  const [showScenarioDialog, setShowScenarioDialog] = useState(false)
  const [switching, setSwitching] = useState<string | null>(null)

  // Filter out archived scenarios for the dropdown
  const activeScenarios = overviews.filter((o) => !o.isArchived)
  const activeOverview = overviews.find((o) => o.isActive)
  const isDashboard = pathname === '/dashboard'

  const handleCreate = async (name: string, cloneFromId?: string) => {
    try {
      await cloneMonthlyOverview(name, cloneFromId)
      router.refresh()
    } catch (error) {
      console.error('Failed to create overview:', error)
      alert(
        error instanceof Error ? error.message : 'Failed to create overview'
      )
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
    try {
      await deleteMonthlyOverview(overviewId)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete overview:', error)
      alert(
        error instanceof Error ? error.message : 'Failed to delete overview'
      )
    }
  }

  const handleArchive = async (overviewId: string) => {
    try {
      await archiveMonthlyOverview(overviewId)
      router.refresh()
    } catch (error) {
      console.error('Failed to archive overview:', error)
      alert(
        error instanceof Error ? error.message : 'Failed to archive overview'
      )
    }
  }

  const handleUnarchive = async (overviewId: string) => {
    try {
      await unarchiveMonthlyOverview(overviewId)
      router.refresh()
    } catch (error) {
      console.error('Failed to unarchive overview:', error)
      alert(
        error instanceof Error ? error.message : 'Failed to unarchive overview'
      )
    }
  }

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-6">
            {isDashboard && activeScenarios.length > 0 ? (
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
                    {activeScenarios.map((overview) => (
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

                {/* Manage Scenarios Button */}
                <button
                  onClick={() => setShowScenarioDialog(true)}
                  className="text-brand-primary hover:bg-brand-primary/5 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all duration-200"
                >
                  <SettingsIcon className="h-3.5 w-3.5" />
                  <span className="font-medium">Manage</span>
                </button>
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
                <SettingsIcon className="h-4 w-4" />
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
                <SettingsIcon className="h-4 w-4" />
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

      {/* Scenario Management Dialog */}
      <ScenarioDialog
        isOpen={showScenarioDialog}
        onClose={() => setShowScenarioDialog(false)}
        overviews={overviews}
        activeOverviewId={activeOverview?.id}
        onSwitch={handleSwitch}
        onCreate={handleCreate}
        onDelete={handleDelete}
        onArchive={handleArchive}
        onUnarchive={handleUnarchive}
      />
    </nav>
  )
}
