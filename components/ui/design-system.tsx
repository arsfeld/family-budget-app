// Family Budget App - Design System Components
// Centralized component patterns using Tailwind CSS

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

// Card Components with Design System
export function CardIncome({ 
  children, 
  className,
  ...props 
}: { 
  children: ReactNode; 
  className?: string;
  [key: string]: any;
}) {
  return (
    <div 
      className={cn(
        "bg-white rounded-xl shadow-resting p-6",
        "bg-gradient-income border border-income-primary/10",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-hover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardExpense({ 
  children, 
  className,
  ...props 
}: { 
  children: ReactNode; 
  className?: string;
  [key: string]: any;
}) {
  return (
    <div 
      className={cn(
        "bg-white rounded-xl shadow-resting p-6",
        "bg-gradient-expense border border-expense-primary/10",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-hover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardSummary({ 
  children, 
  className,
  ...props 
}: { 
  children: ReactNode; 
  className?: string;
  [key: string]: any;
}) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        "bg-white/80 backdrop-blur-md",
        "rounded-2xl shadow-active p-6",
        "border border-brand-primary/20",
        "bg-gradient-brand",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Typography Components
export function HeadingPage({ 
  children, 
  className,
  ...props 
}: { 
  children: ReactNode; 
  className?: string;
  [key: string]: any;
}) {
  return (
    <h1 
      className={cn(
        "text-display font-display text-gray-800",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export function HeadingSection({ 
  children, 
  className,
  ...props 
}: { 
  children: ReactNode; 
  className?: string;
  [key: string]: any;
}) {
  return (
    <h2 
      className={cn(
        "text-heading font-display text-gray-800",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function CurrencyDisplay({ 
  value, 
  size = "default",
  color = "default",
  className,
  ...props 
}: { 
  value: number; 
  size?: "default" | "large" | "xlarge";
  color?: "default" | "income" | "expense";
  className?: string;
  [key: string]: any;
}) {
  const sizeClasses = {
    default: "text-currency font-mono",
    large: "text-currency-lg font-mono",
    xlarge: "text-4xl font-mono font-bold",
  };

  const colorClasses = {
    default: "text-gray-800",
    income: "text-income-dark",
    expense: "text-expense-dark",
  };

  return (
    <span 
      className={cn(
        sizeClasses[size],
        colorClasses[color],
        "tabular-nums",
        className
      )}
      {...props}
    >
      ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
}

// Button Components
export function ButtonPrimary({ 
  children, 
  className,
  ...props 
}: { 
  children: ReactNode; 
  className?: string;
  [key: string]: any;
}) {
  return (
    <button 
      className={cn(
        "bg-brand-primary text-white px-6 py-3 rounded-lg font-medium",
        "shadow-sm hover:bg-brand-primary/90 hover:shadow-md",
        "transition-all duration-200",
        "active:scale-[0.98]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonSuccess({ 
  children, 
  className,
  ...props 
}: { 
  children: ReactNode; 
  className?: string;
  [key: string]: any;
}) {
  return (
    <button 
      className={cn(
        "bg-income-primary text-white px-6 py-3 rounded-lg font-medium",
        "shadow-sm hover:bg-income-primary/90 hover:shadow-md",
        "transition-all duration-200",
        "active:scale-[0.98]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Input Components
export function InputCurrency({ 
  className,
  ...props 
}: { 
  className?: string;
  [key: string]: any;
}) {
  return (
    <input 
      type="text"
      className={cn(
        "w-full px-4 py-3 bg-white rounded-lg",
        "border-2 border-transparent shadow-inner-subtle",
        "font-mono text-lg font-semibold",
        "transition-all duration-200",
        "placeholder:text-gray-400",
        "hover:border-gray-300",
        "focus:outline-none focus:border-brand-primary",
        "focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]",
        className
      )}
      {...props}
    />
  );
}

// Status Components
export function StatusIndicator({ 
  type,
  children,
  className,
  ...props 
}: { 
  type: "positive" | "negative" | "neutral";
  children: ReactNode;
  className?: string;
  [key: string]: any;
}) {
  const typeClasses = {
    positive: "text-income-dark bg-income-light/50 border-income-primary/20",
    negative: "text-expense-dark bg-expense-light/50 border-expense-primary/20",
    neutral: "text-gray-600 bg-gray-50 border-gray-200",
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full",
        "text-sm font-medium border",
        typeClasses[type],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Loading States
export function SkeletonCard({ 
  className,
  ...props 
}: { 
  className?: string;
  [key: string]: any;
}) {
  return (
    <div 
      className={cn(
        "bg-gray-200 rounded-xl animate-pulse",
        "h-32",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonText({ 
  className,
  ...props 
}: { 
  className?: string;
  [key: string]: any;
}) {
  return (
    <div 
      className={cn(
        "h-4 bg-gray-200 rounded animate-pulse",
        className
      )}
      {...props}
    />
  );
}

// Animation Wrapper
export function AnimateIn({ 
  children,
  delay = 0,
  className,
  ...props 
}: { 
  children: ReactNode;
  delay?: number;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div 
      className={cn(
        "animate-fade-up",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </div>
  );
}

// Empty State Component
export function EmptyState({ 
  title,
  description,
  action,
  className,
  ...props 
}: { 
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center",
        "py-16 px-8 text-center",
        "bg-gradient-to-b from-gray-50 to-transparent",
        "rounded-xl",
        className
      )}
      {...props}
    >
      <div className="w-16 h-16 bg-gray-200 rounded-full mb-6 animate-float" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm">{description}</p>
      {action && (
        <div className="animate-pulse">
          {action}
        </div>
      )}
    </div>
  );
}