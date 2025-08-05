'use client'

import { useState, useRef, useEffect } from 'react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  presetColors?: string[]
}

const DEFAULT_PRESET_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#14b8a6', // teal
  '#84cc16', // lime
  '#eab308', // yellow
  '#f97316', // orange
  '#ef4444', // red
  '#a855f7', // purple
  '#f59e0b', // amber
  '#22c55e', // green
  '#0ea5e9', // sky
  '#6366f1', // indigo
  '#e11d48', // rose
  '#64748b', // slate
  '#71717a', // zinc
]

export function ColorPicker({ value, onChange, presetColors = DEFAULT_PRESET_COLORS }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [customColor, setCustomColor] = useState(value)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCustomColor(value)
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setCustomColor(color)
    onChange(color)
  }

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div 
          className="w-6 h-6 rounded border border-gray-300"
          style={{ backgroundColor: value }}
        />
        <span className="text-sm text-gray-700">{value}</span>
        <svg 
          className="w-4 h-4 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showPicker && (
        <div className="absolute z-50 mt-2 p-3 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[240px]">
          {/* Preset colors */}
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-700 mb-2">Preset Colors</p>
            <div className="grid grid-cols-6 gap-1">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    onChange(color)
                    setCustomColor(color)
                    setShowPicker(false)
                  }}
                  className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                    value === color ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Custom color input */}
          <div className="pt-3 border-t">
            <p className="text-xs font-medium text-gray-700 mb-2">Custom Color</p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="h-8 w-16 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  const color = e.target.value
                  if (/^#[0-9A-F]{6}$/i.test(color)) {
                    setCustomColor(color)
                    onChange(color)
                  } else {
                    setCustomColor(color)
                  }
                }}
                placeholder="#000000"
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}