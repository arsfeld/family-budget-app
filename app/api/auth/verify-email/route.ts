import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const emailToken = await db.emailToken.findUnique({
      where: { token },
    })

    if (!emailToken || emailToken.type !== 'verification') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    if (emailToken.expires < new Date()) {
      await db.emailToken.delete({
        where: { id: emailToken.id },
      })
      return NextResponse.json({ error: 'Token expired' }, { status: 400 })
    }

    const user = await db.user.update({
      where: { email: emailToken.email },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    })

    await db.emailToken.delete({
      where: { id: emailToken.id },
    })

    return NextResponse.json({ message: 'Email verified successfully', user }, { status: 200 })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}