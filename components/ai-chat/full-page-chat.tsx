'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  TrendingUp,
  DollarSign,
  BarChart3,
  Loader2,
  Plus,
  History,
  Trash2,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ToolResult } from './tool-result'
import { usePersistentChat } from '@/lib/hooks/use-persistent-chat'

export function AIChat() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [inputValue, setInputValue] = useState('')
  const [lastError, setLastError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [conversations, setConversations] = useState<any[]>([])
  
  const { 
    messages, 
    sendMessage,
    status, 
    error, 
    stop,
    conversationId,
    isLoading: isLoadingConversation,
    isSaving,
    newConversation,
    loadConversation,
    deleteConversation,
    getConversations,
  } = usePersistentChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Chat error:', error)
      setLastError(error.message || 'Failed to connect to AI service')
    },
  })
  
  // Debug logging for messages only when they actually change
  useEffect(() => {
    console.log('[FullPageChat] Messages updated, count:', messages.length)
    if (messages.length > 0) {
      console.log('[FullPageChat] Last message:', messages[messages.length - 1])
      console.log('[FullPageChat] Full conversation JSON:', JSON.stringify(messages, null, 2))
    }
  }, [messages])
  
  // Monitor status changes
  useEffect(() => {
    console.log('[FullPageChat] Status changed:', status)
  }, [status])
  
  // Monitor errors
  useEffect(() => {
    if (error) {
      console.error('[FullPageChat] Error from useChat:', error)
    }
  }, [error])
  
  const isLoading = status === 'streaming'
  
  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    
    setLastError(null)
    const messageToSend = inputValue
    setInputValue('') // Clear input immediately
    
    try {
      console.log('Submitting message:', messageToSend)
      console.log('Current status:', status)
      
      // Use append with the correct format for AI SDK v5
      await sendMessage({ 
        role: 'user',
        content: messageToSend 
      })
      
      console.log('Message submitted')
    } catch (err: any) {
      console.error('Failed to send message:', err)
      setLastError(err?.message || 'Failed to send message')
      setInputValue(messageToSend) // Restore input on error
    }
  }
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const handleQuickAction = async (prompt: string) => {
    if (isLoading) return
    setLastError(null)
    
    try {
      // Use append with the correct format for quick actions
      await sendMessage({ 
        role: 'user',
        content: prompt
      })
    } catch (err: any) {
      console.error('Failed to send quick action:', err)
      setLastError(err?.message || 'Failed to send message')
    }
  }
  
  const quickActions = [
    { icon: BarChart3, text: "Show budget overview", prompt: "What's my current budget overview?" },
    { icon: DollarSign, text: "Add an expense", prompt: "I want to add a new expense" },
    { icon: TrendingUp, text: "Compare scenarios", prompt: "Compare my budget scenarios" },
  ]
  
  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b dark:border-gray-800 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Bot size={24} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold flex items-center gap-2">
                AI Budget Assistant
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">AI Powered</span>
              </h1>
              <p className="text-sm opacity-90">Ask me anything about your finances</p>
            </div>
            <div className="flex items-center gap-2">
              {/* New Chat Button */}
              <button
                onClick={async () => {
                  await newConversation()
                  setShowHistory(false)
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="New conversation"
              >
                <Plus size={18} />
              </button>
              
              {/* History Button */}
              <button
                onClick={async () => {
                  const convs = await getConversations(10, false)
                  setConversations(convs)
                  setShowHistory(!showHistory)
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Chat history"
              >
                <History size={18} />
              </button>
              
              {/* Status Indicator */}
              <div className="flex items-center gap-2 ml-2">
                <div className={`w-2 h-2 rounded-full ${
                  error ? 'bg-red-400' : 
                  isLoadingConversation ? 'bg-blue-400 animate-pulse' :
                  isSaving ? 'bg-yellow-400 animate-pulse' :
                  isLoading ? 'bg-yellow-400 animate-pulse' : 
                  'bg-green-400'
                }`} />
                <span className="text-xs opacity-75 whitespace-nowrap">
                  {isLoadingConversation ? 'Loading...' : 
                   isSaving ? 'Saving...' : 
                   isLoading ? 'Processing...' : 
                   error ? 'Error' : 'Ready'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
          >
            <div className="p-4 max-h-64 overflow-y-auto">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Recent Conversations</div>
              {conversations.length === 0 ? (
                <div className="text-sm text-gray-400 italic">No conversations yet</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors border",
                        conv.id === conversationId 
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                          : "border-gray-200 dark:border-gray-700"
                      )}
                      onClick={() => {
                        loadConversation(conv.id)
                        setShowHistory(false)
                      }}
                    >
                      <MessageSquare size={16} className="text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {conv.title || 'Untitled conversation'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(conv.lastMessageAt).toLocaleDateString()}
                        </div>
                      </div>
                      {conv.id === conversationId && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                      )}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          if (confirm('Delete this conversation?')) {
                            await deleteConversation(conv.id)
                            const convs = await getConversations(10, false)
                            setConversations(convs)
                          }
                        }}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors flex-shrink-0"
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto p-6 space-y-4">
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-12"
            >
              <div className="inline-flex p-4 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl mb-6">
                <Bot size={64} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Welcome to your AI Budget Assistant!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                I can help you manage income, track expenses, analyze your budget, and provide financial insights. How can I assist you today?
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleQuickAction(action.prompt)}
                    disabled={isLoading}
                    className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white dark:bg-gray-800 hover:shadow-lg transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-lg group-hover:scale-110 transition-transform">
                      <action.icon size={24} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {action.text}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          
          {messages.map((message, index) => (
            <Message key={message.id} message={message} index={index} />
          ))}
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-gray-500 dark:text-gray-400"
            >
              <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                <Bot size={20} />
              </div>
              <div className="flex gap-1">
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                />
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                />
              </div>
            </motion.div>
          )}
          
          {(error || lastError) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <div className="flex-1">
                  <p className="font-medium">Connection Error</p>
                  <p className="text-sm mt-1 opacity-75">{lastError || error?.message || 'Failed to connect to AI service'}</p>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => {
                        setLastError(null)
                        if (inputValue) {
                          onFormSubmit(new Event('submit') as any)
                        }
                      }}
                      className="text-sm underline hover:no-underline"
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-sm underline hover:no-underline"
                    >
                      Refresh page
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      <div className="border-t dark:border-gray-800 bg-white dark:bg-gray-900">
        <form onSubmit={onFormSubmit} className="max-w-4xl mx-auto p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isLoading ? "Please wait..." : "Ask me about your budget..."}
              className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              autoFocus
            />
            {isLoading ? (
              <button
                type="button"
                onClick={() => stop?.()}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Loader2 size={20} className="animate-spin" />
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputValue?.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <Send size={20} />
                Send
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Powered by AI • Your data stays private and secure
          </p>
        </form>
      </div>
    </div>
  )
}

