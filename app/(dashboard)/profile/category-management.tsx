'use client'

import { Category } from '@prisma/client'
import { useState } from 'react'
import {
  createCategory,
  updateCategory,
  deleteCategory,
  resetCategoriesToDefaults,
  getResetCategoriesPreview,
} from './actions'
import { ColorPicker } from '@/components/color-picker'
import { StatefulButton, AnimatedTooltip, CardSpotlight } from '@/components/ui/aceternity'

interface CategoryManagementProps {
  categories: Category[]
}

const EMOJI_OPTIONS = [
  '🏠',
  '💡',
  '🛡️',
  '🚗',
  '👶',
  '🏥',
  '🛒',
  '📱',
  '💳',
  '💰',
  '🎬',
  '📦',
  '✈️',
  '🎓',
  '🐾',
  '🏋️',
  '🎮',
  '📚',
  '🍕',
  '☕',
]

export function CategoryManagement({ categories }: CategoryManagementProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [editingData, setEditingData] = useState({
    name: '',
    icon: '',
    color: '',
  })
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '📦',
    color: '#f59e0b',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResetPreview, setShowResetPreview] = useState(false)
  const [resetPreview, setResetPreview] = useState<{
    preview?: Array<{
      current: { icon?: string | null; name: string; expenseCount: number }
      willMapTo: { icon?: string | null; name: string } | null
    }>
    willAddCategories?: Array<{
      icon?: string | null
      name: string
      color?: string
    }>
    error?: string
    success?: boolean
  } | null>(null)

  const handleEdit = (category: Category) => {
    setIsEditing(category.id)
    setEditingData({
      name: category.name,
      icon: category.icon || '📦',
      color: category.color || '#f59e0b',
    })
  }

  const handleSave = async (categoryId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await updateCategory({
        id: categoryId,
        ...editingData,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setIsEditing(null)
      }
    } catch {
      setError('Failed to update category')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await createCategory(newCategory)

      if (result.error) {
        setError(result.error)
      } else {
        setIsAdding(false)
        setNewCategory({ name: '', icon: '📦', color: '#f59e0b' })
      }
    } catch {
      setError('Failed to create category')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await deleteCategory(categoryId)

      if (result.error) {
        setError(result.error)
      }
    } catch {
      setError('Failed to delete category')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const preview = await getResetCategoriesPreview()

      if (preview.error) {
        setError(preview.error)
        setIsLoading(false)
        return
      }

      setResetPreview(preview)
      setShowResetPreview(true)
    } catch {
      setError('Failed to get reset preview')
    } finally {
      setIsLoading(false)
    }
  }

  const confirmReset = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await resetCategoriesToDefaults()

      if (result.error) {
        setError(result.error)
      } else {
        setShowResetPreview(false)
        setResetPreview(null)
      }
    } catch {
      setError('Failed to reset categories')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Manage expense categories for your family budget
        </p>
        <AnimatedTooltip content="Reset all categories to system defaults">
          <button
            onClick={handleReset}
            className="group flex items-center gap-2 text-sm text-red-600 transition-colors hover:text-red-700"
          >
            <svg className="h-4 w-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset to Defaults
          </button>
        </AnimatedTooltip>
      </div>

      {error && (
        <div className="animate-in slide-in-from-top-2 mb-4 rounded-lg bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 space-y-2">
        {categories.map((category) => {
          const isEditingThis = isEditing === category.id

          if (isEditingThis) {
            return (
              <CardSpotlight
                key={category.id}
                className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50"
              >
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <select
                    value={editingData.icon}
                    onChange={(e) =>
                      setEditingData({ ...editingData, icon: e.target.value })
                    }
                    className="w-20 rounded-lg border border-gray-300 bg-white py-2 text-center text-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {EMOJI_OPTIONS.map((emoji) => (
                      <option key={emoji} value={emoji}>
                        {emoji}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={editingData.name}
                    onChange={(e) =>
                      setEditingData({ ...editingData, name: e.target.value })
                    }
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Category name"
                  />

                  <div className="flex items-center gap-2">
                    <ColorPicker
                      value={editingData.color}
                      onChange={(color) =>
                        setEditingData({ ...editingData, color })
                      }
                    />

                    <StatefulButton
                      onClick={() => handleSave(category.id)}
                      disabled={!editingData.name}
                      loading={isLoading}
                      className="bg-gradient-to-r from-blue-600 to-blue-700"
                      size="sm"
                    >
                      Save
                    </StatefulButton>
                    
                    <button
                      onClick={() => setIsEditing(null)}
                      className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </CardSpotlight>
            )
          }

          return (
            <CardSpotlight
              key={category.id}
              className="group transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl transition-transform group-hover:scale-110">
                    {category.icon}
                  </span>
                  <span className="font-medium text-gray-900">
                    {category.name}
                  </span>
                  <div
                    className="h-5 w-5 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-110"
                    style={{ backgroundColor: category.color || '#f59e0b' }}
                  />
                </div>
                
                <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleEdit(category)}
                    className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </CardSpotlight>
          )
        })}
      </div>

      {isAdding ? (
        <CardSpotlight className="border-2 border-dashed border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <select
              value={newCategory.icon}
              onChange={(e) =>
                setNewCategory({ ...newCategory, icon: e.target.value })
              }
              className="w-20 rounded-lg border border-gray-300 bg-white py-2 text-center text-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {EMOJI_OPTIONS.map((emoji) => (
                <option key={emoji} value={emoji}>
                  {emoji}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Category name"
              autoFocus
            />

            <div className="flex items-center gap-2">
              <ColorPicker
                value={newCategory.color}
                onChange={(color) => setNewCategory({ ...newCategory, color })}
              />

              <StatefulButton
                onClick={handleAdd}
                disabled={!newCategory.name}
                loading={isLoading}
                className="bg-gradient-to-r from-green-600 to-green-700"
                size="sm"
              >
                Add
              </StatefulButton>
              
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewCategory({ name: '', icon: '📦', color: '#f59e0b' })
                }}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </CardSpotlight>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="group w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-gray-600 transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </span>
        </button>
      )}

      {/* Reset Preview Modal */}
      {showResetPreview && resetPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <CardSpotlight className="max-h-[80vh] w-full max-w-2xl overflow-hidden">
            <div className="overflow-y-auto p-6">
              <h3 className="mb-4 text-xl font-semibold">
                Reset Categories to Defaults
              </h3>

              <p className="mb-4 text-sm text-gray-600">
                Your expenses will be automatically migrated to the most
                appropriate default categories:
              </p>

              {/* Migration mapping */}
              {resetPreview.preview && resetPreview.preview.length > 0 && (
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-medium text-gray-700">
                    Category Migration:
                  </h4>
                  <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg bg-gray-50 p-3">
                    {resetPreview.preview.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.current.icon}</span>
                          <span className="font-medium">{item.current.name}</span>
                          {item.current.expenseCount > 0 && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                              {item.current.expenseCount} expense
                              {item.current.expenseCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        {item.willMapTo ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">→</span>
                            <span className="text-lg">{item.willMapTo.icon}</span>
                            <span className="font-medium text-blue-700">
                              {item.willMapTo.name}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">→</span>
                            <span className="italic text-gray-500">Unknown</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New categories that will be added */}
              {resetPreview.willAddCategories &&
                resetPreview.willAddCategories.length > 0 && (
                  <div className="mb-6">
                    <h4 className="mb-3 text-sm font-medium text-gray-700">
                      New Categories to be Added:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {resetPreview.willAddCategories.map((cat, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 text-sm font-medium"
                        >
                          <span>{cat.icon}</span>
                          <span className="text-green-700">{cat.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                <button
                  onClick={() => {
                    setShowResetPreview(false)
                    setResetPreview(null)
                  }}
                  disabled={isLoading}
                  className="rounded-lg bg-gray-100 px-5 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-200"
                >
                  Cancel
                </button>
                <StatefulButton
                  onClick={confirmReset}
                  loading={isLoading}
                  loadingText="Resetting..."
                  className="bg-gradient-to-r from-red-600 to-red-700"
                >
                  Confirm Reset
                </StatefulButton>
              </div>
            </div>
          </CardSpotlight>
        </div>
      )}
    </div>
  )
}