"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { LogoutButton } from "./logout-button"
import { ButtonPrimary } from "@/components/ui/design-system"
import { Plus, Settings, Trash2, ChevronDown, LayoutDashboard, User } from "lucide-react"

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
  onCreateOverview?: (name: string) => Promise<void>
  onSwitchOverview?: (overviewId: string) => Promise<void>
  onDeleteOverview?: (overviewId: string) => Promise<void>
}

export function NavbarIntegrated({ 
  user, 
  overviews = [], 
  onCreateOverview,
  onSwitchOverview,
  onDeleteOverview 
}: NavbarIntegratedProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newOverviewName, setNewOverviewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [switching, setSwitching] = useState<string | null>(null)

  const activeOverview = overviews.find(o => o.isActive)
  const isDashboard = pathname === '/dashboard'

  const handleCreate = async () => {
    if (!newOverviewName.trim() || !onCreateOverview) return
    
    setCreating(true)
    try {
      await onCreateOverview(newOverviewName)
      setNewOverviewName("")
      setShowCreateForm(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to create overview:", error)
      alert(error instanceof Error ? error.message : "Failed to create overview")
    } finally {
      setCreating(false)
    }
  }

  const handleSwitch = async (overviewId: string) => {
    if (!onSwitchOverview) return
    setSwitching(overviewId)
    try {
      await onSwitchOverview(overviewId)
      router.refresh()
    } catch (error) {
      console.error("Failed to switch overview:", error)
    } finally {
      setSwitching(null)
    }
  }

  const handleDelete = async (overviewId: string) => {
    if (!onDeleteOverview) return
    const overview = overviews.find(o => o.id === overviewId)
    if (!confirm(`Are you sure you want to delete "${overview?.name}"? This will remove all income and expense data for this scenario.`)) {
      return
    }

    try {
      await onDeleteOverview(overviewId)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete overview:", error)
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center gap-6">
            {isDashboard && overviews.length > 0 ? (
              <>
                {/* Budget Scenario Dropdown */}
                <div className="relative">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 min-w-[200px]"
                    onClick={(e) => {
                      const select = e.currentTarget.nextElementSibling as HTMLSelectElement
                      select?.focus()
                      select?.click()
                    }}
                  >
                    <span className="font-semibold text-gray-900">{activeOverview?.name || 'Select Scenario'}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500 ml-auto" />
                  </button>
                  <select
                    value={activeOverview?.id || ""}
                    onChange={(e) => handleSwitch(e.target.value)}
                    disabled={switching !== null}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  >
                    {overviews.map((overview) => (
                      <option key={overview.id} value={overview.id}>
                        {overview.name}
                      </option>
                    ))}
                  </select>
                  {switching && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                      <span className="text-xs text-gray-600">Switching...</span>
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
                      className="px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-sm transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreate()
                        if (e.key === 'Escape') {
                          setShowCreateForm(false)
                          setNewOverviewName("")
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleCreate}
                      disabled={creating || !newOverviewName.trim()}
                      className="px-3 py-1.5 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
                    >
                      {creating ? "..." : "Create"}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false)
                        setNewOverviewName("")
                      }}
                      className="px-2 py-1.5 text-gray-600 hover:text-gray-800 text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-all duration-200 text-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="font-medium">New Scenario</span>
                  </button>
                )}

                {/* Delete button for current scenario */}
                {overviews.length > 1 && activeOverview && (
                  <button
                    onClick={() => handleDelete(activeOverview.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete current scenario"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </>
            ) : (
              <h1 className="text-xl font-semibold text-gray-900">Family Budget</h1>
            )}
          </div>
          
          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link 
                href="/dashboard" 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === '/dashboard' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link 
                href="/profile" 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === '/profile' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center gap-1">
              <Link 
                href="/dashboard" 
                className={`p-2 rounded-lg transition-all duration-200 ${
                  pathname === '/dashboard' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
              </Link>
              <Link 
                href="/profile" 
                className={`p-2 rounded-lg transition-all duration-200 ${
                  pathname === '/profile' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>
            
            {/* User info and logout */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="hidden md:flex items-center gap-2 text-sm">
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