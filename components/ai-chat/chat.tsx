'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  X, 
  MessageSquare, 
  Sparkles,
  TrendingUp,
  DollarSign,
  BarChart3,
  Plus,
  History,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ToolResult } from './tool-result'
import { usePersistentChat } from '@/lib/hooks/use-persistent-chat'

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [isSending, setIsSending] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [conversations, setConversations] = useState<any[]>([])
  
  const { 
    messages, 
    append, 
    status, 
    error, 
    stop, 
    input, 
    handleInputChange, 
    handleSubmit,
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
      setIsSending(false)
    },
  })
  
  // Debug logging for messages
  useEffect(() => {
    console.log('Messages updated:', messages)
    console.log('Messages count:', messages.length)
    if (messages.length > 0) {
      console.log('Last message:', messages[messages.length - 1])
    }
  }, [messages])
  
  const isLoading = status === 'streaming' || isSending
  
  // Get human-readable status
  const getStatusText = () => {
    if (isSending && status !== 'streaming') return 'Sending message...'
    if (status === 'streaming') return 'AI is thinking...'
    if (error) return 'Error occurred'
    if (messages.length === 0) return 'Ready to chat'
    return 'Waiting for your message'
  }
  
  const getStatusColor = () => {
    if (error) return 'text-red-500'
    if (isLoading) return 'text-blue-500'
    return 'text-green-500'
  }
  
  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    setIsSending(true)
    setLastError(null)
    
    try {
      console.log('Sending message:', input)
      console.log('Current status:', status)
      console.log('Current messages before send:', messages)
      
      // Use the built-in handleSubmit
      handleSubmit(e)
      
      console.log('Message sent successfully')
      console.log('New status:', status)
    } catch (err: any) {
      console.error('Failed to send message:', err)
      setLastError(err?.message || 'Failed to send message')
      setIsSending(false)
    }
  }
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const handleQuickAction = async (prompt: string) => {
    try {
      setLastError(null)
      // Send the quick action message using append
      await append({ 
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
    <>
      {/* Floating Chat Button */}
      <motion.button
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg z-50 hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open AI assistant"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: 0 }}
              animate={{ rotate: 90 }}
              exit={{ rotate: 0 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="relative"
            >
              <MessageSquare size={24} />
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <Sparkles size={12} className="text-yellow-300" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800"
          >
            {/* Header */}
            <div className="relative p-4 border-b dark:border-gray-800 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Bot size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold flex items-center gap-2">
                    Budget Assistant
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">AI</span>
                  </h3>
                  <p className="text-sm opacity-90">Ask me about your finances</p>
                </div>
                <div className="flex items-center gap-1">
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
                      {isSaving ? 'Saving...' : getStatusText()}
                    </span>
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
                  <div className="p-3 max-h-48 overflow-y-auto">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Recent Conversations</div>
                    {conversations.length === 0 ? (
                      <div className="text-sm text-gray-400 italic">No conversations yet</div>
                    ) : (
                      <div className="space-y-1">
                        {conversations.map((conv) => (
                          <div
                            key={conv.id}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors",
                              conv.id === conversationId && "bg-purple-100 dark:bg-purple-900/30"
                            )}
                            onClick={() => {
                              loadConversation(conv.id)
                              setShowHistory(false)
                            }}
                          >
                            <MessageSquare size={14} className="text-gray-400" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm truncate">
                                {conv.title || 'Untitled conversation'}
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(conv.lastMessageAt).toLocaleDateString()}
                              </div>
                            </div>
                            {conv.id === conversationId && (
                              <div className="w-2 h-2 bg-purple-500 rounded-full" />
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
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
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
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
              {messages.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-8"
                >
                  <div className="inline-flex p-4 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl mb-4">
                    <Bot size={48} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Hi! I&apos;m your AI budget assistant. I can help you manage income, expenses, and analyze your financial scenarios.
                  </p>
                  <div className="space-y-2">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleQuickAction(action.prompt)}
                        className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors group"
                      >
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-lg group-hover:scale-110 transition-transform">
                          <action.icon size={16} />
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
                    <Bot size={16} />
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
                  className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm">⚠️</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Connection Error</p>
                      <p className="text-xs mt-1 opacity-75">{lastError || error?.message || 'Failed to connect to AI service'}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            setLastError(null)
                            if (input) {
                              // Create and dispatch a synthetic form submit event
                              const form = document.querySelector('form') as HTMLFormElement
                              if (form) {
                                form.requestSubmit()
                              }
                            }
                          }}
                          className="text-xs underline hover:no-underline"
                        >
                          Retry
                        </button>
                        <button
                          onClick={() => window.location.reload()}
                          className="text-xs underline hover:no-underline"
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
            
            {/* Input */}
            <form 
              onSubmit={onFormSubmit} 
              className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900"
            >
              {/* Status bar */}
              {isLoading && (
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex gap-1">
                    <motion.div
                      className="w-1 h-1 bg-blue-500 rounded-full"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div
                      className="w-1 h-1 bg-blue-500 rounded-full"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-1 h-1 bg-blue-500 rounded-full"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                  <span>{isSending ? 'Sending...' : 'AI is processing...'}</span>
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder={isLoading ? "Please wait..." : "Ask about your budget..."}
                  className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  autoFocus
                />
                {isLoading ? (
                  <button
                    type="button"
                    onClick={() => stop?.()}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input?.trim() || isLoading}
                    className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send size={20} />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Powered by AI • Your data stays private
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Message({ message, index }: { message: any; index: number }) {
  const isUser = message.role === 'user'
  
  // Get message content - check for parts array or direct content
  const textContent = message.parts
    ? message.parts
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('')
    : message.content || ''
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn('flex gap-3', isUser && 'flex-row-reverse')}
    >
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
        isUser 
          ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white' 
          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
      )}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      <div className={cn(
        'flex-1 px-4 py-3 rounded-2xl max-w-[85%]',
        isUser 
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm'
      )}>
        {/* Show text content if available */}
        {textContent && (
          <div className={cn(
            'text-sm leading-relaxed',
            isUser && 'text-white'
          )}>
            {textContent}
          </div>
        )}
        
        {/* Tool Results - handle parts that are tool calls */}
        {message.parts?.map((part: any, i: number) => {
          // Handle tool results
          if (part.type && part.type.startsWith('tool-')) {
            return <ToolResult key={i} invocation={part} />
          }
          // Skip non-display parts
          if (part.type === 'step-start' || part.type === 'step-finish') {
            return null
          }
          return null
        })}
      </div>
    </motion.div>
  )
}