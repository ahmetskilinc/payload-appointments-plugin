import configPromise from '@payload-config'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
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
    redirect('/login')
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
          equals: dashboardData.id,
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
