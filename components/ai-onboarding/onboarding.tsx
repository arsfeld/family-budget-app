'use client'

import { useState, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  Check,
  Home,
  DollarSign,
  Users,
  Target,
  TrendingUp,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const ONBOARDING_STAGES = [
  { id: 'welcome', label: 'Welcome', icon: Sparkles },
  { id: 'family_composition', label: 'Family', icon: Users },
  { id: 'income_sources', label: 'Income', icon: DollarSign },
  { id: 'housing_expenses', label: 'Housing', icon: Home },
  { id: 'regular_expenses', label: 'Expenses', icon: TrendingUp },
  { id: 'investments_savings', label: 'Savings', icon: Target },
  { id: 'financial_goals', label: 'Goals', icon: Target },
  { id: 'budget_creation', label: 'Create Budget', icon: Check },
]

interface OnboardingProps {
  onComplete?: () => void
  onSkip?: () => void
}

export function AIOnboarding({ onComplete, onSkip }: OnboardingProps) {
  const router = useRouter()
  const [currentStage, setCurrentStage] = useState(0)
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/onboarding',
    body: {
      stage: ONBOARDING_STAGES[currentStage].id
    },
    onFinish: () => {
      // Check if we should advance to the next stage
      if (currentStage === ONBOARDING_STAGES.length - 1) {
        // Onboarding complete
        setTimeout(() => {
          if (onComplete) {
            onComplete()
          } else {
            router.push('/dashboard')
          }
        }, 2000)
      }
    },
    onError: (error) => {
      console.error('Onboarding error:', error)
    }
  })
  
  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      append({
        role: 'assistant',
        content: "Welcome! I&apos;m here to help you set up your family budget in just a few minutes. This will be quick and easy, I promise! Let&apos;s start with something simple - what should I call your family?"
      })
    }
  }, [])
  
  const handleResponse = async (response: string) => {
    await append({
      role: 'user',
      content: response
    })
    
    // Progress to next stage after user responds
    if (currentStage < ONBOARDING_STAGES.length - 1) {
      setTimeout(() => setCurrentStage(prev => prev + 1), 1500)
    }
  }
  
  const handleQuickResponse = (response: string) => {
    handleResponse(response)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Let's Set Up Your Budget
            </h1>
            {onSkip && (
              <button
                onClick={onSkip}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Skip for now
              </button>
            )}
          </div>
          
          {/* Progress Bar */}
          <ProgressBar current={currentStage} stages={ONBOARDING_STAGES} />
        </div>
        
        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6"
        >
          {/* Messages */}
          <div className="h-[400px] overflow-y-auto mb-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <OnboardingMessage
                  key={message.id}
                  message={message}
                  isLatest={index === messages.length - 1}
                />
              ))}
            </AnimatePresence>
            
            {isLoading && <TypingIndicator />}
          </div>
          
          {/* Quick Response Buttons */}
          <QuickResponseButtons
            stage={ONBOARDING_STAGES[currentStage].id}
            onSelect={handleQuickResponse}
            disabled={isLoading}
          />
          
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Type your answer..."
                className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

function ProgressBar({ current, stages }: { current: number; stages: typeof ONBOARDING_STAGES }) {
  return (
    <div className="flex items-center justify-between">
      {stages.map((stage, index) => {
        const Icon = stage.icon
        const isActive = index === current
        const isCompleted = index < current
        
        return (
          <div key={stage.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isCompleted ? '#10b981' : isActive ? '#8b5cf6' : '#e5e7eb'
                }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  isCompleted && "bg-green-500 text-white",
                  isActive && "bg-purple-600 text-white",
                  !isCompleted && !isActive && "bg-gray-200 text-gray-400"
                )}
              >
                {isCompleted ? (
                  <Check size={20} />
                ) : (
                  <Icon size={20} />
                )}
              </motion.div>
              <span className={cn(
                "text-xs mt-1",
                isActive && "font-semibold text-purple-600",
                isCompleted && "text-green-600",
                !isActive && !isCompleted && "text-gray-400"
              )}>
                {stage.label}
              </span>
            </div>
            {index < stages.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mt-[-20px]">
                <div className={cn(
                  "h-full transition-colors",
                  isCompleted ? "bg-green-500" : "bg-gray-200"
                )} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function OnboardingMessage({ message }: { message: any }) {
  const isUser = message.role === 'user'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn('flex gap-3', isUser && 'flex-row-reverse')}
    >
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser ? 'bg-purple-600 text-white' : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
      )}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      <div className={cn(
        'flex-1 px-4 py-3 rounded-2xl max-w-[80%]',
        isUser
          ? 'bg-purple-600 text-white'
          : 'bg-gray-100 dark:bg-gray-800'
      )}>
        <div className="text-sm">
          {message.content}
        </div>
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center">
        <Bot size={16} />
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl">
        <div className="flex gap-1">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
            className="w-2 h-2 bg-gray-400 rounded-full"
          />
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
            className="w-2 h-2 bg-gray-400 rounded-full"
          />
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
            className="w-2 h-2 bg-gray-400 rounded-full"
          />
        </div>
      </div>
    </div>
  )
}

function QuickResponseButtons({ 
  stage, 
  onSelect, 
  disabled 
}: { 
  stage: string
  onSelect: (response: string) => void
  disabled: boolean 
}) {
  const suggestions = getQuickResponsesForStage(stage)
  
  if (suggestions.length === 0) return null
  
  return (
    <div className="mb-4">
      <p className="text-xs text-gray-500 mb-2">Quick responses:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            disabled={disabled}
            className="px-3 py-1.5 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-400"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

function getQuickResponsesForStage(stage: string): string[] {
  switch (stage) {
    case 'welcome':
      return ['The Smith Family', 'The Johnson Family', 'Just call us by our first names']
    case 'family_composition':
      return ['2 adults, no kids', '2 adults, 2 kids', '1 adult, 1 child', '2 adults, 3 kids']
    case 'income_sources':
      return ['$5,000/month', '$8,000/month', '$3,500/month', 'We have multiple income sources']
    case 'housing_expenses':
      return ['Renting - $1,500/month', 'Mortgage - $2,000/month', 'Own our home outright']
    case 'regular_expenses':
      return ['About $2,000/month total', 'Utilities $300, Food $800, Transport $400', 'I need help estimating']
    case 'investments_savings':
      return ['Yes, $500/month', 'Not currently', 'Some investments', 'Planning to start']
    case 'financial_goals':
      return ['Emergency fund', 'Retirement', 'Kids education', 'Buy a home', 'Pay off debt']
    case 'budget_creation':
      return ['Yes, create my budget!', 'Let me review first', 'Can you summarize again?']
    default:
      return []
  }
}