import Link from 'next/link'
import React from 'react'

import { logout } from '../../app/(frontend)/actions/auth'
import { Button } from '../../components/ui/button'
import { getDashboardData } from '../../lib/dashboardData'

export default async function Header() {
  const dashboardData = await getDashboardData()
  const isLoggedIn = dashboardData && dashboardData.id

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link className="shrink-0 flex items-center" href="/">
              <span className="text-xl font-bold text-gray-800">Appointments</span>
            </Link>
          </div>
          <nav className="ml-6 flex items-center space-x-4">
            <Button asChild variant="ghost">
              <Link href="/book">Book An Appointment</Link>
            </Button>
            {isLoggedIn ? (
              <>
                <Button asChild variant="ghost">
                  <Link href="/">My Appointments</Link>
                </Button>
                <form action={logout}>
                  <Button type="submit" variant="outline">
                    Logout
                  </Button>
                </form>
              </>
            ) : (
              <Button asChild variant="outline">
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
