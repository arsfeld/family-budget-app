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
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Manage expense categories for your family
        </p>
        <button
          onClick={handleReset}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Reset to Defaults
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="mb-4 space-y-2">
        {categories.map((category) => {
          const isEditingThis = isEditing === category.id

          if (isEditingThis) {
            return (
              <div
                key={category.id}
                className="flex flex-col items-start gap-2 rounded-lg bg-gray-50 p-3 sm:flex-row sm:items-center"
              >
                <select
                  value={editingData.icon}
                  onChange={(e) =>
                    setEditingData({ ...editingData, icon: e.target.value })
                  }
                  className="w-16 rounded-md border-gray-300 text-center"
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
                  className="w-full flex-1 rounded-md border-gray-300 sm:w-auto"
                  placeholder="Category name"
                />

                <div className="flex items-center gap-2">
                  <ColorPicker
                    value={editingData.color}
                    onChange={(color) =>
                      setEditingData({ ...editingData, color })
                    }
                  />

                  <button
                    onClick={() => handleSave(category.id)}
                    disabled={isLoading || !editingData.name}
                    className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(null)}
                    className="rounded-md bg-gray-200 px-3 py-1 text-sm text-gray-800 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )
          }

          return (
            <div
              key={category.id}
              className="group flex items-center justify-between rounded-lg bg-gray-50 p-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: category.color || undefined }}
                />
              </div>
              <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => handleEdit(category)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {isAdding ? (
        <div className="flex flex-col items-start gap-2 rounded-lg bg-blue-50 p-3 sm:flex-row sm:items-center">
          <select
            value={newCategory.icon}
            onChange={(e) =>
              setNewCategory({ ...newCategory, icon: e.target.value })
            }
            className="w-16 rounded-md border-gray-300 text-center"
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
            className="w-full flex-1 rounded-md border-gray-300 sm:w-auto"
            placeholder="Category name"
          />

          <div className="flex items-center gap-2">
            <ColorPicker
              value={newCategory.color}
              onChange={(color) => setNewCategory({ ...newCategory, color })}
            />

            <button
              onClick={handleAdd}
              disabled={isLoading || !newCategory.name}
              className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setNewCategory({ name: '', icon: '📦', color: '#f59e0b' })
              }}
              className="rounded-md bg-gray-200 px-3 py-1 text-sm text-gray-800 hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-gray-600 hover:border-gray-400 hover:text-gray-700"
        >
          + Add Category
        </button>
      )}

      {/* Reset Preview Dialog */}
      {showResetPreview && resetPreview && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Reset Categories to Defaults
            </h3>

            <p className="mb-4 text-sm text-gray-600">
              Your expenses will be automatically migrated to the most
              appropriate default categories:
            </p>

            {/* Migration mapping */}
            {resetPreview.preview && resetPreview.preview.length > 0 && (
              <div className="mb-6">
                <h4 className="mb-2 text-sm font-medium">
                  Category Migration:
                </h4>
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {resetPreview.preview.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded bg-gray-50 p-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span>{item.current.icon}</span>
                        <span>{item.current.name}</span>
                        {item.current.expenseCount > 0 && (
                          <span className="text-xs text-gray-500">
                            ({item.current.expenseCount} expense
                            {item.current.expenseCount !== 1 ? 's' : ''})
                          </span>
                        )}
                      </div>
                      {item.willMapTo ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">→</span>
                          <span>{item.willMapTo.icon}</span>
                          <span className="font-medium">
                            {item.willMapTo.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">→</span>
                          <span className="text-gray-500 italic">Unknown</span>
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
                  <h4 className="mb-2 text-sm font-medium">
                    New Categories to be Added:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {resetPreview.willAddCategories.map((cat, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-sm"
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
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
                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                disabled={isLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
