'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
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
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to your family budget
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-input bg-background placeholder:text-muted-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                placeholder="john@demo.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-input bg-background placeholder:text-muted-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Create one
            </Link>
          </div>

          <div className="bg-muted rounded-md p-4 text-sm">
            <p className="font-medium">Demo Accounts:</p>
            <p>Email: john@demo.com | Password: demo123</p>
            <p>Email: jane@demo.com | Password: demo123</p>
          </div>
        </form>
      </div>
    </div>
  )
}
