import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.isVerified) {
      return NextResponse.json({ message: 'Email already verified' }, { status: 200 })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await db.verificationToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    const result = await sendVerificationEmail(email, token)

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Verification email sent' }, { status: 200 })
  } catch (error) {
    console.error('Send verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}