import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/chat/conversations/[id] - Get a specific conversation
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const conversation = await db.chatConversation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(conversation)
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    )
  }
}

// PATCH /api/chat/conversations/[id] - Update a conversation
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { messages, title, metadata, isActive } = await req.json()
    
    // If setting as active, deactivate others first
    if (isActive === true) {
      await db.chatConversation.updateMany({
        where: {
          userId: session.user.id,
          isActive: true,
          NOT: { id: params.id },
        },
        data: {
          isActive: false,
        },
      })
    }
    
    // Update the conversation
    const conversation = await db.chatConversation.updateMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        ...(messages !== undefined && { messages }),
        ...(title !== undefined && { title }),
        ...(metadata !== undefined && { metadata }),
        ...(isActive !== undefined && { isActive }),
        lastMessageAt: new Date(),
      },
    })
    
    if (conversation.count === 0) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }
    
    // Return the updated conversation
    const updated = await db.chatConversation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })
    
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    )
  }
}

// DELETE /api/chat/conversations/[id] - Delete a specific conversation
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const deleted = await db.chatConversation.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })
    
    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    )
  }
}