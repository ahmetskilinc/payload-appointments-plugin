import configPromise from '@payload-config';
import { cookies } from 'next/headers';
import { getPayload } from 'payload';
import React from 'react';

import BookNow from '../../../components/Book';

const Page = async () => {
  const cookieStore = await cookies();
  const session = cookieStore.get('payload-token');
  const isAuthenticated = !!session?.value;

  const payload = await getPayload({ config: configPromise });
  const teamMembers = (
    await payload.find({
      collection: 'teamMembers',
      overrideAccess: false,
      where: {
        takingAppointments: {
          equals: true,
        },
      },
    })
  ).docs;

  const services = (
    await payload.find({
      collection: 'services',
      overrideAccess: false,
    })
  ).docs;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-12 px-6 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-gray-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-slate-200/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto mb-10 animate-fade-in-down">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center shadow-lg shadow-gray-900/25">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Book an Appointment</h1>
            <p className="text-gray-500">Choose your services and pick a time that works for you</p>
          </div>
        </div>
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <BookNow isAuthenticated={isAuthenticated} services={services} teamMembers={teamMembers} />
      </div>
    </div>
  );
};

export default Page;
