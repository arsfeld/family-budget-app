'use client'

import React from 'react'
import { cn } from '@/lib/aceternity-utils'

export const CardSpotlight = ({
  children,
  className,
  radius = 350,
}: {
  children: React.ReactNode
  className?: string
  radius?: number
}) => {
  return (
    <div
      className={cn(
        'group/card relative overflow-hidden rounded-2xl',
        'bg-white/80 backdrop-blur-xl backdrop-saturate-150',
        'border border-gray-200/50',
        'shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]',
        'transition-colors duration-200 ease-out',
        'dark:border-neutral-800/50 dark:bg-neutral-900/80',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-60" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export const IncomeCardSpotlight = ({
  children,
  className,
  radius = 350,
}: {
  children: React.ReactNode
  className?: string
  radius?: number
}) => {
  return (
    <div
      className={cn(
        'group/card relative overflow-hidden rounded-2xl',
        'bg-gradient-to-br from-emerald-50/40 via-white/80 to-green-50/30',
        'backdrop-blur-xl backdrop-saturate-150',
        'border border-emerald-200/30',
        'shadow-[0_2px_8px_rgba(16,185,129,0.08),0_1px_2px_rgba(0,0,0,0.04)]',
        'transition-colors duration-200 ease-out',
        'hover:border-emerald-200/50',
        'dark:from-emerald-950/40 dark:via-neutral-900/80 dark:to-green-950/30',
        'dark:border-emerald-800/30',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-400/20 to-transparent blur-3xl transition-all duration-500 group-hover/card:scale-150 group-hover/card:opacity-70" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export const ExpenseCardSpotlight = ({
  children,
  className,
  radius = 350,
}: {
  children: React.ReactNode
  className?: string
  radius?: number
}) => {
  return (
    <div
      className={cn(
        'group/card relative overflow-hidden rounded-2xl',
        'bg-gradient-to-br from-amber-50/40 via-white/80 to-orange-50/30',
        'backdrop-blur-xl backdrop-saturate-150',
        'border border-amber-200/30',
        'shadow-[0_2px_8px_rgba(245,158,11,0.08),0_1px_2px_rgba(0,0,0,0.04)]',
        'transition-colors duration-200 ease-out',
        'hover:border-amber-200/50',
        'dark:from-amber-950/40 dark:via-neutral-900/80 dark:to-orange-950/30',
        'dark:border-amber-800/30',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-amber-400/20 to-transparent blur-3xl transition-all duration-500 group-hover/card:scale-150 group-hover/card:opacity-70" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export const SummaryCardSpotlight = ({
  children,
  className,
  radius = 350,
  isPositive = true,
}: {
  children: React.ReactNode
  className?: string
  radius?: number
  isPositive?: boolean
}) => {
  const baseClasses = cn(
    'group/card relative overflow-hidden rounded-2xl',
    'backdrop-blur-xl backdrop-saturate-150',
    'transition-colors duration-200 ease-out'
  )

  const positiveClasses = cn(
    'bg-gradient-to-br from-indigo-50/40 via-white/80 to-violet-50/30',
    'border border-indigo-200/30',
    'shadow-[0_2px_8px_rgba(99,102,241,0.08),0_1px_2px_rgba(0,0,0,0.04)]',
    'hover:border-indigo-200/50',
    'dark:from-indigo-950/40 dark:via-neutral-900/80 dark:to-violet-950/30',
    'dark:border-indigo-800/30'
  )

  const negativeClasses = cn(
    'bg-gradient-to-br from-rose-50/40 via-white/80 to-red-50/30',
    'border border-rose-200/30',
    'shadow-[0_2px_8px_rgba(244,63,94,0.08),0_1px_2px_rgba(0,0,0,0.04)]',
    'hover:border-rose-200/50',
    'dark:from-rose-950/40 dark:via-neutral-900/80 dark:to-red-950/30',
    'dark:border-rose-800/30'
  )

  const overlayColor = isPositive ? 'from-indigo-400/10' : 'from-rose-400/10'
  const glowColor = isPositive ? 'from-indigo-400/20' : 'from-rose-400/20'

  return (
    <div
      className={cn(
        baseClasses,
        isPositive ? positiveClasses : negativeClasses,
        className
      )}
    >
      <div className={cn(
        'absolute inset-0 bg-gradient-to-tr via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100',
        overlayColor
      )} />
      <div className={cn(
        'absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br to-transparent blur-3xl transition-all duration-500 group-hover/card:scale-150 group-hover/card:opacity-70',
        glowColor
      )} />
      <div className="relative z-10">{children}</div>
    </div>
  )
}