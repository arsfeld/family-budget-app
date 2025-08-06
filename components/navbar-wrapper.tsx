import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NavbarAceternity } from './navbar-aceternity'

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
    isArchived: boolean
    archivedAt: Date | null
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
        isArchived: true,
        archivedAt: true,
        createdAt: true,
      },
    })
  }

  return (
    <NavbarAceternity
      user={session.user}
      overviews={overviews}
    />
  )
}
