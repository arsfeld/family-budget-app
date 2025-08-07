// Reusable components built on top of Aceternity UI
'use client'

import { cn } from '@/lib/aceternity-utils'
import { ReactNode } from 'react'
import {
  IncomeCardSpotlight,
  ExpenseCardSpotlight,
  SummaryCardSpotlight,
  CardSpotlight,
  StatefulButton,
} from '@/components/ui/aceternity'

// Typography Components
interface TypographyProps {
  children: ReactNode
  className?: string
}

export function HeadingPage({ children, className }: TypographyProps) {
  return (
    <h1
      className={cn(
        'text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100',
        className
      )}
    >
      {children}
    </h1>
  )
}

export function HeadingSection({ children, className }: TypographyProps) {
  return (
    <h2
      className={cn(
        'text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100',
        className
      )}
    >
      {children}
    </h2>
  )
}

export function HeadingCard({ children, className }: TypographyProps) {
  return (
    <h3
      className={cn(
        'text-lg font-semibold text-gray-800 dark:text-gray-200',
        className
      )}
    >
      {children}
    </h3>
  )
}

// Currency Display Component
interface CurrencyDisplayProps {
  value: number
  size?: 'small' | 'medium' | 'large'
  color?: 'income' | 'expense' | 'neutral'
  className?: string
}

export function CurrencyDisplay({
  value,
  size = 'medium',
  color = 'neutral',
  className,
}: CurrencyDisplayProps) {
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)

  return (
    <span
      className={cn(
        'font-mono tabular-nums',
        size === 'small' && 'text-lg',
        size === 'medium' && 'text-xl font-semibold',
        size === 'large' && 'text-2xl font-bold',
        color === 'income' && 'text-emerald-700 dark:text-emerald-400',
        color === 'expense' && 'text-amber-700 dark:text-amber-400',
        color === 'neutral' && 'text-gray-700 dark:text-gray-300',
        className
      )}
    >
      {formattedValue}
    </span>
  )
}

// Status Indicator Component
interface StatusIndicatorProps {
  type: 'positive' | 'negative' | 'neutral'
  children: ReactNode
  className?: string
}

export function StatusIndicator({
  type,
  children,
  className,
}: StatusIndicatorProps) {
  return (
    <span
      className={cn(
        'text-sm font-medium rounded-full px-3 py-1 inline-flex items-center',
        type === 'positive' && 
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        type === 'negative' && 
          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        type === 'neutral' && 
          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        className
      )}
    >
      {children}
    </span>
  )
}

// Card Components - Extending Aceternity
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export function CardIncome({ children, className, ...props }: CardProps) {
  return (
    <IncomeCardSpotlight className={cn('p-6', className)} {...props}>
      {children}
    </IncomeCardSpotlight>
  )
}

export function CardExpense({ children, className, ...props }: CardProps) {
  return (
    <ExpenseCardSpotlight className={cn('p-6', className)} {...props}>
      {children}
    </ExpenseCardSpotlight>
  )
}

export function CardSummary({ children, className, ...props }: CardProps) {
  return (
    <SummaryCardSpotlight className={cn('p-6', className)} {...props}>
      {children}
    </SummaryCardSpotlight>
  )
}

export function CardBase({ children, className, ...props }: CardProps) {
  return (
    <CardSpotlight className={cn('p-6', className)} {...props}>
      {children}
    </CardSpotlight>
  )
}

// Form Components
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export function InputBase({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-lg px-4 py-3',
        'border-2 border-gray-200 dark:border-neutral-700',
        'text-gray-700 dark:text-gray-200',
        'bg-white dark:bg-neutral-900',
        'placeholder:text-gray-400 dark:placeholder:text-gray-500',
        'focus:border-indigo-500 dark:focus:border-indigo-400',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
        'transition-all duration-200',
        className
      )}
      {...props}
    />
  )
}

export function InputCurrency({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-lg px-4 py-3',
        'border-2 border-gray-200 dark:border-neutral-700',
        'font-mono text-lg font-semibold tabular-nums',
        'text-gray-900 dark:text-gray-100',
        'bg-white dark:bg-neutral-900',
        'placeholder:text-gray-400 dark:placeholder:text-gray-500',
        'focus:border-indigo-500 dark:focus:border-indigo-400',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
        'transition-all duration-200',
        className
      )}
      {...props}
    />
  )
}

// Button Components - Extending StatefulButton
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
  loading?: boolean
  loadingText?: string
}

export function ButtonPrimary({ 
  children, 
  className, 
  loading = false,
  loadingText = 'Loading...',
  ...props 
}: ButtonProps) {
  if (loading !== undefined) {
    return (
      <StatefulButton
        loading={loading}
        loadingText={loadingText}
        className={cn(
          'bg-indigo-600 hover:bg-indigo-700',
          'dark:bg-indigo-500 dark:hover:bg-indigo-600',
          className
        )}
        {...props}
      >
        {children}
      </StatefulButton>
    )
  }
  
  return (
    <button
      className={cn(
        'px-6 py-3 rounded-lg font-medium',
        'bg-indigo-600 text-white hover:bg-indigo-700',
        'dark:bg-indigo-500 dark:hover:bg-indigo-600',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function ButtonSecondary({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-6 py-3 rounded-lg font-medium',
        'bg-white text-gray-700 border border-gray-300',
        'hover:bg-gray-50 dark:bg-neutral-900 dark:text-gray-200',
        'dark:border-neutral-700 dark:hover:bg-neutral-800',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-gray-300',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function ButtonSuccess({ 
  children, 
  className,
  loading = false,
  loadingText = 'Loading...',
  ...props 
}: ButtonProps) {
  if (loading !== undefined) {
    return (
      <StatefulButton
        loading={loading}
        loadingText={loadingText}
        variant="success"
        className={cn(
          'bg-emerald-600 hover:bg-emerald-700',
          'dark:bg-emerald-500 dark:hover:bg-emerald-600',
          className
        )}
        {...props}
      >
        {children}
      </StatefulButton>
    )
  }

  return (
    <button
      className={cn(
        'px-6 py-3 rounded-lg font-medium',
        'bg-emerald-600 text-white hover:bg-emerald-700',
        'dark:bg-emerald-500 dark:hover:bg-emerald-600',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500/20',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// Loading Components
interface LoadingProps {
  className?: string
}

export function SkeletonCard({ className }: LoadingProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-neutral-800',
        'h-32 w-full rounded-xl',
        className
      )}
    />
  )
}

export function SkeletonText({ className }: LoadingProps) {
  return (
    <div className="space-y-2">
      <div className={cn('animate-pulse bg-gray-200 dark:bg-neutral-800 h-4 rounded', 'mb-2', className)} />
      <div className={cn('animate-pulse bg-gray-200 dark:bg-neutral-800 h-4 rounded', 'w-2/3', className)} />
    </div>
  )
}

export function SkeletonCurrency({ className }: LoadingProps) {
  return (
    <div className="inline-block">
      <div className={cn('animate-pulse bg-gray-200 dark:bg-neutral-800 h-8 w-32 rounded', className)} />
    </div>
  )
}

// Empty State Component
interface EmptyStateProps {
  title?: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-xl border-2 border-dashed',
        'border-gray-300 dark:border-neutral-700',
        'p-12 text-center',
        'bg-gray-50/50 dark:bg-neutral-900/50',
        className
      )}
    >
      {title && (
        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      )}
      {description && (
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// Animation Wrapper Component
interface AnimateInProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function AnimateIn({ children, delay = 0, className }: AnimateInProps) {
  return (
    <div
      className={cn('animate-fade-up', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}