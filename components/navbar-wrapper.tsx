import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NavbarIntegrated } from './navbar-integrated'

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

  return (
    <NavbarIntegrated
      user={session.user}
      overviews={overviews}
    />
  )
}
