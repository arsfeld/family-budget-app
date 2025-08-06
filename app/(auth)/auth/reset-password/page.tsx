'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CardSpotlight } from '@/components/ui/aceternity/card-spotlight'
import { StatefulButton } from '@/components/ui/aceternity/stateful-button'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('Password reset successfully!')
        router.push('/login')
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <CardSpotlight className="w-full max-w-md p-8">
          <div className="text-center space-y-4">
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h1 className="text-2xl font-bold text-white">Invalid Reset Link</h1>
            <p className="text-gray-300">
              This password reset link is invalid or has expired.
            </p>
            <Link href="/auth/forgot-password">
              <StatefulButton className="w-full mt-4">
                Request New Link
              </StatefulButton>
            </Link>
          </div>
        </CardSpotlight>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <CardSpotlight className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Set New Password</h1>
          <p className="text-gray-300 mt-2">Choose a strong password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="••••••••"
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
            loadingText="Resetting..."
            className="w-full"
          >
            Reset Password
          </StatefulButton>

          <div className="text-center">
            <Link href="/login" className="text-purple-400 hover:text-purple-300 text-sm">
              Back to Login
            </Link>
          </div>
        </form>
      </CardSpotlight>
    </div>
  )
}