import { NextAuthOptions, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      familyId: string
      familyName?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    familyId: string
    familyName?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    familyId: string
    familyName?: string
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            family: true,
          },
        })

        if (!user) {
          throw new Error('User not found')
        }

        // Check if user is verified and has a password
        if (!user.isVerified || !user.passwordHash) {
          throw new Error(
            'Account not verified. Please check your email to complete signup.'
          )
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          familyId: user.familyId,
          familyName: user.family.name,
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.familyId = user.familyId
        token.familyName = user.familyName
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string
        session.user.familyId = token.familyId as string
        session.user.familyName = token.familyName as string
      }
      return session
    },
  },
}

export async function auth() {
  return await getServerSession(authOptions)
}
