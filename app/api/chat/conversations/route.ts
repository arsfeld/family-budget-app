import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/chat/conversations - Get all chat conversations for the user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get URL params
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const includeMessages = searchParams.get('includeMessages') === 'true'
    
    // Fetch conversations
    const conversations = await db.chatConversation.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        isActive: true,
        lastMessageAt: true,
        createdAt: true,
        messages: includeMessages,
        metadata: true,
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
      take: limit,
    })
    
    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

// POST /api/chat/conversations - Create a new conversation
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { messages, title, metadata } = await req.json()
    
    // Deactivate any existing active conversation
    await db.chatConversation.updateMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    })
    
    // Create new conversation
    const conversation = await db.chatConversation.create({
      data: {
        userId: session.user.id,
        familyId: session.user.familyId,
        title: title || 'New conversation',
        messages: messages || [],
        metadata: metadata || {},
        isActive: true,
        lastMessageAt: new Date(),
      },
    })
    
    return NextResponse.json(conversation)
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}

// DELETE /api/chat/conversations - Delete a conversation
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('id')
    
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID required' },
        { status: 400 }
      )
    }
    
    // Delete the conversation (only if it belongs to the user)
    const deleted = await db.chatConversation.deleteMany({
      where: {
        id: conversationId,
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