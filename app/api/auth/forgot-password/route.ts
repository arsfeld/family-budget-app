import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
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
      return NextResponse.json({ message: 'If an account exists, a password reset email has been sent' }, { status: 200 })
    }

    const existingToken = await db.passwordResetToken.findFirst({
      where: {
        email,
        expires: {
          gt: new Date(),
        },
      },
    })

    if (existingToken) {
      return NextResponse.json({ message: 'A password reset email has already been sent. Please check your email.' }, { status: 200 })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await db.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    const result = await sendPasswordResetEmail(email, token)

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ message: 'If an account exists, a password reset email has been sent' }, { status: 200 })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}