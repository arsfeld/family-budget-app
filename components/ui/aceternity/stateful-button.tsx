'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/aceternity-utils'

interface StatefulButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  success?: boolean
  loadingText?: string
  successText?: string
  successDuration?: number
  onSuccess?: () => void
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>
}

export const StatefulButton = React.forwardRef<
  HTMLButtonElement,
  StatefulButtonProps
>(
  (
    {
      children,
      className,
      variant = 'default',
      size = 'md',
      loading = false,
      success = false,
      loadingText = 'Loading...',
      successText = 'Success!',
      successDuration = 2000,
      onSuccess,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const [internalSuccess, setInternalSuccess] = useState(false)
    const [internalLoading, setInternalLoading] = useState(false)

    const isLoading = loading || internalLoading
    const isSuccess = success || internalSuccess

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading || isSuccess || disabled) return

      if (onClick) {
        const result = onClick(e)
        if (result && typeof (result as Promise<void>).then === 'function') {
          setInternalLoading(true)
          try {
            await result
            setInternalSuccess(true)
            setTimeout(() => {
              setInternalSuccess(false)
              onSuccess?.()
            }, successDuration)
          } catch {
            // Handle error if needed
          } finally {
            setInternalLoading(false)
          }
        }
      }
    }

    const variants = {
      default:
        'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white',
      success:
        'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white',
      danger:
        'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white',
      ghost:
        'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    const baseClasses =
      'relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group'

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          isSuccess && 'bg-gradient-to-r from-green-500 to-emerald-500',
          className
        )}
        disabled={disabled || isLoading || isSuccess}
        onClick={handleClick}
        {...props}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="inline-flex items-center"
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {loadingText}
            </motion.span>
          ) : isSuccess ? (
            <motion.span
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center"
            >
              <Check className="mr-2 h-4 w-4" />
              {successText}
            </motion.span>
          ) : (
            <motion.span
              key="default"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Hover effect overlay */}
        <motion.div
          className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"
          initial={false}
        />

        {/* Ripple effect on click */}
        {!isLoading && !isSuccess && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={false}
            whileTap={{
              background: [
                'radial-gradient(circle, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)',
                'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)',
                'radial-gradient(circle, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)',
              ],
            }}
            transition={{ duration: 0.5 }}
          />
        )}
      </button>
    )
  }
)

StatefulButton.displayName = 'StatefulButton'

// Export a simplified version for primary actions
export const PrimaryButton = React.forwardRef<
  HTMLButtonElement,
  Omit<StatefulButtonProps, 'variant'>
>((props, ref) => <StatefulButton ref={ref} variant="default" {...props} />)

PrimaryButton.displayName = 'PrimaryButton'

// Export a simplified version for success actions
export const SuccessButton = React.forwardRef<
  HTMLButtonElement,
  Omit<StatefulButtonProps, 'variant'>
>((props, ref) => <StatefulButton ref={ref} variant="success" {...props} />)

SuccessButton.displayName = 'SuccessButton'