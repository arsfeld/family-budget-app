import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { token, name, password } = await request.json()

    if (!token || !name || !password) {
      return NextResponse.json({ error: 'Token, name, and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const invitationToken = await db.emailToken.findUnique({
      where: { token },
    })

    if (!invitationToken || invitationToken.type !== 'invitation') {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 400 })
    }

    if (invitationToken.expires < new Date()) {
      await db.emailToken.delete({
        where: { id: invitationToken.id },
      })
      return NextResponse.json({ error: 'Invitation expired' }, { status: 400 })
    }

    const existingUser = await db.user.findUnique({
      where: { email: invitationToken.email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await db.user.create({
      data: {
        email: invitationToken.email,
        name,
        passwordHash: hashedPassword,
        familyId: invitationToken.familyId!,
        isVerified: true,
        verifiedAt: new Date(),
        invitedBy: invitationToken.invitedBy!,
        invitedAt: invitationToken.createdAt,
      },
    })

    await db.emailToken.delete({
      where: { id: invitationToken.id },
    })

    return NextResponse.json({ 
      message: 'Account created successfully', 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        familyId: user.familyId,
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Accept invitation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}