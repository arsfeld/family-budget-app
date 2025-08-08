'use client'

import { useChat } from '@ai-sdk/react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { UIMessage, DefaultChatTransport } from 'ai'
import { useDebounce } from './use-debounce'

interface PersistentChatOptions {
  api?: string
  onError?: (error: Error) => void
  autoSave?: boolean
  saveDelay?: number
}

interface ChatConversation {
  id: string
  title: string | null
  messages: any
  metadata: any
  isActive: boolean
  lastMessageAt: string
  createdAt: string
  updatedAt: string
}

export function usePersistentChat(options: PersistentChatOptions = {}) {
  const {
    api = '/api/chat',
    onError,
    autoSave = true,
    saveDelay = 2000,
  } = options

  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([])
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const lastSavedMessagesRef = useRef<string>('')
  const hasLoadedRef = useRef(false)

  // Use the regular useChat hook with transport for AI SDK v5
  const chatProps = useChat({
    transport: new DefaultChatTransport({
      api,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
    id: conversationId || undefined,
    initialMessages,
    onError: (error) => {
      console.error('[PersistentChat] Chat error:', error)
      onError?.(error)
    },
    onFinish: (result) => {
      console.log('[PersistentChat] Message finished:', result)
      // Manually add the assistant message if it's not being added automatically
      if (result.message && result.message.role === 'assistant') {
        setLocalMessages(prev => {
          // Check if message already exists
          const exists = prev.some(m => m.id === result.message.id)
          if (!exists) {
            console.log('[PersistentChat] Manually adding assistant message')
            return [...prev, result.message]
          }
          return prev
        })
      }
    },
    maxSteps: 5, // Allow for tool calls
  })

  const { messages: chatMessages, setMessages, sendMessage: originalSendMessage, status } = chatProps
  
  // Use local state for messages since useChat isn't managing them properly
  const [messages, setLocalMessages] = useState<UIMessage[]>(initialMessages)
  
  // Log available functions for debugging (only once)
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('[PersistentChat] Available functions from useChat:', Object.keys(chatProps))
      console.log('[PersistentChat] Initial messages:', messages)
    }
  }, []) // Empty deps to run only once
  
  // Log messages when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && messages.length > 0) {
      console.log('[PersistentChat] Messages updated:', messages)
    }
  }, [messages])
  
  // Create sendMessage wrapper for compatibility
  const sendMessage = useCallback(async (message: { role?: string; content: string } | { text: string }) => {
    console.log('[PersistentChat] sendMessage called with:', message)
    console.log('[PersistentChat] originalSendMessage available:', !!originalSendMessage)
    console.log('[PersistentChat] Current messages before send:', messages.length)
    console.log('[PersistentChat] Current status:', status)
    
    if (!originalSendMessage) {
      console.error('[PersistentChat] sendMessage function not available from useChat')
      return
    }
    
    try {
      // First, manually add the user message
      const userMessage = {
        id: Math.random().toString(36).substring(7),
        role: 'user' as const,
        parts: [{ 
          type: 'text' as const, 
          text: 'text' in message ? message.text : message.content 
        }]
      }
      
      setLocalMessages(prev => {
        console.log('[PersistentChat] Adding user message manually')
        return [...prev, userMessage]
      })
      
      // For AI SDK v5, sendMessage expects specific format
      let result
      if ('text' in message) {
        console.log('[PersistentChat] Sending with text format:', message.text)
        // Try the documented format for sendMessage
        result = originalSendMessage({ text: message.text })
      } else {
        console.log('[PersistentChat] Sending with content:', message.content)
        result = originalSendMessage({ text: message.content })
      }
      
      // Don't await - sendMessage returns void and triggers async operation
      console.log('[PersistentChat] Send initiated')
      console.log('[PersistentChat] Current messages after send:', messages.length)
      console.log('[PersistentChat] Status after send:', status)
      return result
    } catch (error) {
      console.error('[PersistentChat] Error sending message:', error)
      throw error
    }
  }, [originalSendMessage, messages.length, status])

  // Debounced messages for auto-saving
  const debouncedMessages = useDebounce(messages, saveDelay)

  // Save current conversation
  const saveConversation = async () => {
    if (!conversationId || messages.length === 0) {
      console.log('[PersistentChat] Skipping save - no conversation ID or messages')
      return
    }
    
    const messagesString = JSON.stringify(messages)
    if (messagesString === lastSavedMessagesRef.current) {
      console.log('[PersistentChat] Skipping save - no changes')
      return // No changes to save
    }

    console.log('[PersistentChat] Saving conversation:', conversationId)

    try {
      setIsSaving(true)
      
      // Generate title from first user message if not set
      const firstUserMessage = messages.find(m => m.role === 'user')
      // Extract text from parts array if it exists, otherwise use content
      let titleText = 'New conversation'
      if (firstUserMessage) {
        if (firstUserMessage.parts && Array.isArray(firstUserMessage.parts)) {
          const textPart = firstUserMessage.parts.find((p: any) => p.type === 'text')
          titleText = textPart?.text?.slice(0, 100) || 'New conversation'
        } else if (typeof firstUserMessage.content === 'string') {
          titleText = firstUserMessage.content.slice(0, 100)
        }
      }
      const title = titleText
      
      const response = await fetch(`/api/chat/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          title,
          metadata: {
            messageCount: messages.length,
            lastModel: 'gpt-4o-mini', // You can extract this from the actual response
          },
        }),
      })
      
      if (response.ok) {
        lastSavedMessagesRef.current = messagesString
        console.log('[PersistentChat] Conversation saved successfully')
      } else {
        const errorText = await response.text()
        console.error('[PersistentChat] Failed to save conversation:', response.status, errorText)
      }
    } catch (error) {
      console.error('[PersistentChat] Error saving conversation:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Create a conversation for existing messages
  const createConversationForMessages = async () => {
    if (messages.length === 0) return
    
    console.log('[PersistentChat] Creating conversation for existing messages')
    
    try {
      const firstUserMessage = messages.find(m => m.role === 'user')
      // Extract text from parts array if it exists, otherwise use content
      let titleText = 'New conversation'
      if (firstUserMessage) {
        if (firstUserMessage.parts && Array.isArray(firstUserMessage.parts)) {
          const textPart = firstUserMessage.parts.find((p: any) => p.type === 'text')
          titleText = textPart?.text?.slice(0, 100) || 'New conversation'
        } else if (typeof firstUserMessage.content === 'string') {
          titleText = firstUserMessage.content.slice(0, 100)
        }
      }
      const title = titleText
      
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          title,
          metadata: {
            messageCount: messages.length,
          },
        }),
      })
      
      if (response.ok) {
        const conversation = await response.json()
        console.log('[PersistentChat] Conversation created successfully:', conversation)
        setConversationId(conversation.id)
        lastSavedMessagesRef.current = JSON.stringify(messages)
      } else {
        const errorText = await response.text()
        console.error('[PersistentChat] Failed to create conversation:', response.status, errorText)
      }
    } catch (error) {
      console.error('[PersistentChat] Error creating conversation:', error)
    }
  }

  // Load the active conversation
  const loadActiveConversation = async () => {
    try {
      setIsLoading(true)
      console.log('[PersistentChat] Fetching active conversation...')
      const response = await fetch('/api/chat/conversations/active')
      
      if (response.ok) {
        const conversation = await response.json()
        console.log('[PersistentChat] Active conversation response:', conversation)
        
        if (conversation) {
          setConversationId(conversation.id)
          if (conversation.messages && Array.isArray(conversation.messages)) {
            // Restore messages
            console.log('[PersistentChat] Restoring messages:', conversation.messages.length)
            setLocalMessages(conversation.messages as UIMessage[])
            lastSavedMessagesRef.current = JSON.stringify(conversation.messages)
          }
        } else {
          console.log('[PersistentChat] No active conversation found')
        }
      } else {
        console.log('[PersistentChat] Failed to fetch active conversation:', response.status)
      }
    } catch (error) {
      console.error('[PersistentChat] Error loading conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load active conversation on mount - only once
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true
      console.log('[PersistentChat] Loading active conversation on mount')
      loadActiveConversation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-save messages when they change (debounced)
  useEffect(() => {
    // Skip if not auto-saving or no messages
    if (!autoSave || debouncedMessages.length === 0) {
      return
    }

    // Check if messages have actually changed
    const messagesString = JSON.stringify(debouncedMessages)
    if (messagesString === lastSavedMessagesRef.current) {
      return
    }

    console.log('[PersistentChat] Messages changed, need to save:', {
      hasConversationId: !!conversationId,
      messageCount: debouncedMessages.length
    })
    
    // If no conversation ID exists yet, create one
    if (!conversationId) {
      console.log('[PersistentChat] No conversation ID, creating new conversation...')
      createConversationForMessages()
    } else {
      console.log('[PersistentChat] Saving to existing conversation:', conversationId)
      saveConversation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMessages, conversationId, autoSave])

  // Create a new conversation
  const newConversation = async () => {
    try {
      console.log('[PersistentChat] Creating new conversation...')
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [],
          title: 'New conversation',
        }),
      })
      
      if (response.ok) {
        const conversation = await response.json()
        console.log('[PersistentChat] New conversation created:', conversation.id)
        setConversationId(conversation.id)
        setLocalMessages([]) // Use local setter instead of setMessages
        lastSavedMessagesRef.current = '[]'
        return conversation
      } else {
        console.error('[PersistentChat] Failed to create new conversation:', response.status)
      }
    } catch (error) {
      console.error('[PersistentChat] Error creating conversation:', error)
    }
  }

  // Load a specific conversation
  const loadConversation = async (id: string) => {
    try {
      setIsLoading(true)
      
      // First, set it as active
      await fetch(`/api/chat/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      })
      
      // Then load it
      const response = await fetch(`/api/chat/conversations/${id}`)
      
      if (response.ok) {
        const conversation = await response.json()
        setConversationId(conversation.id)
        if (conversation.messages && Array.isArray(conversation.messages)) {
          setLocalMessages(conversation.messages as UIMessage[])
          lastSavedMessagesRef.current = JSON.stringify(conversation.messages)
        }
        return conversation
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a conversation
  const deleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/chat/conversations/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        if (id === conversationId) {
          // If deleting current conversation, create a new one
          await newConversation()
        }
        return true
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
    return false
  }

  // Get list of conversations
  const getConversations = async (limit = 10, includeMessages = false) => {
    try {
      const response = await fetch(
        `/api/chat/conversations?limit=${limit}&includeMessages=${includeMessages}`
      )
      
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
    return []
  }

  return {
    ...chatProps,
    messages, // Override with our local messages state
    setMessages: setLocalMessages, // Override with local setter
    sendMessage, // Use our custom wrapper
    conversationId,
    isLoading,
    isSaving,
    newConversation,
    loadConversation,
    deleteConversation,
    getConversations,
    saveConversation,
  }
}