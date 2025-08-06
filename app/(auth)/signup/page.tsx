'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { StatefulButton, CardSpotlight, MultiStepLoader } from '@/components/ui/aceternity'
import { cn } from '@/lib/aceternity-utils'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      // Create account
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const signupData = await signupResponse.json()

      if (!signupResponse.ok) {
        setError(signupData.error || 'Failed to create account')
        return
      }

      // Automatically sign in after successful signup
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Account created but login failed. Please try logging in.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              Create Your Account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-muted-foreground mt-2"
            >
              Start managing your family budget today
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

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={cn(
                      "w-full pl-10 pr-3 py-2 rounded-lg border",
                      "bg-white dark:bg-neutral-900",
                      "border-neutral-200 dark:border-neutral-800",
                      "focus:border-purple-500 dark:focus:border-purple-400",
                      "focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20",
                      "transition-all duration-200",
                      "placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                    )}
                    placeholder="John Smith"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={cn(
                      "w-full pl-10 pr-3 py-2 rounded-lg border",
                      "bg-white dark:bg-neutral-900",
                      "border-neutral-200 dark:border-neutral-800",
                      "focus:border-purple-500 dark:focus:border-purple-400",
                      "focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20",
                      "transition-all duration-200",
                      "placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                    )}
                    placeholder="john@example.com"
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
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={cn(
                      "w-full pl-10 pr-3 py-2 rounded-lg border",
                      "bg-white dark:bg-neutral-900",
                      "border-neutral-200 dark:border-neutral-800",
                      "focus:border-purple-500 dark:focus:border-purple-400",
                      "focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20",
                      "transition-all duration-200",
                      "placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                    )}
                    placeholder="••••••••"
                  />
                  {formData.password.length > 0 && formData.password.length < 6 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-amber-600 dark:text-amber-400 mt-1"
                    >
                      Password must be at least 6 characters
                    </motion.p>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={cn(
                      "w-full pl-10 pr-3 py-2 rounded-lg border",
                      "bg-white dark:bg-neutral-900",
                      "border-neutral-200 dark:border-neutral-800",
                      "focus:border-purple-500 dark:focus:border-purple-400",
                      "focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20",
                      "transition-all duration-200",
                      "placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                    )}
                    placeholder="••••••••"
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-red-600 dark:text-red-400 mt-1"
                    >
                      Passwords do not match
                    </motion.p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length >= 6 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <StatefulButton
                type="submit"
                disabled={isLoading || formData.password !== formData.confirmPassword || formData.password.length < 6}
                loading={isLoading}
                loadingText="Creating account..."
                className="w-full"
                size="lg"
                variant="success"
              >
                Create Account
              </StatefulButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-sm"
            >
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </motion.div>
          </form>
        </CardSpotlight>
      </motion.div>
    </div>
  )
}
