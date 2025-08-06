// Family Budget App - Design System Components
// Centralized component patterns using Tailwind CSS

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

// Card Components with Design System
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export function CardIncome({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'shadow-resting rounded-xl bg-white p-6',
        'bg-gradient-income border-income-primary/10 border',
        'transition-all duration-200',
        'hover:shadow-hover hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardExpense({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'shadow-resting rounded-xl bg-white p-6',
        'bg-gradient-expense border-expense-primary/10 border',
        'transition-all duration-200',
        'hover:shadow-hover hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardSummary({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'bg-white/80 backdrop-blur-md',
        'shadow-active rounded-2xl p-6',
        'border-brand-primary/20 border',
        'bg-gradient-brand',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Typography Components
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
  className?: string
}

export function HeadingPage({ children, className, ...props }: HeadingProps) {
  return (
    <h1
      className={cn('text-display font-display text-gray-800', className)}
      {...props}
    >
      {children}
    </h1>
  )
}

export function HeadingSection({
  children,
  className,
  ...props
}: HeadingProps) {
  return (
    <h2
      className={cn('text-heading font-display text-gray-800', className)}
      {...props}
    >
      {children}
    </h2>
  )
}

interface CurrencyDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number
  size?: 'default' | 'large' | 'xlarge'
  color?: 'default' | 'income' | 'expense'
  className?: string
}

export function CurrencyDisplay({
  value,
  size = 'default',
  color = 'default',
  className,
  ...props
}: CurrencyDisplayProps) {
  const sizeClasses = {
    default: 'text-2xl font-semibold',
    large: 'text-3xl font-bold',
    xlarge: 'text-4xl font-bold tracking-tight',
  }

  const colorClasses = {
    default: 'text-gray-900',
    income: 'text-emerald-600',
    expense: 'text-amber-600',
  }

  const isNegative = value < 0
  const displayValue = Math.abs(value)

  return (
    <span
      className={cn(
        sizeClasses[size],
        colorClasses[color],
        'tabular-nums font-mono',
        'transition-all duration-300',
        className
      )}
      {...props}
    >
      {isNegative && '-'}$
      {displayValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  )
}

// Button Components
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
}

export function ButtonPrimary({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'bg-brand-primary rounded-lg px-6 py-3 font-medium text-white',
        'hover:bg-brand-primary/90 shadow-sm hover:shadow-md',
        'transition-all duration-200',
        'active:scale-[0.98]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function ButtonSuccess({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'bg-income-primary rounded-lg px-6 py-3 font-medium text-white',
        'hover:bg-income-primary/90 shadow-sm hover:shadow-md',
        'transition-all duration-200',
        'active:scale-[0.98]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// Input Components
interface InputCurrencyProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export function InputCurrency({ className, ...props }: InputCurrencyProps) {
  return (
    <input
      type="text"
      className={cn(
        'w-full rounded-lg bg-white px-4 py-3',
        'shadow-inner-subtle border-2 border-transparent',
        'font-mono text-lg font-semibold',
        'transition-all duration-200',
        'placeholder:text-gray-400',
        'hover:border-gray-300',
        'focus:border-brand-primary focus:outline-none',
        'focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]',
        className
      )}
      {...props}
    />
  )
}

// Status Components
interface StatusIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  type: 'positive' | 'negative' | 'neutral'
  children: ReactNode
  className?: string
}

export function StatusIndicator({
  type,
  children,
  className,
  ...props
}: StatusIndicatorProps) {
  const typeClasses = {
    positive: 'text-income-dark bg-income-light/50 border-income-primary/20',
    negative: 'text-expense-dark bg-expense-light/50 border-expense-primary/20',
    neutral: 'text-gray-600 bg-gray-50 border-gray-200',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1',
        'border text-sm font-medium',
        typeClasses[type],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

// Loading States
export function SkeletonCard({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-gray-200', 'h-32', className)}
      {...props}
    />
  )
}

export function SkeletonText({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('h-4 animate-pulse rounded bg-gray-200', className)}
      {...props}
    />
  )
}

// Animation Wrapper
interface AnimateInProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  delay?: number
  className?: string
}

export function AnimateIn({
  children,
  delay = 0,
  className,
  ...props
}: AnimateInProps) {
  return (
    <div
      className={cn('animate-fade-up', className)}
      style={{ animationDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </div>
  )
}

// Empty State Component
interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'px-8 py-16 text-center',
        'bg-gradient-to-b from-gray-50 to-transparent',
        'rounded-xl',
        className
      )}
      {...props}
    >
      <div className="animate-float mb-6 h-16 w-16 rounded-full bg-gray-200" />
      <h3 className="mb-2 text-xl font-semibold text-gray-800">{title}</h3>
      <p className="mb-6 max-w-sm text-gray-500">{description}</p>
      {action && <div className="animate-pulse">{action}</div>}
    </div>
  )
}
