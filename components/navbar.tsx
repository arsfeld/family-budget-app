import { auth } from '@/lib/auth'
import { LogoutButton } from './logout-button'

export async function Navbar() {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-semibold text-gray-900">
              Family Budget
            </h1>
            <div className="hidden items-center gap-6 md:flex">
              <a
                href="/dashboard"
                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <span>📊</span> Dashboard
              </a>
              <a
                href="/profile"
                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <span>⚙️</span> Settings
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile Navigation */}
            <div className="flex items-center gap-2 md:hidden">
              <a
                href="/dashboard"
                className="p-2 text-gray-700 hover:text-gray-900"
              >
                <span className="text-lg">📊</span>
              </a>
              <a
                href="/profile"
                className="p-2 text-gray-700 hover:text-gray-900"
              >
                <span className="text-lg">⚙️</span>
              </a>
            </div>

            <div className="text-sm text-gray-600">
              <span className="hidden md:inline">Welcome, </span>
              <span className="font-medium">{session.user.name}</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
