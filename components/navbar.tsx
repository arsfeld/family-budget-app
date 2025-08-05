import { auth } from "@/lib/auth"
import { LogoutButton } from "./logout-button"

export async function Navbar() {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-semibold text-gray-900">Family Budget</h1>
            <div className="hidden md:flex items-center gap-6">
              <a href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1">
                <span>📊</span> Dashboard
              </a>
              <a href="/profile" className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1">
                <span>⚙️</span> Settings
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center gap-2">
              <a href="/dashboard" className="p-2 text-gray-700 hover:text-gray-900">
                <span className="text-lg">📊</span>
              </a>
              <a href="/profile" className="p-2 text-gray-700 hover:text-gray-900">
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