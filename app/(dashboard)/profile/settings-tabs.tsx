'use client'

import { useState } from 'react'
import { User, Category } from '@prisma/client'
import { ProfileForm } from './profile-form'
import { FamilyMembers } from './family-members'
import { CategoryManagement } from './category-management'

interface SettingsTabsProps {
  user: User & { family: { name: string; users: User[] } }
  categories: Category[]
}

type TabId = 'profile' | 'family' | 'categories'

interface Tab {
  id: TabId
  label: string
  icon: string
  description: string
}

const tabs: Tab[] = [
  {
    id: 'profile',
    label: 'My Profile',
    icon: '👤',
    description: 'Manage your personal information',
  },
  {
    id: 'family',
    label: 'Family Members',
    icon: '👨‍👩‍👧‍👦',
    description: 'Invite and manage family members',
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: '🏷️',
    description: 'Customize expense categories',
  },
]

export function SettingsTabs({ user, categories }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('profile')

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Mobile Tab Navigation */}
      <div className="lg:hidden">
        <div className="flex space-x-1 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar Navigation */}
      <div className="hidden flex-shrink-0 lg:block lg:w-64">
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-start gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                activeTab === tab.id
                  ? 'border-l-4 border-blue-700 bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mt-0.5 text-xl">{tab.icon}</span>
              <div>
                <p className="font-medium">{tab.label}</p>
                <p className="text-sm text-gray-600">{tab.description}</p>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="min-w-0 flex-1">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          {activeTab === 'profile' && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold">My Profile</h2>
              </div>
              <ProfileForm user={user} />
            </>
          )}

          {activeTab === 'family' && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold">Family Members</h2>
              </div>
              <FamilyMembers
                familyId={user.familyId}
                familyName={user.family.name}
                members={user.family.users}
                currentUserId={user.id}
              />
            </>
          )}

          {activeTab === 'categories' && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold">Expense Categories</h2>
              </div>
              <CategoryManagement categories={categories} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
