'use client'

import moment from 'moment'
import React, { useEffect, useState } from 'react'
import 'react-calendar/dist/Calendar.css'
import Calendar from 'react-calendar'
import MoonLoader from 'react-spinners/MoonLoader'

import type { Service, TeamMember } from '../../payload-types'

import { fetchPublic } from '../../lib/api'
import { filterByDateAndPeriod } from '../../lib/filterByDateAndPeriod'
import TimeSelectButton from './TimeSelectButton'

const SelectDateTime: React.FC<{
  chosenDateTime: Date
  chosenServices: Service[]
  chosenStaff: null | TeamMember
  setChosenDateTime: React.Dispatch<React.SetStateAction<Date>>
}> = ({ chosenDateTime, chosenServices, chosenStaff, setChosenDateTime }) => {
  const [slots, setSlots] = useState<null | string[]>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const services = chosenServices.map((service) => service.id).join(',')
    const day = moment(chosenDateTime).toISOString()
    const getAvailabilities = async () => {
      setLoading(true)
      const data = await fetchPublic(
        `/api/get-available-appointment-slots?services=${services}&host=${chosenStaff?.id}&day=${day}`,
        {
          method: 'get',
        },
      )

      const slots = await data.json()
      setSlots(slots.filteredSlots)
      setLoading(false)
    }

    void getAvailabilities()
  }, [chosenDateTime])

  const morningSlots = slots ? filterByDateAndPeriod('morning', chosenDateTime, slots) : []
  const afternoonSlots = slots ? filterByDateAndPeriod('afternoon', chosenDateTime, slots) : []
  const eveningSlots = slots ? filterByDateAndPeriod('evening', chosenDateTime, slots) : []

  return (
    <div>
      <Calendar
        defaultValue={chosenDateTime}
        locale="en-GB"
        maxDate={new Date(new Date().setMonth(new Date().getMonth() + 1))}
        maxDetail="month"
        minDate={new Date()}
        minDetail="month"
        onChange={(value) => setChosenDateTime(new Date(value!.toString()))}
        value={chosenDateTime}
      />
      {!loading ? (
        chosenDateTime && slots && slots.length > 0 ? (
          <div className="space-y-6 mt-8">
            {morningSlots.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-4 h-4 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-700">Morning</p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                  {morningSlots.map((availability) => (
                    <TimeSelectButton
                      availability={availability}
                      chosenDateTime={chosenDateTime}
                      key={availability}
                      setChosenDateTime={setChosenDateTime}
                    />
                  ))}
                </div>
              </div>
            )}
            {afternoonSlots.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-4 h-4 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-700">Afternoon</p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                  {afternoonSlots.map((availability) => (
                    <TimeSelectButton
                      availability={availability}
                      chosenDateTime={chosenDateTime}
                      key={availability}
                      setChosenDateTime={setChosenDateTime}
                    />
                  ))}
                </div>
              </div>
            )}
            {eveningSlots.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-4 h-4 text-indigo-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-700">Evening</p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                  {eveningSlots.map((availability) => (
                    <TimeSelectButton
                      availability={availability}
                      chosenDateTime={chosenDateTime}
                      key={availability}
                      setChosenDateTime={setChosenDateTime}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : slots && slots.length === 0 ? (
          <div className="mt-8 text-center py-8 bg-gray-50 rounded-xl">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-500 font-medium">No available slots for this day</p>
            <p className="text-gray-400 text-sm mt-1">Try selecting a different date</p>
          </div>
        ) : null
      ) : (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <MoonLoader color="#7c3aed" size={40} />
          <p className="text-gray-500 text-sm">Loading available times...</p>
        </div>
      )}
    </div>
  )
}

export default SelectDateTime
