'use client';

import Link from 'next/link';
import React, { useState } from 'react';

import type { Service, TeamMember } from '../../payload-types';

import { joinWaitlist, joinWaitlistAsGuest } from '../../app/(frontend)/actions/appointment';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface WaitlistJoinProps {
  isAuthenticated: boolean;
  services: Service[];
  host: TeamMember | null;
  selectedDate: string;
  onSuccess?: (waitlistId: string | number) => void;
}

const WaitlistJoin: React.FC<WaitlistJoinProps> = ({
  isAuthenticated,
  services,
  host,
  selectedDate,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waitlistId, setWaitlistId] = useState<string | number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [notes, setNotes] = useState('');
  const [guestDetails, setGuestDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const primaryService = services[0];

  const handleJoinWaitlist = async () => {
    if (!primaryService) return;

    setLoading(true);
    setError(null);

    try {
      let result;

      if (isAuthenticated) {
        result = await joinWaitlist(
          primaryService.id,
          host?.id,
          [selectedDate],
          undefined,
          notes || undefined,
        );
      } else {
        if (
          !guestDetails.firstName ||
          !guestDetails.lastName ||
          !guestDetails.email ||
          !guestDetails.phone
        ) {
          setError('Please fill in all required fields');
          setLoading(false);
          return;
        }

        result = await joinWaitlistAsGuest(
          primaryService.id,
          guestDetails,
          host?.id,
          [selectedDate],
          undefined,
          notes || undefined,
        );
      }

      if (result.success) {
        setSuccess(true);
        setWaitlistId(result.id || null);
        onSuccess?.(result.id!);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred while joining the waitlist');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="glass-card p-8 text-center animate-scale-in">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/30">
          <svg
            className="w-8 h-8 text-white"
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
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">You&apos;re on the Waitlist!</h3>
        <p className="text-gray-500 mb-6">
          We&apos;ll notify you as soon as a slot becomes available for {primaryService.title}
          {host &&
            ` with ${host.preferredNameAppointments || `${host.firstName} ${host.lastName}`}`}
          .
        </p>
        <Link href={`/waitlist/${waitlistId}`}>
          <Button className="bg-gray-900 hover:bg-gray-800 text-white">View Waitlist Status</Button>
        </Link>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="glass-card p-6 animate-fade-in-up">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
            <svg
              className="w-6 h-6 text-blue-600"
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
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Join the Waitlist</h3>
            <p className="text-sm text-gray-500 mb-4">
              No slots available on this date? Join our waitlist and we&apos;ll notify you when a
              spot opens up.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg shadow-blue-600/25"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Join Waitlist
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Join Waitlist</h3>
          <p className="text-sm text-gray-500">for {primaryService.title}</p>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={guestDetails.firstName}
                onChange={(e) =>
                  setGuestDetails((prev) => ({ ...prev, firstName: e.target.value }))
                }
                placeholder="John"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={guestDetails.lastName}
                onChange={(e) => setGuestDetails((prev) => ({ ...prev, lastName: e.target.value }))}
                placeholder="Doe"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={guestDetails.email}
              onChange={(e) => setGuestDetails((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="john@example.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={guestDetails.phone}
              onChange={(e) => setGuestDetails((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>
      )}

      <div className="mb-6">
        <Label htmlFor="notes">Notes (optional)</Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any preferences or additional information..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="flex items-center gap-3 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
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

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setShowForm(false)} className="border-gray-200">
          Cancel
        </Button>
        <Button
          onClick={handleJoinWaitlist}
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg shadow-blue-600/25"
        >
          {loading ? (
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
              Joining...
            </span>
          ) : (
            'Join Waitlist'
          )}
        </Button>
      </div>
    </div>
  );
};

export default WaitlistJoin;

