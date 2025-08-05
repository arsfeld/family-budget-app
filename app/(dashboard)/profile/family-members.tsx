'use client'

import { User } from "@prisma/client"
import { useState } from "react"
import { inviteFamilyMember } from "./actions"

interface FamilyMembersProps {
  familyId: string
  familyName: string
  members: User[]
  currentUserId: string
}

export function FamilyMembers({ familyId, familyName, members, currentUserId }: FamilyMembersProps) {
  const [isInviting, setIsInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteName, setInviteName] = useState("")
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
        familyId 
      })
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(`Successfully invited ${inviteName} to your family!`)
        setInviteEmail("")
        setInviteName("")
        setIsInviting(false)
      }
    } catch (err) {
      setError("Failed to invite family member")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-gray-600">Family: <span className="font-medium">{familyName}</span></p>
      </div>

      <div className="space-y-3 mb-6">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-gray-600">{member.email}</p>
            </div>
            <div className="flex items-center gap-3">
              {member.id === currentUserId && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">You</span>
              )}
              <span className={`text-xs px-2 py-1 rounded ${
                member.isVerified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {member.isVerified ? 'Active' : 'Pending'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-lg text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!isInviting ? (
        <button
          onClick={() => setIsInviting(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Invite Family Member
        </button>
      ) : (
        <form onSubmit={handleInvite} className="space-y-4 border-t pt-4">
          <h3 className="font-medium">Invite a Family Member</h3>
          
          <div>
            <label htmlFor="inviteName" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="inviteName"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Partner's name"
              required
            />
          </div>

          <div>
            <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="inviteEmail"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="partner@example.com"
              required
            />
          </div>

          <p className="text-sm text-gray-600">
            They'll receive an email invitation to join your family budget. Until they verify their account, 
            you can still assign income and expenses to them.
          </p>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Sending Invite...' : 'Send Invite'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsInviting(false)
                setInviteEmail("")
                setInviteName("")
                setError(null)
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}