'use client'

import Link from 'next/link'
import React from 'react'

import type { Service, TeamMember } from '../../payload-types'

import { cn } from '../../lib/utils'
import { Button } from '../ui/button'

const CustomerDetails: React.FC<{
  chosenDateTime: Date | null
  chosenServices: Service[]
  chosenStaff: null | TeamMember
  customerDetails: {
    email: string
    firstName: string
    lastName: string
    notes: string
    phone: string
  }
  isAuthenticated: boolean
  isGuest: boolean
  setCustomerDetails: React.Dispatch<
    React.SetStateAction<{
      email: string
      firstName: string
      lastName: string
      notes: string
      phone: string
    }>
  >
  setIsGuest: (value: boolean) => void
}> = ({
  chosenDateTime,
  chosenServices,
  chosenStaff,
  customerDetails,
  isAuthenticated,
  isGuest,
  setCustomerDetails,
  setIsGuest,
}) => {
  const inputClasses =
    'block w-full h-11 rounded-xl border border-gray-200 px-4 text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-sm transition-colors'
  const textareaClasses =
    'block w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-sm transition-colors resize-none'

  if (isAuthenticated) {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600"
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
              <p className="text-green-800 font-semibold">You&apos;re signed in</p>
              <p className="text-green-700 text-sm">
                Your appointment will be booked under your account
              </p>
            </div>
          </div>
        </div>
        <div>
          <label className="w-full block" htmlFor="notes">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Notes (optional)</span>
            <textarea
              className={textareaClasses}
              id="notes"
              name="notes"
              onChange={(e) => {
                setCustomerDetails({
                  ...customerDetails,
                  notes: e.currentTarget.value,
                })
              }}
              placeholder="Any special requests or additional information..."
              rows={3}
              value={customerDetails.notes}
            />
          </label>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-xl border border-gray-100 p-1 flex gap-1">
        <button
          className={cn(
            'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all',
            !isGuest
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
          )}
          onClick={() => setIsGuest(false)}
          type="button"
        >
          Sign in to book
        </button>
        <button
          className={cn(
            'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all',
            isGuest
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
          )}
          onClick={() => setIsGuest(true)}
          type="button"
        >
          Continue as guest
        </button>
      </div>

      {!isGuest ? (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-gray-500"
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
          <p className="text-gray-900 font-semibold mb-1">Sign in to your account</p>
          <p className="text-gray-500 text-sm mb-4">
            Manage your appointments and view booking history
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
          >
            <Link href="/login">Go to Sign In</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <p className="text-sm text-gray-500 bg-violet-50 border border-violet-100 rounded-lg p-3">
            Enter your details below to book as a guest. You&apos;ll receive a confirmation email.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <label htmlFor="firstName">
              <span className="text-sm font-medium text-gray-700 mb-2 block">First Name *</span>
              <input
                className={inputClasses}
                id="firstName"
                name="firstName"
                onChange={(e) => {
                  setCustomerDetails({
                    ...customerDetails,
                    firstName: e.currentTarget.value,
                  })
                }}
                placeholder="John"
                required
                type="text"
                value={customerDetails.firstName}
              />
            </label>
            <label htmlFor="lastName">
              <span className="text-sm font-medium text-gray-700 mb-2 block">Last Name *</span>
              <input
                className={inputClasses}
                id="lastName"
                name="lastName"
                onChange={(e) => {
                  setCustomerDetails({
                    ...customerDetails,
                    lastName: e.currentTarget.value,
                  })
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
              <span className="text-sm font-medium text-gray-700 mb-2 block">Email *</span>
              <input
                className={inputClasses}
                id="email"
                name="email"
                onChange={(e) => {
                  setCustomerDetails({
                    ...customerDetails,
                    email: e.currentTarget.value,
                  })
                }}
                placeholder="john@example.com"
                required
                type="email"
                value={customerDetails.email}
              />
            </label>
            <label htmlFor="phone">
              <span className="text-sm font-medium text-gray-700 mb-2 block">Phone *</span>
              <input
                className={inputClasses}
                id="phone"
                name="phone"
                onChange={(e) => {
                  setCustomerDetails({
                    ...customerDetails,
                    phone: e.currentTarget.value,
                  })
                }}
                placeholder="+1 234 567 8900"
                required
                type="tel"
                value={customerDetails.phone}
              />
            </label>
          </div>
          <label htmlFor="notes">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Notes (optional)</span>
            <textarea
              className={textareaClasses}
              id="notes"
              name="notes"
              onChange={(e) => {
                setCustomerDetails({
                  ...customerDetails,
                  notes: e.currentTarget.value,
                })
              }}
              placeholder="Any special requests or additional information..."
              rows={3}
              value={customerDetails.notes}
            />
          </label>
        </div>
      )}
    </div>
  )
}

export default CustomerDetails
