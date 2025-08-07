import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendInvitationEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const inviter = await db.user.findUnique({
      where: { email: session.user.email },
      include: { family: true },
    })

    if (!inviter) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      if (existingUser.familyId === inviter.familyId) {
        return NextResponse.json({ error: 'User is already a member of your family' }, { status: 400 })
      }
      return NextResponse.json({ error: 'User already exists with another family' }, { status: 400 })
    }

    const existingInvite = await db.emailToken.findFirst({
      where: {
        email,
        type: 'invitation',
        familyId: inviter.familyId,
        expires: {
          gt: new Date(),
        },
      },
    })

    if (existingInvite) {
      return NextResponse.json({ error: 'An invitation has already been sent to this email' }, { status: 400 })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await db.emailToken.create({
      data: {
        email,
        token,
        type: 'invitation',
        expires,
        familyId: inviter.familyId,
        invitedBy: inviter.id,
      },
    })

    const result = await sendInvitationEmail(
      email,
      inviter.name,
      inviter.family.name,
      token
    )

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send invitation email' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Invitation sent successfully' }, { status: 200 })
  } catch (error) {
    console.error('Send invitation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}