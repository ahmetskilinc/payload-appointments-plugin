import configPromise from '@payload-config'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'

import AppointmentsList from '../../components/Appointments'
import { Button } from '../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { getDashboardData } from '../../lib/dashboardData'
import { logout } from './actions/auth'

export default async function Dashboard() {
  const cookieStore = await cookies()
  const session = cookieStore.get('payload-token')

  if (!session) {
    return (
      <div className="w-screen flex flex-col items-center justify-center py-24 px-4">
        <div className="max-w-lg text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/25">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Book Your Next Appointment
          </h1>
          <p className="text-gray-500 mb-10 text-lg leading-relaxed">
            Schedule appointments in seconds. No account required — book as a guest or sign in to
            manage your bookings.
          </p>
          <div className="flex flex-col gap-2 items-center sm:flex-row sm:gap-4 sm:justify-center">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-violet-500/25 px-8"
            >
              <Link href="/book">Book an Appointment</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-gray-200 hover:bg-gray-50 px-8"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  let dashboardData
  try {
    dashboardData = await getDashboardData()
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="mb-4">Failed to load dashboard data. Please try logging in again.</p>
        <form action={logout}>
          <Button type="submit">Logout</Button>
        </form>
      </div>
    )
  }

  const payload = await getPayload({ config: configPromise })

  const appointments = (
    await payload.find({
      collection: 'appointments',
      limit: 0,
      overrideAccess: false,
      sort: 'starts',
      user: dashboardData?.id,
      where: {
        customer: {
          equals: dashboardData?.id,
        },
      },
    })
  ).docs

  const currentDate = new Date()

  const upcomingAppointments = appointments.filter(
    (appointment) => new Date(appointment.start as string) >= currentDate,
  )
  const pastAppointments = appointments.filter(
    (appointment) => new Date(appointment.start as string) < currentDate,
  )

  return (
    <div className="w-screen flex justify-center py-8 px-4">
      <div className="w-full max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">My Appointments</h1>
          <p className="text-gray-500">View and manage your upcoming and past bookings</p>
        </div>
        <Tabs className="w-full" defaultValue="upcoming">
          <TabsList className="w-full flex mb-6 bg-gray-100/80 p-1 rounded-xl">
            <TabsTrigger
              className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
              value="upcoming"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
              value="past"
            >
              Past
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            <div className="flex flex-col gap-4">
              <AppointmentsList appointments={upcomingAppointments} />
            </div>
          </TabsContent>
          <TabsContent value="past">
            <div className="flex flex-col gap-4">
              <AppointmentsList appointments={pastAppointments} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
