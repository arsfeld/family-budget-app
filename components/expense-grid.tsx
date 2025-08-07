'use client'

import { useState, useRef, useEffect, KeyboardEvent, forwardRef, useImperativeHandle } from 'react'
import { Plus, Check, X, Trash2, User, ChevronDown, MoveRight, Users } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

interface User {
  id: string
  name: string
}

interface ExpenseRow {
  id: string
  userId: string
  name: string
  categoryId: string
  amount: string
  isShared?: boolean
  sharePercentage?: string
  isNew?: boolean
  isEditing?: boolean
}

interface CustomDropdownProps {
  value: string
  options: Array<{ id: string; label: string; icon?: string }>
  onChange: (value: string) => void
  onClose: () => void
  placeholder?: string
}

function CustomDropdown({ value, options, onChange, onClose, placeholder }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleSelect = (optionId: string) => {
    onChange(optionId)
    onClose()
  }

  const selectedOption = options.find(o => o.id === value)

  return (
    <div ref={dropdownRef} className="relative">
      <div 
        className="w-full px-2 py-1 text-sm border-2 border-blue-400 rounded bg-white cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-1">
          {selectedOption?.icon && <span>{selectedOption.icon}</span>}
          <span>{selectedOption?.label || placeholder}</span>
        </span>
        <ChevronDown className="h-3 w-3" />
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
          {options.map((option) => (
            <div
              key={option.id}
              className="px-2 py-1.5 text-sm hover:bg-blue-50 cursor-pointer flex items-center gap-1"
              onClick={() => handleSelect(option.id)}
            >
              {option.icon && <span>{option.icon}</span>}
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface ExpenseGridProps {
  users: User[]
  categories: Category[]
  existingExpenses: Array<{
    id: string
    userId: string
    name: string
    categoryId: string
    amount: number
    isShared?: boolean
    sharePercentage?: number
  }>
  currentUserId?: string
  onSave: (expense: {
    id?: string
    userId: string
    name: string
    categoryId: string
    amount: number
    isShared?: boolean
    sharePercentage?: number
  }) => Promise<void>
  onDelete: (expenseId: string) => Promise<void>
}

export const ExpenseGrid = forwardRef<{ addNewRow: () => void }, ExpenseGridProps>(({
  users,
  categories,
  existingExpenses,
  currentUserId,
  onSave,
  onDelete,
}, ref) => {
  const [rows, setRows] = useState<ExpenseRow[]>([])
  const [editingCell, setEditingCell] = useState<{
    rowId: string
    field: 'name' | 'category' | 'amount'
  } | null>(null)
  const [movingRowId, setMovingRowId] = useState<string | null>(null)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Initialize rows from existing expenses
  useEffect(() => {
    const initialRows: ExpenseRow[] = existingExpenses.map((expense) => ({
      id: expense.id,
      userId: expense.userId,
      name: expense.name,
      categoryId: expense.categoryId,
      amount: expense.amount.toString(),
      isShared: expense.isShared || false,
      sharePercentage: expense.sharePercentage?.toString() || '100',
      isNew: false,
      isEditing: false,
    }))
    setRows(initialRows)
  }, [existingExpenses])

  // Expose addNewRow to parent component
  useImperativeHandle(ref, () => ({
    addNewRow: () => {
      if (!rows.some(r => r.isNew)) {
        addNewRow()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [rows])

  const addNewRow = (userId?: string) => {
    const newRow: ExpenseRow = {
      id: `new-${Date.now()}`,
      userId: userId || currentUserId || users[0]?.id || '',
      name: '',
      categoryId: categories[0]?.id || '',
      amount: '',
      isShared: false,
      sharePercentage: '100',
      isNew: true,
      isEditing: true,
    }
    setRows([...rows, newRow])
    setEditingCell({ rowId: newRow.id, field: 'name' })
    
    setTimeout(() => {
      const ref = inputRefs.current[`${newRow.id}-name`]
      if (ref) ref.focus()
    }, 50)
  }

  const handleCellClick = (rowId: string, field: 'name' | 'category' | 'amount') => {
    setEditingCell({ rowId, field })
    if (field === 'name' || field === 'amount') {
      setTimeout(() => {
        const ref = inputRefs.current[`${rowId}-${field}`]
        if (ref) ref.focus()
      }, 50)
    }
  }

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    rowId: string,
    field: 'name' | 'amount'
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const row = rows.find((r) => r.id === rowId)
      
      if (field === 'amount' && row) {
        saveRow(rowId)
      } else {
        // Move to next field
        if (field === 'name') {
          setEditingCell({ rowId, field: 'category' })
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      if (field === 'name') {
        setEditingCell({ rowId, field: 'category' })
      } else if (field === 'amount') {
        // End editing when tabbing from amount field
        setEditingCell(null)
      }
    } else if (e.key === 'Escape') {
      cancelEditing(rowId)
    }
  }

  const updateRow = (rowId: string, field: keyof ExpenseRow, value: string | boolean) => {
    setRows(rows.map((row) => {
      if (row.id === rowId) {
        if (field === 'isShared') {
          return { ...row, isShared: value === 'true' || value === true }
        }
        return { ...row, [field]: value }
      }
      return row
    }))
  }

  const saveRow = async (rowId: string) => {
    const row = rows.find((r) => r.id === rowId)
    if (!row || !row.name || !row.amount) return

    try {
      await onSave({
        id: row.isNew ? undefined : row.id,
        userId: row.userId,
        name: row.name,
        categoryId: row.categoryId,
        amount: parseFloat(row.amount) || 0,
        isShared: row.isShared || false,
        sharePercentage: parseInt(row.sharePercentage || '100') || 100,
      })

      // Remove the row if it's new (it will be re-added from props)
      if (row.isNew) {
        setRows(rows.filter((r) => r.id !== rowId))
      } else {
        setRows(
          rows.map((r) =>
            r.id === rowId ? { ...r, isNew: false, isEditing: false } : r
          )
        )
      }
      setEditingCell(null)
    } catch (error) {
      console.error('Failed to save expense:', error)
    }
  }

  const cancelEditing = (rowId: string) => {
    const row = rows.find((r) => r.id === rowId)
    if (row?.isNew) {
      setRows(rows.filter((r) => r.id !== rowId))
    }
    setEditingCell(null)
  }

  const deleteRow = async (rowId: string) => {
    const row = rows.find((r) => r.id === rowId)
    if (row?.isNew) {
      setRows(rows.filter((r) => r.id !== rowId))
    } else {
      if (confirm('Delete this expense?')) {
        try {
          await onDelete(rowId)
          setRows(rows.filter((r) => r.id !== rowId))
        } catch (error) {
          console.error('Failed to delete expense:', error)
        }
      }
    }
  }

  const getCategoryDisplay = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category || null
  }


  // Sort rows by userId to group them subtly
  const sortedRows = [...rows].sort((a, b) => {
    if (a.userId === b.userId) return 0
    return a.userId < b.userId ? -1 : 1
  })

  // Get user colors for subtle differentiation
  const userColors = users.reduce((acc, user, index) => {
    const colors = [
      'bg-blue-50 hover:bg-blue-100',
      'bg-green-50 hover:bg-green-100',
      'bg-purple-50 hover:bg-purple-100',
      'bg-amber-50 hover:bg-amber-100',
    ]
    acc[user.id] = colors[index % colors.length]
    return acc
  }, {} as Record<string, string>)

  // Group expenses by user for better organization
  const expensesByUser = users.map(user => ({
    user,
    expenses: sortedRows.filter(row => row.userId === user.id && !row.isNew),
    hasNewRow: sortedRows.some(row => row.userId === user.id && row.isNew)
  }))

  return (
    <div className="w-full space-y-3">
      {/* Column headers */}
      <div className="grid grid-cols-[2.5fr_2fr_1.2fr_0.5fr_auto] gap-3 px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wider bg-gray-50 rounded-lg border-b border-gray-200">
        <div>Expense</div>
        <div>Category</div>
        <div className="text-right">Amount</div>
        <div className="text-center" title="Shared">
          <Users className="h-3 w-3 inline" />
        </div>
        <div className="w-20"></div>
      </div>

      {/* Expenses grouped by user */}
      <div className="space-y-3">
        {expensesByUser.map(({ user, expenses, hasNewRow }, index) => (
          <div key={user.id} className="space-y-1">
            {/* User header with Add button */}
            <div className={`flex items-center justify-between gap-2 mb-1 ${index > 0 ? 'mt-3' : ''}`}>
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-gray-400" />
                <span className="text-xs font-medium text-gray-500">
                  {user.name}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              {!hasNewRow && !rows.some(r => r.isNew) && (
                <button
                  onClick={() => addNewRow(user.id)}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              )}
            </div>

            {/* User's expenses and new rows */}
            {[...expenses, ...sortedRows.filter(r => r.userId === user.id && r.isNew)].map((row) => {
              const isEditingName = editingCell?.rowId === row.id && editingCell?.field === 'name'
              const isEditingCategory = editingCell?.rowId === row.id && editingCell?.field === 'category'
              const isEditingAmount = editingCell?.rowId === row.id && editingCell?.field === 'amount'
              const category = getCategoryDisplay(row.categoryId)
              const isEditing = editingCell?.rowId === row.id
              const isMoving = movingRowId === row.id
              const userColor = userColors[row.userId] || 'bg-gray-50 hover:bg-gray-100'

              return (
                <div
                  key={row.id}
                  className={`group grid grid-cols-[2.5fr_2fr_1.2fr_0.5fr_auto] gap-3 px-4 py-2 rounded-lg transition-all ${
                    row.isNew
                      ? 'bg-green-50 ring-2 ring-green-200'
                      : isEditing 
                        ? 'bg-white ring-2 ring-blue-200' 
                        : userColor
                  }`}
                >
                  {/* Name */}
                  <div onClick={() => !isEditingName && handleCellClick(row.id, 'name')}>
                    {isEditingName ? (
                      <input
                        ref={(el) => { inputRefs.current[`${row.id}-name`] = el }}
                        type="text"
                        value={row.name}
                        onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, row.id, 'name')}
                        onBlur={() => !row.isNew && setEditingCell(null)}
                        className="w-full px-2 py-1 text-sm border-2 border-blue-400 rounded focus:outline-none focus:border-blue-500"
                        placeholder="Expense name"
                        autoFocus
                      />
                    ) : (
                      <div className="px-2 py-1 text-sm cursor-pointer hover:bg-white/60 rounded">
                        {row.name || <span className="text-gray-400 italic">Add expense...</span>}
                      </div>
                    )}
                  </div>

                  {/* Category - Custom Dropdown */}
                  <div onClick={() => !isEditingCategory && handleCellClick(row.id, 'category')}>
                    {isEditingCategory ? (
                      <CustomDropdown
                        value={row.categoryId}
                        options={categories.map(cat => ({
                          id: cat.id,
                          label: cat.name,
                          icon: cat.icon
                        }))}
                        onChange={(value) => {
                          updateRow(row.id, 'categoryId', value)
                          setEditingCell({ rowId: row.id, field: 'amount' })
                        }}
                        onClose={() => !row.isNew && setEditingCell(null)}
                        placeholder="Select category"
                      />
                    ) : (
                      <div className="px-2 py-1 text-sm cursor-pointer hover:bg-white/60 rounded flex items-center gap-1">
                        {category && (
                          <>
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Amount */}
                  <div onClick={() => !isEditingAmount && handleCellClick(row.id, 'amount')}>
                    {isEditingAmount ? (
                      <input
                        ref={(el) => { inputRefs.current[`${row.id}-amount`] = el }}
                        type="number"
                        value={row.amount}
                        onChange={(e) => updateRow(row.id, 'amount', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, row.id, 'amount')}
                        onBlur={() => !row.isNew && setEditingCell(null)}
                        className="w-full px-2 py-1 text-sm text-right border-2 border-blue-400 rounded focus:outline-none focus:border-blue-500 font-mono"
                        placeholder="0.00"
                        step="0.01"
                      />
                    ) : (
                      <div className="px-2 py-1 text-sm text-right cursor-pointer hover:bg-white/60 rounded font-mono">
                        {row.amount ? (
                          <span className="font-medium">${parseFloat(row.amount).toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-400 italic">$0.00</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Shared checkbox */}
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={row.isShared || false}
                      onChange={(e) => updateRow(row.id, 'isShared', e.target.checked.toString())}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      title={row.isShared ? `Shared (${row.sharePercentage || 100}%)` : 'Not shared'}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 relative">
                    {row.isNew && row.name && row.amount ? (
                      <button
                        onClick={() => saveRow(row.id)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Save"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    ) : null}
                    {row.isNew ? (
                      <button
                        onClick={() => cancelEditing(row.id)}
                        className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setMovingRowId(isMoving ? null : row.id)}
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Move to another person"
                        >
                          <MoveRight className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteRow(row.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    
                    {/* Move menu */}
                    {isMoving && (
                      <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[150px]">
                        <div className="text-xs font-medium text-gray-600 mb-2">Move to:</div>
                        {users.filter(u => u.id !== row.userId).map(targetUser => (
                          <button
                            key={targetUser.id}
                            onClick={() => {
                              updateRow(row.id, 'userId', targetUser.id)
                              setMovingRowId(null)
                              // Trigger save to persist the change
                              saveRow(row.id)
                            }}
                            className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                          >
                            {targetUser.name}
                          </button>
                        ))}
                        <button
                          onClick={() => setMovingRowId(null)}
                          className="w-full text-left px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded mt-1 border-t"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Status message when adding */}
      {rows.some(r => r.isNew) && (
        <div className="text-center text-sm text-gray-500 py-2">
          Complete the form above or press Esc to cancel
        </div>
      )}

      {/* Quick tips */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>Quick tips:</span>
        <span>Click any field to edit</span>
        <span>•</span>
        <span>Tab to move between fields</span>
        <span>•</span>
        <span>Enter to save</span>
      </div>
    </div>
  )
})

ExpenseGrid.displayName = 'ExpenseGrid'