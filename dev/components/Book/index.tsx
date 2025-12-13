'use client'

import moment from 'moment'
import React, { useState } from 'react'

import type { Service, TeamMember } from '../../payload-types'

import { createAppointment } from '../../app/(frontend)/actions/appointment'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import CustomerDetails from './CustomerDetails'
import HostList from './HostList'
import SelectDateTime from './SelectDateTime'
import Selections from './Selections'
import ServicesList from './ServicesList'

const BookNow: React.FC<{ services: Service[]; teamMembers: TeamMember[] }> = ({
  services,
  teamMembers,
}) => {
  const [chosenStaff, setChosenStaff] = useState<TeamMember | null>(null)
  const [chosenServices, setChosenServices] = useState<Service[]>([])
  const [chosenDateTime, setChosenDateTime] = useState<Date>(moment().toDate())
  const [stepIndex, setStepIndex] = useState<number>(0)
  const [bookingLoading, setBookingLoading] = useState<boolean>(false)
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false)
  const [bookingSuccessMessage, setBookingSuccessMessage] = useState<boolean>(false)
  const [customerDetails, setCustomerDetails] = useState<{
    email: string
    firstName: string
    lastName: string
    notes: string
    phone: string
  }>({
    email: '',
    firstName: '',
    lastName: '',
    notes: '',
    phone: '',
  })

  const nextStep = () => {
    setStepIndex(stepIndex + 1)
    if (window !== undefined) {
      window.scrollTo({ top: 0 })
    }
  }

  const prevStep = () => {
    setStepIndex(stepIndex - 1)
    if (window !== undefined) {
      window.scrollTo({ top: 0 })
    }
  }

  const isContinueDisabled = () => {
    if (stepIndex === 0) {
      return !chosenServices?.length
    } else if (stepIndex === 1) {
      return !chosenStaff
    } else if (stepIndex === 2) {
      return !chosenDateTime
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-12 gap-4 md:gap-8">
        <Selections
          chosenDateTime={chosenDateTime}
          chosenServices={chosenServices}
          chosenStaff={chosenStaff}
          setStepIndex={setStepIndex}
        />
        <div className="col-span-12 md:col-span-8">
          <div className="flex justify-between items-start">
            {stepIndex === 0 ? (
              <div>
                <p className="text-base mb-1">Available services</p>
                <p className="text-xs mb-6 text-gray-500">Select one or more services</p>
              </div>
            ) : stepIndex === 1 ? (
              <div>
                <p className="text-base mb-1">Available staff</p>
                <p className="text-xs mb-6 text-gray-500">Select one staff member</p>
              </div>
            ) : stepIndex === 2 ? (
              <div>
                <p className="text-base mb-1">Available dates and times</p>
              </div>
            ) : stepIndex === 3 ? (
              <div>
                <p className="text-base mb-1">Your details</p>
              </div>
            ) : null}
          </div>
          <div className={cn(stepIndex === 0 ? 'block' : 'hidden')}>
            <ServicesList
              chosenServices={chosenServices}
              services={services}
              setChosenServices={setChosenServices}
            />
          </div>

          <div className={cn(stepIndex === 1 ? 'block' : 'hidden')}>
            <HostList
              chosenStaff={chosenStaff}
              setChosenStaff={setChosenStaff}
              teamMembers={teamMembers}
            />
          </div>

          <div className={cn(stepIndex === 2 ? 'block' : 'hidden')}>
            {stepIndex === 2 ? (
              <SelectDateTime
                chosenDateTime={chosenDateTime}
                chosenServices={chosenServices}
                chosenStaff={chosenStaff}
                setChosenDateTime={setChosenDateTime}
              />
            ) : null}
          </div>
          <div className={cn(stepIndex === 3 ? 'block' : 'hidden')}>
            <CustomerDetails
              chosenDateTime={chosenDateTime}
              chosenServices={chosenServices}
              chosenStaff={chosenStaff}
              customerDetails={customerDetails}
              setCustomerDetails={setCustomerDetails}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4 md:gap-8 mt-6">
        <div className="col-span-12 md:col-span-8 md:col-start-5 flex justify-between">
          {stepIndex !== 0 ? (
            <Button onClick={prevStep} variant="outline">
              Back
            </Button>
          ) : (
            <span className="" />
          )}
          {stepIndex <= 2 ? (
            <Button disabled={isContinueDisabled()} onClick={nextStep}>
              Continue
            </Button>
          ) : (
            <Button
              // disabled={!chosenStaff?.id && }
              onClick={() => {
                setBookingLoading(true)
                createAppointment(chosenStaff as TeamMember, chosenServices, chosenDateTime).then(
                  (res) => {
                    if (res.success) {
                      setBookingLoading(false)
                      setBookingSuccess(true)
                    } else {
                      setBookingLoading(false)
                      setBookingSuccess(false)
                    }
                  },
                )
              }}
              type="button"
            >
              {bookingLoading ? 'Booking' : 'Book now'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookNow
