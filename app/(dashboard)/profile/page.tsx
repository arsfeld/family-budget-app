import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { SettingsTabs } from './settings-tabs'
import Link from 'next/link'

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      family: {
        include: {
          users: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      },
    },
  })

  if (!user) {
    redirect('/login')
  }

  // Fetch categories for the family
  const categories = await db.category.findMany({
    where: { familyId: user.familyId },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950/50">
      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Breadcrumb with smoother styling */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <Link 
            href="/dashboard" 
            className="text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Dashboard
          </Link>
          <span className="text-gray-400 dark:text-gray-600">/</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">Settings</span>
        </div>

        <div className="mb-8">
          <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-4xl font-bold text-transparent">
            Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your profile, family, and preferences</p>
        </div>

        <SettingsTabs user={user} categories={categories} />
      </div>
    </div>
  )
}
