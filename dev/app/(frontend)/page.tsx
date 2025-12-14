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
      <div className="w-screen flex flex-col items-center justify-center py-20 px-4">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to Appointments</h1>
          <p className="text-gray-600 mb-8">
            Book your appointment today. No account required - you can book as a guest or sign in to
            manage your appointments.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/book">Book an Appointment</Link>
            </Button>
            <Button asChild variant="outline">
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
    <div className="w-screen flex justify-center py-4 px-4">
      <Tabs className="w-[520px]" defaultValue="upcoming">
        <TabsList className="w-full flex">
          <TabsTrigger className="flex-1" value="upcoming">
            Upcoming
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="past">
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
  )
}
