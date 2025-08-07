'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function TestDarkPage() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Dark Mode Debug Page</h1>
        
        <div className="p-4 border rounded-lg space-y-2">
          <p>Current theme: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{theme}</code></p>
          <p>Resolved theme: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{resolvedTheme}</code></p>
          <p>System theme: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{systemTheme}</code></p>
          <p>HTML class: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{typeof document !== 'undefined' ? document.documentElement.className : 'N/A'}</code></p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTheme('light')}
            className="px-4 py-2 bg-white dark:bg-gray-800 border rounded"
          >
            Light
          </button>
          <button
            onClick={() => setTheme('dark')}
            className="px-4 py-2 bg-white dark:bg-gray-800 border rounded"
          >
            Dark
          </button>
          <button
            onClick={() => setTheme('system')}
            className="px-4 py-2 bg-white dark:bg-gray-800 border rounded"
          >
            System
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 border rounded">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Light/Dark Test</h2>
            <p className="text-gray-600 dark:text-gray-400">This should change color</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border rounded">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Gradient Test</h2>
            <p className="text-gray-600 dark:text-gray-400">This should have gradient</p>
          </div>
        </div>
      </div>
    </div>
  )
}