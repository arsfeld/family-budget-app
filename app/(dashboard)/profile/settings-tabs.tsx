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
    description: 'Manage your personal information'
  },
  {
    id: 'family',
    label: 'Family Members',
    icon: '👨‍👩‍👧‍👦',
    description: 'Invite and manage family members'
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: '🏷️',
    description: 'Customize expense categories'
  }
]

export function SettingsTabs({ user, categories }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('profile')

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Mobile Tab Navigation */}
      <div className="lg:hidden">
        <div className="flex space-x-1 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar Navigation */}
      <div className="hidden lg:block lg:w-64 flex-shrink-0">
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="text-xl mt-0.5">{tab.icon}</span>
              <div>
                <p className="font-medium">{tab.label}</p>
                <p className="text-sm text-gray-600">{tab.description}</p>
              </div>
            </button>
          ))}
        </nav>

      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-lg shadow-sm border p-6">
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