function Message({ message, index }: { message: any; index: number }) {
  const isUser = message.role === 'user'
  
  // AI SDK v5: Messages have parts array with text content
  const textContent = message.parts
    ? message.parts
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('')
    : message.content || ''
  
  // Check if message has tool results
  const toolParts = message.parts?.filter((part: any) => 
    part.type !== 'text' && part.type.startsWith('tool-')
  ) || []
  
  // If assistant message has only tool results and no text, don't render empty bubble
  if (!isUser && !textContent && toolParts.length === 0) {
    return null
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn('flex gap-3', isUser && 'flex-row-reverse')}
    >
      <div className={cn(
        'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
        isUser 
          ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white' 
          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
      )}>
        {isUser ? <User size={20} /> : <Bot size={20} />}
      </div>
      
      <div className={cn(
        'flex-1',
        isUser && 'max-w-[80%]'
      )}>
        {/* Only show text bubble if there's text content */}
        {textContent && (
          <div className={cn(
            'px-4 py-3 rounded-2xl mb-2',
            isUser 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm'
          )}>
            <div className={cn(
              'text-sm leading-relaxed',
              isUser && 'text-white'
            )}>
              {textContent}
            </div>
          </div>
        )}
        
        {/* Tool Results - handle parts that are tool calls */}
        {toolParts.map((part: any, i: number) => (
          <ToolResult key={i} invocation={part} />
        ))}
      </div>
    </motion.div>
  )
}