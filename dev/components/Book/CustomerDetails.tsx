'use client'

import Link from 'next/link'
import React from 'react'

import type { Service, TeamMember } from '../../payload-types'

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
  setIsGuest: React.Dispatch<React.SetStateAction<boolean>>
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
  if (isAuthenticated) {
    return (
      <div className="flex flex-col gap-4 mt-6">
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800 font-medium">You are logged in</p>
          <p className="text-green-700 text-sm">
            Your appointment will be booked under your account.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="w-full block" htmlFor="notes">
            <span className="text-sm font-semibold leading-6 text-gray-900">Notes (optional)</span>
            <div className="mt-2.5">
              <textarea
                className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                id="notes"
                name="notes"
                onChange={(e) => {
                  setCustomerDetails({
                    ...customerDetails,
                    notes: e.currentTarget.value,
                  })
                }}
                placeholder="Any additional notes for your appointment"
                rows={3}
                value={customerDetails.notes}
              />
            </div>
          </label>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 mt-6">
      <div className="flex gap-2">
        <Button
          onClick={() => setIsGuest(false)}
          type="button"
          variant={!isGuest ? 'default' : 'outline'}
        >
          Sign in to book
        </Button>
        <Button
          onClick={() => setIsGuest(true)}
          type="button"
          variant={isGuest ? 'default' : 'outline'}
        >
          Continue as guest
        </Button>
      </div>

      {!isGuest ? (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-6">
          <p className="text-gray-800 font-medium mb-2">Sign in to your account</p>
          <p className="text-gray-600 text-sm mb-4">
            Sign in to manage your appointments and view your booking history.
          </p>
          <Button asChild>
            <Link href="/login">Go to Sign In</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Enter your details below to book as a guest. You'll receive a confirmation email.
          </p>
          <div className="flex gap-4 w-full">
            <label className="w-full" htmlFor="firstName">
              <span className="text-sm font-semibold leading-6 text-gray-900">First Name *</span>
              <div className="mt-2.5">
                <input
                  className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
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
              </div>
            </label>
            <label className="w-full" htmlFor="lastName">
              <span className="text-sm font-semibold leading-6 text-gray-900">Last Name *</span>
              <div className="mt-2.5">
                <input
                  className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
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
              </div>
            </label>
          </div>
          <div className="flex gap-4 w-full">
            <label className="w-full" htmlFor="email">
              <span className="text-sm font-semibold leading-6 text-gray-900">Email *</span>
              <div className="mt-2.5">
                <input
                  className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
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
              </div>
            </label>
            <label className="w-full" htmlFor="phone">
              <span className="text-sm font-semibold leading-6 text-gray-900">Phone *</span>
              <div className="mt-2.5">
                <input
                  className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
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
              </div>
            </label>
          </div>
          <label className="w-full block" htmlFor="notes">
            <span className="text-sm font-semibold leading-6 text-gray-900">Notes (optional)</span>
            <div className="mt-2.5">
              <textarea
                className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                id="notes"
                name="notes"
                onChange={(e) => {
                  setCustomerDetails({
                    ...customerDetails,
                    notes: e.currentTarget.value,
                  })
                }}
                placeholder="Any additional notes for your appointment"
                rows={3}
                value={customerDetails.notes}
              />
            </div>
          </label>
        </div>
      )}
    </div>
  )
}

export default CustomerDetails
