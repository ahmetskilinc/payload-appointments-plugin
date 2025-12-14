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
  const [selectedDate, setSelectedDate] = useQueryState(
    'date',
    parseAsString.withDefault(moment().format('YYYY-MM-DD')),
  )
  const [selectedTime, setSelectedTime] = useQueryState('time', parseAsString)

  const chosenServices = useMemo(() => {
    return services.filter((service) => serviceIds.includes(service.id.toString()))
  }, [services, serviceIds])

  const chosenStaff = useMemo(() => {
    return teamMembers.find((member) => member.id.toString() === hostId) || null
  }, [teamMembers, hostId])

  const chosenDateTime = useMemo(() => {
    if (selectedTime) {
      return moment(selectedTime).toDate()
    }
    return moment(selectedDate).toDate()
  }, [selectedDate, selectedTime])

  const setChosenServices = (newServices: Service[] | ((prev: Service[]) => Service[])) => {
    if (typeof newServices === 'function') {
      const updated = newServices(chosenServices)
      setServiceIds(updated.map((s) => s.id.toString()))
    } else {
      setServiceIds(newServices.map((s) => s.id.toString()))
    }
  }

  const setChosenStaff = (staff: TeamMember | null) => {
    setHostId(staff?.id.toString() || '')
  }

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
      return !selectedTime
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
    setSelectedDate(moment().format('YYYY-MM-DD'))
    setSelectedTime(null)
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
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/50 border-0">
          <div className="mx-auto w-16 h-16 rounded-full bg-linear-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-green-500/25">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-500 mb-8">
            Your appointment has been successfully booked. You&apos;ll receive a confirmation email
            shortly with all the details.
          </p>
          <Button
            onClick={resetBooking}
            className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
          >
            Book Another Appointment
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-12 gap-6 md:gap-10">
        <Selections
          chosenDateTime={chosenDateTime}
          chosenServices={chosenServices}
          chosenStaff={chosenStaff}
          setStepIndex={setStepIndex}
        />
        <div className="col-span-12 md:col-span-8">
          <div className="flex justify-between items-start mb-6">
            {stepIndex === 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs font-semibold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-lg font-semibold text-gray-900">Choose your services</h2>
                </div>
                <p className="text-sm text-gray-500 ml-8">
                  Select one or more services for your appointment
                </p>
              </div>
            ) : stepIndex === 1 ? (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs font-semibold flex items-center justify-center">
                    2
                  </span>
                  <h2 className="text-lg font-semibold text-gray-900">Select your host</h2>
                </div>
                <p className="text-sm text-gray-500 ml-8">Choose who you&apos;d like to see</p>
              </div>
            ) : stepIndex === 2 ? (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs font-semibold flex items-center justify-center">
                    3
                  </span>
                  <h2 className="text-lg font-semibold text-gray-900">Pick a date & time</h2>
                </div>
                <p className="text-sm text-gray-500 ml-8">
                  Select an available slot that works for you
                </p>
              </div>
            ) : stepIndex === 3 ? (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs font-semibold flex items-center justify-center">
                    4
                  </span>
                  <h2 className="text-lg font-semibold text-gray-900">Your details</h2>
                </div>
                <p className="text-sm text-gray-500 ml-8">Complete your booking information</p>
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
                chosenServices={chosenServices}
                chosenStaff={chosenStaff}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                setSelectedDate={setSelectedDate}
                setSelectedTime={setSelectedTime}
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
      <div className="grid grid-cols-12 gap-6 md:gap-10 mt-8">
        <div className="col-span-12 md:col-span-8 md:col-start-5 flex flex-col gap-3">
          {bookingError && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg p-3">
              <svg
                className="w-4 h-4 shrink-0"
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
              {bookingError}
            </div>
          )}
          <div className="flex justify-between">
            {stepIndex !== 0 ? (
              <Button onClick={prevStep} variant="outline" className="border-gray-200">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
                Back
              </Button>
            ) : (
              <span />
            )}
            {stepIndex <= 2 ? (
              <Button
                disabled={isContinueDisabled()}
                onClick={nextStep}
                className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
              >
                Continue
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </Button>
            ) : (
              <Button
                disabled={isBookDisabled() || bookingLoading}
                onClick={handleBooking}
                className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
              >
                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookNow
