import React from 'react'

import type { Service, TeamMember } from '../../payload-types'

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
  setCustomerDetails: React.Dispatch<
    React.SetStateAction<{
      email: string
      firstName: string
      lastName: string
      notes: string
      phone: string
    }>
  >
}> = ({ chosenDateTime, chosenServices, chosenStaff, customerDetails, setCustomerDetails }) => {
  return (
    <div className="flex flex-col gap-2 md:gap-4 mt-6">
      <div className="flex gap-2 md:gap-6 w-full">
        <label className="w-full" htmlFor="chosenServices">
          <span className="text-sm font-semibold leading-6 text-gray-900">Services</span>
          <div className="mt-2.5">
            <input
              className="block w-full rounded-none border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              disabled
              id="chosenServices"
              name="chosenServices"
              type="text"
              value={chosenServices.map((service) => service.id).join(', ')}
            />
          </div>
        </label>
        <label className="w-full block" htmlFor="host">
          <span className="text-sm font-semibold leading-6 text-gray-900">Host</span>
          <div className="mt-2.5">
            <input
              className="block w-full rounded-none border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              disabled
              id="host"
              name="host"
              onChange={() => {}}
              type="text"
              value={chosenStaff?.id}
            />
          </div>
        </label>
      </div>
      <label className="w-full block" htmlFor="host">
        <span className="text-sm font-semibold leading-6 text-gray-900">Date/Time</span>
        <div className="mt-2.5">
          <input
            className="block w-full rounded-none border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
            disabled
            id="host"
            name="host"
            type="text"
            value={chosenDateTime?.toISOString()}
          />
        </div>
      </label>
      <label className="w-full block" htmlFor="message">
        <span className="text-sm font-semibold leading-6 text-gray-900">
          Customer notes (optional)
        </span>
        <div className="mt-2.5">
          <textarea
            className="block w-full rounded-none border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
            id="message"
            name="message"
            onChange={(e) => {
              setCustomerDetails({
                ...customerDetails,
                notes: e.currentTarget.value,
              })
            }}
            placeholder="Customer notes (Optional)"
            rows={3}
            value={customerDetails.notes}
          />
        </div>
      </label>
    </div>
  )
}

export default CustomerDetails
