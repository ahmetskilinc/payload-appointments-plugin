import Link from 'next/link'
import React from 'react'

import { logout } from '../../app/(frontend)/actions/auth'
import { Button } from '../../components/ui/button'
import { getDashboardData } from '../../lib/dashboardData'

export default async function Header() {
  const dashboardData = await getDashboardData()
  const isLoggedIn = dashboardData && dashboardData.id

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link className="shrink-0 flex items-center gap-2" href="/">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Appointments
              </span>
            </Link>
          </div>
          <nav className="ml-6 flex items-center space-x-2">
            <Button asChild variant="ghost" className="text-gray-600 hover:text-gray-900">
              <Link href="/book">Book</Link>
            </Button>
            {isLoggedIn ? (
              <>
                <Button asChild variant="ghost" className="text-gray-600 hover:text-gray-900">
                  <Link href="/">My Appointments</Link>
                </Button>
                <form action={logout}>
                  <Button type="submit" variant="outline" className="border-gray-200">
                    Logout
                  </Button>
                </form>
              </>
            ) : (
              <Button
                asChild
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
              >
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
