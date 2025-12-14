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

  return (
    <div className="mt-6">
      <React.Fragment>
        <Calendar
          className="w-full! border-neutral-200! rounded-md! overflow-hidden!"
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
          chosenDateTime && slots && slots.length && slots.length > 0 ? (
            <div className="space-y-6 mt-6">
              <p>Morning</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
                {filterByDateAndPeriod('morning', chosenDateTime, slots).map((availability) => (
                  <TimeSelectButton
                    availability={availability}
                    chosenDateTime={chosenDateTime}
                    key={availability}
                    setChosenDateTime={setChosenDateTime}
                  />
                ))}
              </div>
              <p>Afternoon</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
                {filterByDateAndPeriod('afternoon', chosenDateTime, slots).map((availability) => (
                  <TimeSelectButton
                    availability={availability}
                    chosenDateTime={chosenDateTime}
                    key={availability}
                    setChosenDateTime={setChosenDateTime}
                  />
                ))}
              </div>
              <p>Evening</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
                {filterByDateAndPeriod('evening', chosenDateTime, slots).map((availability) => (
                  <TimeSelectButton
                    availability={availability}
                    chosenDateTime={chosenDateTime}
                    key={availability}
                    setChosenDateTime={setChosenDateTime}
                  />
                ))}
              </div>
            </div>
          ) : null
        ) : (
          <div className="flex items-center justify-center h-96">
            <MoonLoader />
          </div>
        )}
      </React.Fragment>
    </div>
  )
}

export default SelectDateTime
