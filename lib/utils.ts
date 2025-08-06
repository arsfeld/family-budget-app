import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export const SALARY_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly', multiplier: 52 / 12 },
  { value: 'biweekly', label: 'Every 2 Weeks', multiplier: 26 / 12 },
  { value: 'semimonthly', label: 'Twice a Month', multiplier: 2 },
  { value: 'monthly', label: 'Monthly', multiplier: 1 },
  { value: 'yearly', label: 'Yearly', multiplier: 1 / 12 },
] as const

export type SalaryFrequency = (typeof SALARY_FREQUENCIES)[number]['value']

export function calculateMonthlyAmount(
  amount: number,
  frequency: SalaryFrequency
): number {
  const freq = SALARY_FREQUENCIES.find((f) => f.value === frequency)
  if (!freq) return amount // default to monthly if not found
  return amount * freq.multiplier
}
