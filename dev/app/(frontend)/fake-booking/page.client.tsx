'use client';

import { useState } from 'react';

import type { Service, TeamMember } from '../../../payload-types';

import { Button } from '../../../components/ui/button';
import { createAppointment } from '../actions/appointment';

interface Props {
  hosts: TeamMember[];
  services: Service[];
}

function getRandomFutureDate(): Date {
  const now = new Date();
  const daysAhead = Math.floor(Math.random() * 14) + 1;
  const hour = Math.floor(Math.random() * 8) + 9;
  const minute = Math.random() > 0.5 ? 0 : 30;

  const date = new Date(now);
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, minute, 0, 0);

  return date;
}

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
}

export function FakeBookingClient({ hosts, services }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [lastBooking, setLastBooking] = useState<{
    host: string;
    services: string[];
    date: string;
  } | null>(null);

  const handleFakeBooking = async () => {
    if (hosts.length === 0 || services.length === 0) {
      setResult({ success: false, message: 'No hosts or services available' });
      return;
    }

    setLoading(true);
    setResult(null);

    const randomHost = hosts[Math.floor(Math.random() * hosts.length)];
    const serviceCount = Math.floor(Math.random() * 3) + 1;
    const randomServices = getRandomItems(services, serviceCount);
    const randomDate = getRandomFutureDate();

    setLastBooking({
      host: randomHost.firstName || 'Unknown',
      services: randomServices.map((s) => s.title),
      date: randomDate.toLocaleString(),
    });

    const response = await createAppointment(
      randomHost as any,
      randomServices as any,
      randomDate,
      'Test booking from fake booking page',
    );

    setResult(response);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="mb-4">
          <h2 className="font-semibold text-gray-900 mb-1">Available Data</h2>
          <p className="text-sm text-gray-500">
            {hosts.length} host(s) • {services.length} service(s)
          </p>
        </div>

        <Button
          onClick={handleFakeBooking}
          disabled={loading || hosts.length === 0 || services.length === 0}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating...
            </>
          ) : (
            <>
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
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
              Create Fake Booking
            </>
          )}
        </Button>
      </div>

      {lastBooking && (
        <div className="glass-card p-6 rounded-xl border border-gray-200 bg-gray-50/50">
          <h3 className="font-semibold text-gray-900 mb-3">Last Attempt</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Host:</dt>
              <dd className="text-gray-900 font-medium">{lastBooking.host}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Services:</dt>
              <dd className="text-gray-900 font-medium text-right">
                {lastBooking.services.join(', ')}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Date:</dt>
              <dd className="text-gray-900 font-medium">{lastBooking.date}</dd>
            </div>
          </dl>
        </div>
      )}

      {result && (
        <div
          className={`p-4 rounded-xl border ${
            result.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {result.success ? (
              <svg
                className="w-5 h-5"
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
            ) : (
              <svg
                className="w-5 h-5"
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
            )}
            <span className="font-medium">{result.message}</span>
          </div>
        </div>
      )}

      <div className="text-center">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-700 underline">
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}
