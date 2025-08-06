'use client'

import { useState } from 'react'
import { User, Category } from '@prisma/client'
import { ProfileForm } from './profile-form'
import { FamilyMembers } from './family-members'
import { CategoryManagement } from './category-management'
import { AnimatedTabs } from '@/components/ui/aceternity'
import { CardSpotlight } from '@/components/ui/aceternity'

interface SettingsTabsProps {
  user: User & { family: { name: string; users: User[] } }
  categories: Category[]
}

type TabId = 'profile' | 'family' | 'categories'

interface Tab {
  id: TabId
  label: React.ReactNode
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

  const tabItems = tabs.map(tab => ({
    id: tab.id,
    label: (
      <div className="flex items-center gap-2">
        <span className="text-lg">{tab.icon}</span>
        <span>{tab.label}</span>
      </div>
    ),
    content: null,
  }))

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Mobile Tab Navigation */}
      <div className="lg:hidden">
        <AnimatedTabs
          tabs={tabItems}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as TabId)}
          containerClassName="mb-6"
        />
      </div>

      {/* Desktop Sidebar Navigation */}
      <div className="hidden flex-shrink-0 lg:block lg:w-72">
        <div className="sticky top-8 space-y-2">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="cursor-pointer"
            >
              <CardSpotlight
                className={`group transition-colors ${
                  activeTab === tab.id
                    ? 'border-l-4 border-blue-600 bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3 p-4">
                  <span className="mt-0.5 text-xl transition-transform group-hover:scale-110">
                    {tab.icon}
                  </span>
                  <div>
                    <p className={`font-medium ${
                      activeTab === tab.id ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {tab.label}
                    </p>
                    <p className="text-sm text-gray-600">{tab.description}</p>
                  </div>
                </div>
              </CardSpotlight>
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="min-w-0 flex-1">
        <CardSpotlight className="overflow-hidden">
          <div className="p-6">
            {activeTab === 'profile' && (
              <>
                <div className="mb-6 border-b pb-4">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    My Profile
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Update your personal information and account settings
                  </p>
                </div>
                <ProfileForm user={user} />
              </>
            )}

            {activeTab === 'family' && (
              <>
                <div className="mb-6 border-b pb-4">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Family Members
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Manage who has access to your family budget
                  </p>
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
                <div className="mb-6 border-b pb-4">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Expense Categories
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Customize categories to organize your expenses
                  </p>
                </div>
                <CategoryManagement categories={categories} />
              </>
            )}
          </div>
        </CardSpotlight>
      </div>
    </div>
  )
}