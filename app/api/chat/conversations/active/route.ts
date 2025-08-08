import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/chat/conversations/active - Get the active conversation
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get the active conversation
    const conversation = await db.chatConversation.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    })
    
    // If no active conversation, get the most recent one
    if (!conversation) {
      const mostRecent = await db.chatConversation.findFirst({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          lastMessageAt: 'desc',
        },
      })
      
      if (mostRecent) {
        // Mark it as active
        await db.chatConversation.update({
          where: { id: mostRecent.id },
          data: { isActive: true },
        })
        
        return NextResponse.json(mostRecent)
      }
    }
    
    return NextResponse.json(conversation)
  } catch (error) {
    console.error('Error fetching active conversation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch active conversation' },
      { status: 500 }
    )
  }
}