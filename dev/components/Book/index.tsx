'use client'

import moment from 'moment'
import { parseAsArrayOf, parseAsBoolean, parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import React, { useMemo, useState } from 'react'

import type { Service, TeamMember } from '../../payload-types'

import { createAppointment, createGuestAppointment } from '../../app/(frontend)/actions/appointment'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import CustomerDetails from './CustomerDetails'
import HostList from './HostList'
import SelectDateTime from './SelectDateTime'
import Selections from './Selections'
import ServicesList from './ServicesList'

const BookNow: React.FC<{
  isAuthenticated: boolean
  services: Service[]
  teamMembers: TeamMember[]
}> = ({ isAuthenticated, services, teamMembers }) => {
  const [stepIndex, setStepIndex] = useQueryState('step', parseAsInteger.withDefault(0))
  const [serviceIds, setServiceIds] = useQueryState(
    'services',
    parseAsArrayOf(parseAsString).withDefault([]),
  )
  const [hostId, setHostId] = useQueryState('host', parseAsString.withDefault(''))
  const [isGuest, setIsGuest] = useQueryState('guest', parseAsBoolean.withDefault(true))

  const chosenServices = useMemo(() => {
    return services.filter((service) => serviceIds.includes(service.id))
  }, [services, serviceIds])

  const chosenStaff = useMemo(() => {
    return teamMembers.find((member) => member.id === hostId) || null
  }, [teamMembers, hostId])

  const setChosenServices = (newServices: Service[] | ((prev: Service[]) => Service[])) => {
    if (typeof newServices === 'function') {
      const updated = newServices(chosenServices)
      setServiceIds(updated.map((s) => s.id))
    } else {
      setServiceIds(newServices.map((s) => s.id))
    }
  }

  const setChosenStaff = (staff: TeamMember | null) => {
    setHostId(staff?.id || '')
  }

  const [chosenDateTime, setChosenDateTime] = useState<Date>(moment().toDate())
  const [bookingLoading, setBookingLoading] = useState<boolean>(false)
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
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

  const isBookDisabled = () => {
    if (isAuthenticated) {
      return false
    }
    if (!isGuest) {
      return true
    }
    return (
      !customerDetails.firstName ||
      !customerDetails.lastName ||
      !customerDetails.email ||
      !customerDetails.phone
    )
  }

  const handleBooking = async () => {
    setBookingLoading(true)
    setBookingError(null)

    try {
      let result

      if (isAuthenticated) {
        result = await createAppointment(chosenStaff as TeamMember, chosenServices, chosenDateTime)
      } else if (isGuest) {
        result = await createGuestAppointment(
          chosenStaff as TeamMember,
          chosenServices,
          chosenDateTime,
          {
            email: customerDetails.email,
            firstName: customerDetails.firstName,
            lastName: customerDetails.lastName,
            phone: customerDetails.phone,
          },
        )
      } else {
        setBookingError('Please sign in or continue as a guest')
        setBookingLoading(false)
        return
      }

      if (result.success) {
        setBookingSuccess(true)
      } else {
        setBookingError(result.message)
      }
    } catch (error) {
      setBookingError('An error occurred while booking your appointment')
    } finally {
      setBookingLoading(false)
    }
  }

  const resetBooking = () => {
    setBookingSuccess(false)
    setStepIndex(0)
    setServiceIds([])
    setHostId('')
    setCustomerDetails({
      email: '',
      firstName: '',
      lastName: '',
      notes: '',
      phone: '',
    })
  }

  if (bookingSuccess) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-green-800 mb-4">Booking Confirmed!</h2>
          <p className="text-green-700 mb-6">
            Your appointment has been successfully booked. You will receive a confirmation email
            shortly.
          </p>
          <Button onClick={resetBooking}>Book Another Appointment</Button>
        </div>
      </div>
    )
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
              isAuthenticated={isAuthenticated}
              isGuest={isGuest}
              setCustomerDetails={setCustomerDetails}
              setIsGuest={setIsGuest}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4 md:gap-8 mt-6">
        <div className="col-span-12 md:col-span-8 md:col-start-5 flex flex-col gap-2">
          {bookingError && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-2">
              {bookingError}
            </p>
          )}
          <div className="flex justify-between">
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
              <Button disabled={isBookDisabled() || bookingLoading} onClick={handleBooking}>
                {bookingLoading ? 'Booking...' : 'Book now'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookNow
