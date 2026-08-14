import configPromise from '@payload-config';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getPayload } from 'payload';

import { Button } from '../../../components/ui/button';
import { getDashboardData } from '../../../lib/dashboardData';
import { FakeBookingClient } from './page.client';

export default async function FakeBookingPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('payload-token');

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-8">
        <div className="glass-card p-8 max-w-md text-center animate-fade-in-up">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Not Logged In</h1>
          <p className="text-gray-500 mb-6">You need to be logged in to create fake bookings.</p>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  const customer = await getDashboardData();

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-8">
        <div className="glass-card p-8 max-w-md text-center animate-fade-in-up">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Error</h1>
          <p className="text-gray-500 mb-6">Failed to load user data.</p>
        </div>
      </div>
    );
  }

  const payload = await getPayload({ config: configPromise });

  const [teamMembers, services] = await Promise.all([
    payload.find({
      collection: 'teamMembers',
      limit: 100,
      where: {
        takingAppointments: { equals: true },
      },
    }),
    payload.find({
      collection: 'services',
      limit: 100,
    }),
  ]);

  return (
    <div className="w-full flex justify-center py-10 px-4 animate-fade-in-up">
      <div className="w-full max-w-xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
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
                  d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fake Booking</h1>
              <p className="text-gray-500 text-sm">Create test appointments with random data</p>
            </div>
          </div>
        </div>

        <FakeBookingClient hosts={teamMembers.docs} services={services.docs} />
      </div>
    </div>
  );
}
