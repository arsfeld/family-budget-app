import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    if (resetToken.expires < new Date()) {
      await db.passwordResetToken.delete({
        where: { id: resetToken.id },
      })
      return NextResponse.json({ error: 'Token expired' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.user.update({
      where: { email: resetToken.email },
      data: {
        passwordHash: hashedPassword,
      },
    })

    await db.passwordResetToken.delete({
      where: { id: resetToken.id },
    })

    return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}