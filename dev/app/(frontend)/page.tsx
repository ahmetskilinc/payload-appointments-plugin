import configPromise from '@payload-config';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getPayload } from 'payload';

import AppointmentsList from '../../components/Appointments';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { getDashboardData } from '../../lib/dashboardData';
import { logout } from './actions/auth';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const session = cookieStore.get('payload-token');

  if (!session) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-200/40 rounded-full blur-3xl animate-pulse-soft" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-200/40 rounded-full blur-3xl animate-pulse-soft"
            style={{ animationDelay: '1s' }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-gray-100/30 to-slate-100/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-xl text-center animate-fade-in-up">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gray-900 flex items-center justify-center mb-8 shadow-2xl shadow-gray-900/30 animate-float">
            <svg
              className="w-10 h-10 text-white"
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

          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium mb-6 animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Available 24/7 for bookings
          </div>

          <h1
            className="text-5xl md:text-6xl font-bold mb-6 tracking-tight animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Book Your Next
            </span>
            <br />
            <span className="text-gray-900">Appointment</span>
          </h1>

          <p
            className="text-gray-500 mb-10 text-lg md:text-xl leading-relaxed max-w-md mx-auto animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            Schedule appointments in seconds. No account required — book as a guest or sign in to
            manage your bookings.
          </p>

          <div
            className="flex flex-col gap-3 items-center sm:flex-row sm:gap-4 sm:justify-center animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto px-8 h-12 text-base font-medium glow"
            >
              <Link href="/book">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Book an Appointment
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8 h-12 text-base font-medium"
            >
              <Link href="/login">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
                Sign In
              </Link>
            </Button>
          </div>

          <div
            className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-400 animate-fade-in"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-emerald-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Instant confirmation</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-emerald-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Free cancellation</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  let dashboardData;
  try {
    dashboardData = await getDashboardData();
  } catch (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-8">
        <div className="glass-card p-8 max-w-md text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Something went wrong</h1>
          <p className="text-gray-500 mb-6">
            Failed to load dashboard data. Please try logging in again.
          </p>
          <form action={logout}>
            <Button type="submit" className="w-full">
              Logout
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const payload = await getPayload({ config: configPromise });

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
  ).docs;

  const currentDate = new Date();

  const upcomingAppointments = appointments.filter(
    (appointment) => new Date(appointment.start as string) >= currentDate,
  );
  const pastAppointments = appointments.filter(
    (appointment) => new Date(appointment.start as string) < currentDate,
  );

  return (
    <div className="w-full flex justify-center py-10 px-4 animate-fade-in-up">
      <div className="w-full max-w-xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shadow-lg shadow-gray-900/20">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-gray-500 text-sm">View and manage your bookings</p>
            </div>
          </div>
        </div>
        <Tabs className="w-full" defaultValue="upcoming">
          <TabsList className="w-full flex mb-6 bg-gray-100/80 p-1.5 rounded-xl">
            <TabsTrigger
              className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium transition-all duration-200"
              value="upcoming"
            >
              <svg
                className="w-4 h-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger
              className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium transition-all duration-200"
              value="past"
            >
              <svg
                className="w-4 h-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Past ({pastAppointments.length})
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
  );
}
