'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { CardSpotlight } from '@/components/ui/aceternity/card-spotlight'
import { StatefulButton } from '@/components/ui/aceternity/stateful-button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, Lock, AlertCircle, UserPlus } from 'lucide-react'
import { cn } from '@/lib/aceternity-utils'

function AcceptInviteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Automatically sign in the user after successful account creation
        const signInResult = await signIn('credentials', {
          email: data.user.email,
          password: password,
          redirect: false,
        })

        if (signInResult?.ok) {
          router.push('/dashboard')
          router.refresh()
        } else {
          // Fallback to login page if auto-signin fails
          router.push('/login')
        }
      } else {
        setError(data.error || 'Failed to accept invitation')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <CardSpotlight className="p-8">
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="text-red-500 text-5xl mb-4"
              >
                <AlertCircle className="w-16 h-16 mx-auto" />
              </motion.div>
              <h1 className="text-2xl font-bold">Invalid Invitation</h1>
              <p className="text-muted-foreground">
                This invitation link is invalid or has expired.
              </p>
              <Link href="/login">
                <StatefulButton className="w-full mt-4">
                  Go to Login
                </StatefulButton>
              </Link>
            </div>
          </CardSpotlight>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <CardSpotlight className="p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-4"
            >
              <UserPlus className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Accept Invitation
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-muted-foreground mt-2"
            >
              Create your account to join the family budget
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg p-3 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={cn(
                    "w-full pl-10 pr-3 py-2 rounded-lg border",
                    "bg-white dark:bg-neutral-900",
                    "border-neutral-200 dark:border-neutral-800",
                    "focus:border-blue-500 dark:focus:border-blue-400",
                    "focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20",
                    "transition-all duration-200",
                    "placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                  )}
                  placeholder="John Doe"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={cn(
                    "w-full pl-10 pr-3 py-2 rounded-lg border",
                    "bg-white dark:bg-neutral-900",
                    "border-neutral-200 dark:border-neutral-800",
                    "focus:border-blue-500 dark:focus:border-blue-400",
                    "focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20",
                    "transition-all duration-200",
                    "placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                  )}
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={cn(
                    "w-full pl-10 pr-3 py-2 rounded-lg border",
                    "bg-white dark:bg-neutral-900",
                    "border-neutral-200 dark:border-neutral-800",
                    "focus:border-blue-500 dark:focus:border-blue-400",
                    "focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20",
                    "transition-all duration-200",
                    "placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                  )}
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <StatefulButton
                type="submit"
                loading={loading}
                loadingText="Creating Account..."
                className="w-full"
              >
                Accept & Create Account
              </StatefulButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Already have an account? Login
              </Link>
            </motion.div>
          </form>
        </CardSpotlight>
      </motion.div>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  )
}