'use client'

import { User } from '@prisma/client'
import { useState } from 'react'
import { inviteFamilyMember } from './actions'
import { StatefulButton, CardSpotlight, AnimatedTooltip } from '@/components/ui/aceternity'

interface FamilyMembersProps {
  familyId: string
  familyName: string
  members: User[]
  currentUserId: string
}

export function FamilyMembers({
  familyId,
  familyName,
  members,
  currentUserId,
}: FamilyMembersProps) {
  const [isInviting, setIsInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await inviteFamilyMember({
        email: inviteEmail,
        name: inviteName,
        familyId,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(`Successfully invited ${inviteName} to your family!`)
        setInviteEmail('')
        setInviteName('')
        setIsInviting(false)
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch {
      setError('Failed to invite family member')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
        <p className="text-sm text-gray-600">
          Family Name
        </p>
        <p className="mt-1 text-lg font-semibold text-gray-900">
          {familyName}
        </p>
      </div>

      <div className="mb-6 space-y-3">
        <h3 className="mb-3 text-sm font-medium text-gray-700">Current Members</h3>
        {members.map((member) => (
          <CardSpotlight
            key={member.id}
            className="group transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                  <span className="text-lg font-semibold">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {member.id === currentUserId && (
                  <span className="rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1 text-xs font-semibold text-blue-800">
                    You
                  </span>
                )}
                {member.isVerified ? (
                  <AnimatedTooltip content="Account verified and active">
                    <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1 text-xs font-semibold text-green-800">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Active
                    </span>
                  </AnimatedTooltip>
                ) : (
                  <AnimatedTooltip content="Invitation sent - awaiting verification">
                    <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                      <svg className="h-3 w-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Pending
                    </span>
                  </AnimatedTooltip>
                )}
              </div>
            </div>
          </CardSpotlight>
        ))}
      </div>

      {success && (
        <div className="animate-in slide-in-from-top-2 mb-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="animate-in slide-in-from-top-2 mb-4 rounded-lg bg-red-50 p-4">
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

      {!isInviting ? (
        <div className="mt-6">
          <StatefulButton
            onClick={() => setIsInviting(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700"
          >
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Invite Family Member
            </span>
          </StatefulButton>
        </div>
      ) : (
        <CardSpotlight className="mt-6 border-2 border-dashed border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50">
          <form onSubmit={handleInvite} className="space-y-4 p-6">
            <h3 className="text-lg font-medium text-gray-900">
              Invite a Family Member
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="inviteName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="inviteName"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Family member's name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="inviteEmail"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="inviteEmail"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="member@example.com"
                  required
                />
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> They'll receive an email invitation to join your family budget.
                Until they verify their account, you can still assign income and
                expenses to them.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <StatefulButton
                type="submit"
                loading={isLoading}
                loadingText="Sending Invite..."
                className="bg-gradient-to-r from-green-600 to-green-700"
              >
                Send Invite
              </StatefulButton>
              
              <button
                type="button"
                onClick={() => {
                  setIsInviting(false)
                  setInviteEmail('')
                  setInviteName('')
                  setError(null)
                }}
                className="rounded-lg bg-gray-100 px-6 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-200 hover:shadow-md"
              >
                Cancel
              </button>
            </div>
          </form>
        </CardSpotlight>
      )}
    </div>
  )
}