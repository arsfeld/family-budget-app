import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { SettingsTabs } from './settings-tabs'

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <a href="/dashboard" className="hover:text-gray-900">
            Dashboard
          </a>
          <span>/</span>
          <span className="text-gray-900">Settings</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <SettingsTabs user={user} categories={categories} />
      </div>
    </div>
  )
}
