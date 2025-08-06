'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, X, Mail, User, Sparkles } from 'lucide-react'
import { StatefulButton, CardSpotlight } from '@/components/ui/aceternity'
import { cn } from '@/lib/aceternity-utils'

interface QuickAddMemberProps {
  familyId: string
  onAdd: (data: { email: string; name: string; familyId: string }) => Promise<{ error?: string; success?: boolean }>
}

export function QuickAddMember({ familyId, onAdd }: QuickAddMemberProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await onAdd({ email, name, familyId })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          setName('')
          setEmail('')
          setIsOpen(false)
          setSuccess(false)
        }, 1500)
      }
    } catch {
      setError('Failed to add family member')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40",
          "flex items-center gap-2",
          "px-5 py-3 rounded-full",
          "bg-gradient-to-r from-purple-600 to-pink-600",
          "text-white font-medium shadow-lg",
          "hover:shadow-xl transition-all duration-200",
          "group"
        )}
      >
        <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">Quick Add Member</span>
        <span className="sm:hidden">Add</span>
        <Sparkles className="w-4 h-4 animate-pulse" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed inset-x-4 bottom-20 sm:inset-x-auto sm:right-6 sm:left-auto sm:w-96 z-50"
            >
              <CardSpotlight className="p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100">
                      <UserPlus className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Add Family Member
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={cn(
                          "w-full pl-10 pr-3 py-2 rounded-lg border",
                          "bg-white dark:bg-neutral-900",
                          "border-gray-200 dark:border-neutral-800",
                          "focus:border-purple-500 dark:focus:border-purple-400",
                          "focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20",
                          "transition-all duration-200",
                          "placeholder:text-gray-400 dark:placeholder:text-neutral-600"
                        )}
                        placeholder="Family member's name"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={cn(
                          "w-full pl-10 pr-3 py-2 rounded-lg border",
                          "bg-white dark:bg-neutral-900",
                          "border-gray-200 dark:border-neutral-800",
                          "focus:border-purple-500 dark:focus:border-purple-400",
                          "focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20",
                          "transition-all duration-200",
                          "placeholder:text-gray-400 dark:placeholder:text-neutral-600"
                        )}
                        placeholder="member@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                    <p className="text-xs text-purple-700">
                      They'll be added to your family budget immediately. You can assign income and expenses right away.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <StatefulButton
                      type="submit"
                      loading={isLoading}
                      success={success}
                      loadingText="Adding..."
                      successText="Added!"
                      className="flex-1"
                      variant="success"
                    >
                      Add Member
                    </StatefulButton>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false)
                        setName('')
                        setEmail('')
                        setError(null)
                      }}
                      className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </CardSpotlight>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}