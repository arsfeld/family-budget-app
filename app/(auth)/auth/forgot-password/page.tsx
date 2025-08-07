'use client'

import { useState } from 'react'
import { CardSpotlight } from '@/components/ui/aceternity/card-spotlight'
import { StatefulButton } from '@/components/ui/aceternity/stateful-button'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'Failed to send reset email')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950/50">
        <CardSpotlight className="w-full max-w-md p-8">
          <div className="text-center space-y-4">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Check Your Email</h1>
            <p className="text-gray-600 dark:text-gray-300">
              If an account exists with {email}, we&apos;ve sent password reset instructions to that email address.
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              The link will expire in 1 hour.
            </p>
            <Link href="/login">
              <StatefulButton className="w-full mt-4">
                Back to Login
              </StatefulButton>
            </Link>
          </div>
        </CardSpotlight>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950/50">
      <CardSpotlight className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Enter your email to receive reset instructions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 dark:focus:border-purple-500"
              placeholder="your@email.com"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <StatefulButton
            type="submit"
            loading={loading}
            loadingText="Sending..."
            className="w-full"
          >
            Send Reset Email
          </StatefulButton>

          <div className="text-center">
            <Link href="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm">
              Back to Login
            </Link>
          </div>
        </form>
      </CardSpotlight>
    </div>
  )
}