'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/aceternity-utils'

type Tab = {
  id: string
  label: React.ReactNode
  icon?: React.ReactNode
  content?: React.ReactNode
}

interface AnimatedTabsProps {
  tabs: Tab[]
  activeTab?: string
  onTabChange?: (tabId: string) => void
  containerClassName?: string
  tabClassName?: string
  activeTabClassName?: string
  contentClassName?: string
}

export const AnimatedTabs = ({
  tabs,
  activeTab: controlledActiveTab,
  onTabChange,
  containerClassName,
  tabClassName,
  activeTabClassName,
  contentClassName,
}: AnimatedTabsProps) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id)
  
  const activeTab = controlledActiveTab ?? internalActiveTab
  const activeTabData = tabs.find(tab => tab.id === activeTab)

  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId)
    } else {
      setInternalActiveTab(tabId)
    }
  }

  return (
    <div className={cn('w-full', containerClassName)}>
      <div className="relative flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-900 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            className={cn(
              'relative z-10 flex-1 px-3 py-2 text-sm font-medium transition-colors rounded-lg',
              activeTab === tab.id
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200',
              tabClassName,
              activeTab === tab.id && activeTabClassName
            )}
          >
            {hoveredTab === tab.id && (
              <motion.div
                layoutId="hover"
                className="absolute inset-0 bg-gray-200/50 dark:bg-gray-800/50 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />
            )}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {activeTabData?.content && (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={cn('mt-4', contentClassName)}
        >
          {activeTabData.content}
        </motion.div>
      )}
    </div>
  )
}

// Variant with moving highlight
export const FancyAnimatedTabs = ({
  tabs,
  activeTab: controlledActiveTab,
  onTabChange,
  containerClassName,
  tabClassName,
  activeTabClassName,
  contentClassName,
}: AnimatedTabsProps) => {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id)
  const activeTab = controlledActiveTab ?? internalActiveTab
  const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab)
  const activeTabData = tabs[activeTabIndex]

  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId)
    } else {
      setInternalActiveTab(tabId)
    }
  }

  return (
    <div className={cn('w-full', containerClassName)}>
      <div className="relative">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'relative px-4 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
                tabClassName,
                activeTab === tab.id && activeTabClassName
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
            </button>
          ))}
        </div>
        
        {/* Moving underline */}
        <motion.div
          className="absolute bottom-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
          initial={false}
          animate={{
            x: `${activeTabIndex * 100}%`,
            width: `${100 / tabs.length}%`,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      </div>

      {activeTabData?.content && (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTabIndex > 0 ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTabIndex > 0 ? -20 : 20 }}
          transition={{ duration: 0.3 }}
          className={cn('mt-6', contentClassName)}
        >
          {activeTabData.content}
        </motion.div>
      )}
    </div>
  )
}

// Compact variant for scenario switching - with dropdown for many scenarios
export const ScenarioTabs = ({
  scenarios,
  activeScenarioId,
  onScenarioChange,
  className,
  maxVisible = 3, // Show this many as tabs, rest in dropdown
}: {
  scenarios: { id: string; name: string; isActive?: boolean }[]
  activeScenarioId: string
  onScenarioChange: (id: string) => void
  className?: string
  maxVisible?: number
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const activeScenario = scenarios.find(s => s.id === activeScenarioId)
  
  // Use dropdown mode when there are too many scenarios
  const useDropdown = scenarios.length > maxVisible
  
  if (useDropdown) {
    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        <span className="text-sm text-gray-600 dark:text-gray-400">Scenario:</span>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <span>{activeScenario?.name || 'Select scenario'}</span>
            <motion.svg
              animate={{ rotate: isDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
          
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 top-full mt-2 w-64 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden"
              >
                <div className="max-h-64 overflow-y-auto">
                  {scenarios.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => {
                        onScenarioChange(scenario.id)
                        setIsDropdownOpen(false)
                      }}
                      className={cn(
                        'w-full px-4 py-2.5 text-sm text-left transition-colors flex items-center justify-between group',
                        activeScenarioId === scenario.id
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                    >
                      <span className="font-medium">{scenario.name}</span>
                      {activeScenarioId === scenario.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    )
  }
  
  // Original tab-based UI for few scenarios
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span className="text-sm text-gray-600 dark:text-gray-400">Scenario:</span>
      <div className="relative flex rounded-lg bg-gray-100 dark:bg-gray-900 p-0.5">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onScenarioChange(scenario.id)}
            className={cn(
              'relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              activeScenarioId === scenario.id
                ? 'text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}
          >
            {activeScenarioId === scenario.id && (
              <motion.div
                layoutId="activeScenario"
                className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-md"
                transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
              />
            )}
            <span className="relative z-10">{scenario.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}