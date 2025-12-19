'use client';

import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { leaveWaitlist } from '../../actions/appointment';
import { Button } from '../../../../components/ui/button';

interface WaitlistEntry {
  id: string | number;
  status: string;
  notifiedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  service: {
    id: string | number;
    title: string;
  };
  host?: {
    id: string | number;
    firstName?: string;
    lastName?: string;
    preferredNameAppointments?: string;
  } | null;
  preferredDates?: { date: string }[];
  notes?: string;
}

interface WaitlistStatusClientProps {
  entry: WaitlistEntry;
  position: number;
}

export default function WaitlistStatusClient({ entry, position }: WaitlistStatusClientProps) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLeaveWaitlist = async () => {
    setLeaving(true);
    setError(null);

    const result = await leaveWaitlist(entry.id);

    if (result.success) {
      router.refresh();
    } else {
      setError(result.message);
    }

    setLeaving(false);
  };

  const getStatusBadge = () => {
    switch (entry.status) {
      case 'waiting':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Waiting
          </span>
        );
      case 'notified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Notified - Slot Available!
          </span>
        );
      case 'booked':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Booked
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            Expired
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const hostName = entry.host
    ? entry.host.preferredNameAppointments || `${entry.host.firstName} ${entry.host.lastName}`
    : null;

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Waitlist Status</h1>
          {getStatusBadge()}
        </div>

        <div className="space-y-6">
          {entry.status === 'waiting' && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center">
              <p className="text-sm text-blue-600 font-medium mb-1">Your Position</p>
              <p className="text-5xl font-bold text-blue-700">#{position}</p>
              <p className="text-sm text-blue-500 mt-2">
                {position === 1
                  ? "You're next in line!"
                  : `${position - 1} ${position - 1 === 1 ? 'person' : 'people'} ahead of you`}
              </p>
            </div>
          )}

          {entry.status === 'notified' && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-amber-600"
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
                </div>
                <div>
                  <p className="font-semibold text-amber-900">A Slot is Available!</p>
                  <p className="text-sm text-amber-700">Book now before it expires</p>
                </div>
              </div>
              {entry.expiresAt && (
                <p className="text-sm text-amber-600">
                  Expires: {moment(entry.expiresAt).format('MMM D, YYYY h:mm A')}
                </p>
              )}
              <Link href="/book">
                <Button className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white">
                  Book Now
                </Button>
              </Link>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Service</span>
              <span className="font-medium text-gray-900">{entry.service.title}</span>
            </div>
            {hostName && (
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">Preferred Host</span>
                <span className="font-medium text-gray-900">{hostName}</span>
              </div>
            )}
            {entry.preferredDates && entry.preferredDates.length > 0 && (
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">Preferred Dates</span>
                <span className="font-medium text-gray-900">
                  {entry.preferredDates.map((d) => moment(d.date).format('MMM D')).join(', ')}
                </span>
              </div>
            )}
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Joined</span>
              <span className="font-medium text-gray-900">
                {moment(entry.createdAt).format('MMM D, YYYY h:mm A')}
              </span>
            </div>
            {entry.notes && (
              <div className="py-3">
                <span className="text-gray-500 block mb-2">Notes</span>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm">{entry.notes}</p>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-3 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl p-4">
              <svg
                className="w-5 h-5 shrink-0"
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
              {error}
            </div>
          )}

          {(entry.status === 'waiting' || entry.status === 'notified') && (
            <Button
              variant="outline"
              onClick={handleLeaveWaitlist}
              disabled={leaving}
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              {leaving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
                  Leaving...
                </span>
              ) : (
                'Leave Waitlist'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

