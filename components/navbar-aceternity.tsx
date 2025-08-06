'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { ScenarioDialog } from './scenario-dialog'
import {
  Settings,
  LayoutDashboard,
  LogOut,
  Plus,
  Edit3,
} from 'lucide-react'
import {
  FloatingNavbar,
  ScenarioTabs,
  StatefulButton,
  AnimatedTooltip,
} from '@/components/ui/aceternity'
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

interface NavbarAceternityProps {
  user: {
    name: string | null
    email: string | null
  }
  overviews?: MonthlyOverview[]
}

export function NavbarAceternity({
  user,
  overviews = [],
}: NavbarAceternityProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [showScenarioDialog, setShowScenarioDialog] = useState(false)
  const [showQuickCreate, setShowQuickCreate] = useState(false)
  const [quickCreateName, setQuickCreateName] = useState('')
  const [quickCreateCloneFrom, setQuickCreateCloneFrom] = useState<string>('')
  const [isCreating, setIsCreating] = useState(false)

  // Filter out archived scenarios for the dropdown
  const activeScenarios = overviews.filter((o) => !o.isArchived)
  const activeOverview = overviews.find((o) => o.isActive)
  const isDashboard = pathname === '/dashboard'

  const [showUserMenu, setShowUserMenu] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const quickCreateRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const quickCreateTimeoutRef = useRef<NodeJS.Timeout>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setShowUserMenu(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowUserMenu(false)
    }, 150) // Small delay to allow moving to menu
  }

  const handleQuickCreateEnter = () => {
    if (quickCreateTimeoutRef.current) {
      clearTimeout(quickCreateTimeoutRef.current)
    }
    setShowQuickCreate(true)
  }

  const handleQuickCreateLeave = () => {
    quickCreateTimeoutRef.current = setTimeout(() => {
      setShowQuickCreate(false)
      setQuickCreateName('')
      setQuickCreateCloneFrom('')
    }, 150)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (quickCreateTimeoutRef.current) {
        clearTimeout(quickCreateTimeoutRef.current)
      }
    }
  }, [])

  // Only show Dashboard link if not already on dashboard
  const navItems = pathname !== '/dashboard' ? [
    {
      name: 'Dashboard',
      link: '/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
  ] : []

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

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickCreateName.trim()) return
    
    setIsCreating(true)
    try {
      await cloneMonthlyOverview(
        quickCreateName,
        quickCreateCloneFrom || undefined
      )
      setQuickCreateName('')
      setQuickCreateCloneFrom('')
      setShowQuickCreate(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to create overview:', error)
      alert(
        error instanceof Error ? error.message : 'Failed to create overview'
      )
    } finally {
      setIsCreating(false)
    }
  }

  const handleSwitch = async (overviewId: string) => {
    try {
      await switchMonthlyOverview(overviewId)
      router.refresh()
    } catch (error) {
      console.error('Failed to switch overview:', error)
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
    <>
      <FloatingNavbar navItems={navItems} className="top-2">
        {/* Scenario Management */}
        {isDashboard && (
          <div className="flex items-center gap-3">
            {activeScenarios.length > 0 && (
              <ScenarioTabs
                scenarios={activeScenarios.map((o) => ({
                  id: o.id,
                  name: o.name,
                  isActive: o.isActive,
                }))}
                activeScenarioId={activeOverview?.id || ''}
                onScenarioChange={handleSwitch}
                maxVisible={4} // Switch to dropdown after 4 scenarios
              />
            )}

            {/* Scenario Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Quick Create Button with Hover Form */}
              <div 
                className="relative"
                ref={quickCreateRef}
                onMouseEnter={handleQuickCreateEnter}
                onMouseLeave={handleQuickCreateLeave}
              >
                <AnimatedTooltip content="Create new scenario">
                  <button
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 text-white transition-all duration-200 hover:bg-emerald-600 hover:shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </AnimatedTooltip>

              {/* Quick Create Dropdown Form */}
              <div className={`absolute top-full mt-2 w-80 right-0 z-50 transition-all duration-200 ${showQuickCreate ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                <div className="rounded-xl bg-white/95 dark:bg-gray-900/95 shadow-[0_10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl overflow-hidden">
                  <form onSubmit={handleQuickCreate} className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Create New Scenario
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Scenario Name
                        </label>
                        <input
                          type="text"
                          value={quickCreateName}
                          onChange={(e) => setQuickCreateName(e.target.value)}
                          placeholder="e.g., 2024 Budget, Vacation Planning"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Copy from (optional)
                        </label>
                        <select
                          value={quickCreateCloneFrom}
                          onChange={(e) => setQuickCreateCloneFrom(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        >
                          <option value="">Start fresh</option>
                          {activeScenarios.map((scenario) => (
                            <option key={scenario.id} value={scenario.id}>
                              Copy from: {scenario.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="pt-2">
                        <StatefulButton
                          type="submit"
                          disabled={!quickCreateName.trim()}
                          loading={isCreating}
                          loadingText="Creating..."
                          className="w-full bg-gradient-to-r from-emerald-500 to-green-500"
                          size="sm"
                        >
                          Create
                        </StatefulButton>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => setShowScenarioDialog(true)}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <Settings className="h-3 w-3 inline mr-1" />
                        Manage all scenarios
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              </div>

              {/* Manage Scenarios Button */}
              <AnimatedTooltip content="Manage scenarios">
                <button
                  onClick={() => setShowScenarioDialog(true)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </AnimatedTooltip>
            </div>
          </div>
        )}

        {/* User Hover Menu */}
        <div 
          className="relative" 
          ref={dropdownRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center gap-2 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:border-gray-300/50 dark:hover:border-gray-600/50 cursor-pointer">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-white text-xs font-semibold">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="max-w-[120px] truncate">{user.name}</span>
          </div>

          {/* Hover Menu */}
          <div className={`absolute top-full mt-2 w-56 -translate-x-1/2 left-1/2 z-50 transition-all duration-200 ${showUserMenu ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
            <div className="rounded-xl bg-white/95 dark:bg-gray-900/95 shadow-[0_10px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl overflow-hidden">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 transition-all duration-150 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-transparent dark:hover:from-indigo-950/30 hover:pl-5"
                >
                  <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Settings
                </Link>
                
                <button
                  onClick={() => {
                    signOut({ callbackUrl: '/login', redirect: true })
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 transition-all duration-150 hover:bg-gradient-to-r hover:from-rose-50/50 hover:to-transparent dark:hover:from-rose-950/30 hover:pl-5 hover:text-rose-600 dark:hover:text-rose-400"
                >
                  <LogOut className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </FloatingNavbar>

      {/* Add padding to account for floating navbar */}
      <div className="h-20" />

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
    </>
  )
}