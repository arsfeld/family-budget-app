import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    if (verificationToken.expires < new Date()) {
      await db.verificationToken.delete({
        where: { id: verificationToken.id },
      })
      return NextResponse.json({ error: 'Token expired' }, { status: 400 })
    }

    const user = await db.user.update({
      where: { email: verificationToken.email },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    })

    await db.verificationToken.delete({
      where: { id: verificationToken.id },
    })

    return NextResponse.json({ message: 'Email verified successfully', user }, { status: 200 })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}