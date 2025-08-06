'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/aceternity-utils'

type LoadingState = {
  text: string
  id: number
}

interface MultiStepLoaderProps {
  loadingStates: LoadingState[]
  loading?: boolean
  duration?: number
  className?: string
  successMessage?: string
  onComplete?: () => void
}

export const MultiStepLoader = ({
  loadingStates,
  loading = true,
  duration = 2000,
  className,
  successMessage = 'All done!',
  onComplete,
}: MultiStepLoaderProps) => {
  const [currentState, setCurrentState] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!loading || isComplete) return

    const interval = setInterval(() => {
      setCurrentState((prev) => {
        if (prev === loadingStates.length - 1) {
          clearInterval(interval)
          setIsComplete(true)
          onComplete?.()
          return prev
        }
        return prev + 1
      })
    }, duration)

    return () => clearInterval(interval)
  }, [loading, loadingStates.length, duration, isComplete, onComplete])

  if (!loading && !isComplete) return null

  return (
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm', className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4"
      >
        <div className="space-y-4">
          {loadingStates.map((state, index) => (
            <motion.div
              key={state.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'flex items-center gap-3',
                index > currentState && 'opacity-30'
              )}
            >
              <div className="relative">
                <AnimatePresence mode="wait">
                  {index <= currentState ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pending"
                      className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-700"
                    />
                  )}
                </AnimatePresence>
                {index === currentState && !isComplete && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-indigo-500"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  index <= currentState
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-400 dark:text-gray-600'
                )}
              >
                {state.text}
              </span>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {successMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// Skeleton loader with shimmer effect
export const ShimmerLoader = ({ className }: { className?: string }) => {
  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800', className)}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}

// Card skeleton loader
export const CardSkeletonLoader = ({ className }: { className?: string }) => {
  return (
    <div className={cn('p-6 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
      <ShimmerLoader className="h-4 w-24 mb-4" />
      <ShimmerLoader className="h-8 w-32 mb-2" />
      <ShimmerLoader className="h-4 w-full" />
    </div>
  )
}

// Pulsing dots loader
export const DotsLoader = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  )
}

// Progress bar loader
export const ProgressLoader = ({
  progress,
  className,
  showPercentage = true,
}: {
  progress: number
  className?: string
  showPercentage?: boolean
}) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showPercentage && (
        <motion.p
          className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {progress}%
        </motion.p>
      )}
    </div>
  )
}