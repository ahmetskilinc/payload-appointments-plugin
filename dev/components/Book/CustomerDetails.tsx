'use client';

import Link from 'next/link';
import React from 'react';

import type { Service, TeamMember } from '../../payload-types';

import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

const CustomerDetails: React.FC<{
  chosenDateTime: Date | null;
  chosenServices: Service[];
  chosenStaff: null | TeamMember;
  customerDetails: {
    email: string;
    firstName: string;
    lastName: string;
    notes: string;
    phone: string;
  };
  isAuthenticated: boolean;
  isGuest: boolean;
  setCustomerDetails: React.Dispatch<
    React.SetStateAction<{
      email: string;
      firstName: string;
      lastName: string;
      notes: string;
      phone: string;
    }>
  >;
  setIsGuest: (value: boolean) => void;
}> = ({ customerDetails, isAuthenticated, isGuest, setCustomerDetails, setIsGuest }) => {
  const inputClasses =
    'block w-full h-12 rounded-xl border-2 border-gray-100 px-4 text-gray-900 placeholder:text-gray-400 bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-500/10 focus:outline-none text-sm transition-all duration-200';
  const textareaClasses =
    'block w-full rounded-xl border-2 border-gray-100 px-4 py-3 text-gray-900 placeholder:text-gray-400 bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-500/10 focus:outline-none text-sm transition-all duration-200 resize-none';

  if (isAuthenticated) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in-up">
        <div className="glass-card p-6 bg-linear-to-br from-emerald-50 to-green-50 border-emerald-100/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <svg
                className="w-7 h-7 text-white"
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
            <div>
              <p className="text-emerald-800 font-bold text-lg">You&apos;re signed in</p>
              <p className="text-emerald-600">Your appointment will be booked under your account</p>
            </div>
          </div>
        </div>
        <div>
          <label className="w-full block" htmlFor="notes">
            <span className="text-sm font-semibold text-gray-700 mb-2 block">Notes (optional)</span>
            <textarea
              className={textareaClasses}
              id="notes"
              name="notes"
              onChange={(e) => {
                setCustomerDetails({
                  ...customerDetails,
                  notes: e.currentTarget.value,
                });
              }}
              placeholder="Any special requests or additional information..."
              rows={4}
              value={customerDetails.notes}
            />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="glass-card p-2 flex gap-2">
        <button
          className={cn(
            'flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300',
            !isGuest
              ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/25'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
          )}
          onClick={() => setIsGuest(false)}
          type="button"
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4"
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
            Sign in to book
          </span>
        </button>
        <button
          className={cn(
            'flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300',
            isGuest
              ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/25'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
          )}
          onClick={() => setIsGuest(true)}
          type="button"
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
            Continue as guest
          </span>
        </button>
      </div>

      {!isGuest ? (
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br bg-gray-100 flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-8 h-8 text-gray-500"
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
          </div>
          <p className="text-gray-900 font-bold text-lg mb-2">Sign in to your account</p>
          <p className="text-gray-500 mb-6">Manage your appointments and view booking history</p>
          <Button
            asChild
            size="lg"
            className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-lg shadow-gray-900/25 hover:shadow-xl hover:shadow-gray-900/30 transition-all duration-300 hover:-translate-y-0.5"
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
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              Go to Sign In
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="bg-linear-to-br bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <svg
                className="w-5 h-5 text-gray-900"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-800 font-medium">
              Enter your details below to book as a guest. You&apos;ll receive a confirmation email.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label htmlFor="firstName">
              <span className="text-sm font-semibold text-gray-700 mb-2 block">First Name *</span>
              <input
                className={inputClasses}
                id="firstName"
                name="firstName"
                onChange={(e) => {
                  setCustomerDetails({
                    ...customerDetails,
                    firstName: e.currentTarget.value,
                  });
                }}
                placeholder="John"
                required
                type="text"
                value={customerDetails.firstName}
              />
            </label>
            <label htmlFor="lastName">
              <span className="text-sm font-semibold text-gray-700 mb-2 block">Last Name *</span>
              <input
                className={inputClasses}
                id="lastName"
                name="lastName"
                onChange={(e) => {
                  setCustomerDetails({
                    ...customerDetails,
                    lastName: e.currentTarget.value,
                  });
                }}
                placeholder="Doe"
                required
                type="text"
                value={customerDetails.lastName}
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label htmlFor="email">
              <span className="text-sm font-semibold text-gray-700 mb-2 block">Email *</span>
              <input
                className={inputClasses}
                id="email"
                name="email"
                onChange={(e) => {
                  setCustomerDetails({
                    ...customerDetails,
                    email: e.currentTarget.value,
                  });
                }}
                placeholder="john@example.com"
                required
                type="email"
                value={customerDetails.email}
              />
            </label>
            <label htmlFor="phone">
              <span className="text-sm font-semibold text-gray-700 mb-2 block">Phone *</span>
              <input
                className={inputClasses}
                id="phone"
                name="phone"
                onChange={(e) => {
                  setCustomerDetails({
                    ...customerDetails,
                    phone: e.currentTarget.value,
                  });
                }}
                placeholder="+1 234 567 8900"
                required
                type="tel"
                value={customerDetails.phone}
              />
            </label>
          </div>
          <label htmlFor="notes">
            <span className="text-sm font-semibold text-gray-700 mb-2 block">Notes (optional)</span>
            <textarea
              className={textareaClasses}
              id="notes"
              name="notes"
              onChange={(e) => {
                setCustomerDetails({
                  ...customerDetails,
                  notes: e.currentTarget.value,
                });
              }}
              placeholder="Any special requests or additional information..."
              rows={4}
              value={customerDetails.notes}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;
