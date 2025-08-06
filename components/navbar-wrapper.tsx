import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NavbarIntegrated } from './navbar-integrated'
import {
  createMonthlyOverview,
  switchMonthlyOverview,
  deleteMonthlyOverview,
} from '@/app/(dashboard)/dashboard/actions'

export async function NavbarWrapper() {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  // Fetch overviews for the navbar when on dashboard
  let overviews: Array<{
    id: string
    name: string
    isActive: boolean
    createdAt: Date
  }> = []
  if (session.user.familyId) {
    overviews = await db.monthlyOverview.findMany({
      where: { familyId: session.user.familyId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
      },
    })
  }

  // Create wrapper functions to match expected signatures
  const handleCreateOverview = async (name: string) => {
    const formData = new FormData()
    formData.append('name', name)
    await createMonthlyOverview(formData)
  }

  const handleSwitchOverview = async (overviewId: string) => {
    await switchMonthlyOverview(overviewId)
  }

  const handleDeleteOverview = async (overviewId: string) => {
    await deleteMonthlyOverview(overviewId)
  }

  return (
    <NavbarIntegrated
      user={session.user}
      overviews={overviews}
      onCreateOverview={handleCreateOverview}
      onSwitchOverview={handleSwitchOverview}
      onDeleteOverview={handleDeleteOverview}
    />
  )
}
