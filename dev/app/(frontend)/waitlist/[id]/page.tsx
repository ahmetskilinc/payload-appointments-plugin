import configPromise from '@payload-config';
import { getPayload } from 'payload';

import WaitlistStatusClient from './page.client';

export default async function WaitlistStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = await getPayload({ config: configPromise });

  const entry = await payload.findByID({
    id,
    collection: 'waitlist',
    depth: 2,
  });

  if (!entry) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="glass-card p-10">
          <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-8">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Waitlist Entry Not Found</h2>
          <p className="text-gray-500">
            The waitlist entry you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const serviceId = typeof entry.service === 'object' ? entry.service?.id : entry.service;
  const hostId = typeof entry.host === 'object' ? entry.host?.id : entry.host;

  const whereClause: any = {
    and: [
      { service: { equals: serviceId } },
      { status: { equals: 'waiting' } },
      { createdAt: { less_than: entry.createdAt } },
    ],
  };

  if (hostId) {
    whereClause.and.push({
      or: [{ host: { equals: hostId } }, { host: { exists: false } }],
    });
  }

  const aheadCount = await payload.count({
    collection: 'waitlist',
    where: whereClause,
  });

  const position = aheadCount.totalDocs + 1;

  return <WaitlistStatusClient entry={entry as any} position={position} />;
}
