'use client'

import { Category } from "@prisma/client"
import { useState } from "react"
import { createCategory, updateCategory, deleteCategory, resetCategoriesToDefaults, getResetCategoriesPreview } from "./actions"
import { ColorPicker } from "@/components/color-picker"

interface CategoryManagementProps {
  categories: Category[]
}

const EMOJI_OPTIONS = ["🏠", "💡", "🛡️", "🚗", "👶", "🏥", "🛒", "📱", "💳", "💰", "🎬", "📦", "✈️", "🎓", "🐾", "🏋️", "🎮", "📚", "🍕", "☕"]

export function CategoryManagement({ categories }: CategoryManagementProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [editingData, setEditingData] = useState({ name: "", icon: "", color: "" })
  const [newCategory, setNewCategory] = useState({ name: "", icon: "📦", color: "#f59e0b" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResetPreview, setShowResetPreview] = useState(false)
  const [resetPreview, setResetPreview] = useState<any>(null)

  const handleEdit = (category: Category) => {
    setIsEditing(category.id)
    setEditingData({
      name: category.name,
      icon: category.icon || "📦",
      color: category.color || "#f59e0b"
    })
  }

  const handleSave = async (categoryId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await updateCategory({
        id: categoryId,
        ...editingData
      })
      
      if (result.error) {
        setError(result.error)
      } else {
        setIsEditing(null)
      }
    } catch (err) {
      setError("Failed to update category")
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
        setNewCategory({ name: "", icon: "📦", color: "#f59e0b" })
      }
    } catch (err) {
      setError("Failed to create category")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await deleteCategory(categoryId)
      
      if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError("Failed to delete category")
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
    } catch (err) {
      setError("Failed to get reset preview")
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
    } catch (err) {
      setError("Failed to reset categories")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">Manage expense categories for your family</p>
        <button
          onClick={handleReset}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Reset to Defaults
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2 mb-4">
        {categories.map((category) => {
          const isEditingThis = isEditing === category.id

          if (isEditingThis) {
            return (
              <div key={category.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <select
                  value={editingData.icon}
                  onChange={(e) => setEditingData({ ...editingData, icon: e.target.value })}
                  className="w-16 rounded-md border-gray-300 text-center"
                >
                  {EMOJI_OPTIONS.map(emoji => (
                    <option key={emoji} value={emoji}>{emoji}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  value={editingData.name}
                  onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                  className="flex-1 w-full sm:w-auto rounded-md border-gray-300"
                  placeholder="Category name"
                />

                <div className="flex items-center gap-2">
                  <ColorPicker
                    value={editingData.color}
                    onChange={(color) => setEditingData({ ...editingData, color })}
                  />

                  <button
                    onClick={() => handleSave(category.id)}
                    disabled={isLoading || !editingData.name}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(null)}
                    className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )
          }

          return (
            <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
              <div className="flex items-center gap-3">
                <span className="text-xl">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <select
            value={newCategory.icon}
            onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
            className="w-16 rounded-md border-gray-300 text-center"
          >
            {EMOJI_OPTIONS.map(emoji => (
              <option key={emoji} value={emoji}>{emoji}</option>
            ))}
          </select>
          
          <input
            type="text"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            className="flex-1 w-full sm:w-auto rounded-md border-gray-300"
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
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setNewCategory({ name: "", icon: "📦", color: "#f59e0b" })
              }}
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
        >
          + Add Category
        </button>
      )}

      {/* Reset Preview Dialog */}
      {showResetPreview && resetPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold mb-4">Reset Categories to Defaults</h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Your expenses will be automatically migrated to the most appropriate default categories:
            </p>

            {/* Migration mapping */}
            {resetPreview.preview && resetPreview.preview.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-sm mb-2">Category Migration:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {resetPreview.preview.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span>{item.current.icon}</span>
                        <span>{item.current.name}</span>
                        {item.current.expenseCount > 0 && (
                          <span className="text-xs text-gray-500">
                            ({item.current.expenseCount} expense{item.current.expenseCount !== 1 ? 's' : ''})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">→</span>
                        <span>{item.willMapTo.icon}</span>
                        <span className="font-medium">{item.willMapTo.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New categories that will be added */}
            {resetPreview.willAddCategories && resetPreview.willAddCategories.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-sm mb-2">New Categories to be Added:</h4>
                <div className="flex flex-wrap gap-2">
                  {resetPreview.willAddCategories.map((cat: any, index: number) => (
                    <div key={index} className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded text-sm">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowResetPreview(false)
                  setResetPreview(null)
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
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