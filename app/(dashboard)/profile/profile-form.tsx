'use client'

import { User } from '@prisma/client'
import { useState } from 'react'
import { updateProfile } from './actions'
import { StatefulButton } from '@/components/ui/aceternity'
import { AnimatedTooltip } from '@/components/ui/aceternity'

export function ProfileForm({ user }: { user: User }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await updateProfile({ name, email })
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setIsEditing(false)
        setTimeout(() => setSuccess(false), 2000)
      }
    } catch {
      setError('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="group">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Name
            </label>
            <div className="rounded-lg bg-gray-50 p-3 transition-colors group-hover:bg-gray-100">
              <p className="font-medium text-gray-900">{user.name}</p>
            </div>
          </div>
          
          <div className="group">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="rounded-lg bg-gray-50 p-3 transition-colors group-hover:bg-gray-100">
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="group">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Account Status
          </label>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                user.isVerified
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                  : 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800'
              }`}
            >
              {user.isVerified ? '✓ Verified' : '⏳ Unverified'}
            </span>
            {!user.isVerified && (
              <AnimatedTooltip content="Check your email to verify your account">
                <span className="cursor-help text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </AnimatedTooltip>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <StatefulButton
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700"
          >
            Edit Profile
          </StatefulButton>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>
      </div>

      {error && (
        <div className="animate-in slide-in-from-top-2 rounded-lg bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-4">
        <StatefulButton
          type="submit"
          loading={isLoading}
          success={success}
          loadingText="Saving..."
          successText="Saved!"
          className="bg-gradient-to-r from-blue-600 to-blue-700"
        >
          Save Changes
        </StatefulButton>
        
        <button
          type="button"
          onClick={() => {
            setIsEditing(false)
            setName(user.name)
            setEmail(user.email)
            setError(null)
          }}
          className="rounded-lg bg-gray-100 px-6 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-200 hover:shadow-md"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}