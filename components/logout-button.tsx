"use client"

import { signOut } from "next-auth/react"

export function LogoutButton() {
  const handleLogout = () => {
    signOut({ 
      callbackUrl: "/login",
      redirect: true 
    })
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      Logout
    </button>
  )
}