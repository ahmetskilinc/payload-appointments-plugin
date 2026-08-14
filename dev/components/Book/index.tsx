'use client';

import moment from 'moment';
import { parseAsArrayOf, parseAsBoolean, parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import React, { useMemo, useState } from 'react';

import type { Service, TeamMember } from '../../payload-types';

import {
  createAppointment,
  createGuestAppointment,
} from '../../app/(frontend)/actions/appointment';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import CustomerDetails from './CustomerDetails';
import HostList from './HostList';
import SelectDateTime from './SelectDateTime';
import Selections from './Selections';
import ServicesList from './ServicesList';

const BookNow: React.FC<{
  isAuthenticated: boolean;
  services: Service[];
  teamMembers: TeamMember[];
}> = ({ isAuthenticated, services, teamMembers }) => {
  const [stepIndex, setStepIndex] = useQueryState('step', parseAsInteger.withDefault(0));
  const [serviceIds, setServiceIds] = useQueryState(
    'services',
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const [hostId, setHostId] = useQueryState('host', parseAsString.withDefault(''));
  const [isGuest, setIsGuest] = useQueryState('guest', parseAsBoolean.withDefault(true));
  const [selectedDate, setSelectedDate] = useQueryState(
    'date',
    parseAsString.withDefault(moment().format('YYYY-MM-DD')),
  );
  const [selectedTime, setSelectedTime] = useQueryState('time', parseAsString);

  const chosenServices = useMemo(() => {
    return services.filter((service) => serviceIds.includes(service.id.toString()));
  }, [services, serviceIds]);

  const chosenStaff = useMemo(() => {
    return teamMembers.find((member) => member.id.toString() === hostId) || null;
  }, [teamMembers, hostId]);

  const chosenDateTime = useMemo(() => {
    if (selectedTime) {
      return moment(selectedTime).toDate();
    }
  }, [selectedDate, selectedTime]);

  const setChosenServices = (newServices: Service[] | ((prev: Service[]) => Service[])) => {
    if (typeof newServices === 'function') {
      const updated = newServices(chosenServices);
      setServiceIds(updated.map((s) => s.id.toString()));
    } else {
      setServiceIds(newServices.map((s) => s.id.toString()));
    }
  };

  const setChosenStaff = (staff: TeamMember | null) => {
    setHostId(staff?.id.toString() || '');
  };

  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<{
    email: string;
    firstName: string;
    lastName: string;
    notes: string;
    phone: string;
  }>({
    email: '',
    firstName: '',
    lastName: '',
    notes: '',
    phone: '',
  });

  const nextStep = () => {
    setStepIndex(stepIndex + 1);
    if (window !== undefined) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStepIndex(stepIndex - 1);
    if (window !== undefined) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isContinueDisabled = () => {
    if (stepIndex === 0) {
      return !chosenServices?.length;
    } else if (stepIndex === 1) {
      return !chosenStaff;
    } else if (stepIndex === 2) {
      return !selectedTime;
    }
  };

  const isBookDisabled = () => {
    if (isAuthenticated) {
      return false;
    }
    if (!isGuest) {
      return true;
    }
    return (
      !customerDetails.firstName ||
      !customerDetails.lastName ||
      !customerDetails.email ||
      !customerDetails.phone
    );
  };

  const handleBooking = async () => {
    setBookingLoading(true);
    setBookingError(null);

    try {
      let result;

      if (isAuthenticated) {
        result = await createAppointment(
          chosenStaff as TeamMember,
          chosenServices,
          chosenDateTime as Date,
          customerDetails.notes || undefined,
        );
      } else if (isGuest) {
        result = await createGuestAppointment(
          chosenStaff as TeamMember,
          chosenServices,
          chosenDateTime as Date,
          {
            email: customerDetails.email,
            firstName: customerDetails.firstName,
            lastName: customerDetails.lastName,
            phone: customerDetails.phone,
          },
          customerDetails.notes || undefined,
        );
      } else {
        setBookingError('Please sign in or continue as a guest');
        setBookingLoading(false);
        return;
      }

      if (result.success) {
        setBookingSuccess(true);
      } else {
        setBookingError(result.message);
      }
    } catch (error) {
      console.error(error);
      setBookingError('An error occurred while booking your appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const resetBooking = () => {
    setBookingSuccess(false);
    setStepIndex(0);
    setServiceIds([]);
    setHostId('');
    setSelectedDate(moment().format('YYYY-MM-DD'));
    setSelectedTime(null);
    setCustomerDetails({
      email: '',
      firstName: '',
      lastName: '',
      notes: '',
      phone: '',
    });
  };

  if (bookingSuccess) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 animate-scale-in">
        <div className="glass-card p-10">
          <div className="mx-auto w-20 h-20 rounded-full bg-linear-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-8 shadow-2xl shadow-green-500/30 animate-float">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Booking Confirmed!</h2>
          <p className="text-gray-500 mb-8 text-lg">
            Your appointment has been successfully booked. You&apos;ll receive a confirmation email
            shortly with all the details.
          </p>
          <Button
            onClick={resetBooking}
            size="lg"
            className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-lg shadow-gray-900/25 hover:shadow-xl hover:shadow-gray-900/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Book Another Appointment
          </Button>
        </div>
      </div>
    );
  }

  const steps = [
    { title: 'Services', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    {
      title: 'Host',
      icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
    },
    {
      title: 'Date & Time',
      icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
    },
    {
      title: 'Details',
      icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="hidden md:flex items-center justify-center mb-10">
        {steps.map((step, index) => (
          <React.Fragment key={step.title}>
            <button
              onClick={() => {
                if (index < stepIndex) setStepIndex(index);
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 pl-2 rounded-full transition-all duration-300',
                index === stepIndex
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/25'
                  : index < stepIndex
                    ? 'bg-gray-100 text-gray-900 cursor-pointer hover:bg-gray-200'
                    : 'bg-gray-100 text-gray-400',
              )}
              disabled={index > stepIndex}
            >
              <span
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                  index === stepIndex
                    ? 'bg-white/20'
                    : index < stepIndex
                      ? 'bg-gray-200'
                      : 'bg-gray-200',
                )}
              >
                {index < stepIndex ? (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span className="text-sm font-medium">{step.title}</span>
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-12 h-0.5 mx-2 transition-colors duration-300',
                  index < stepIndex ? 'bg-gray-400' : 'bg-gray-200',
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6 md:gap-10">
        <Selections
          chosenDateTime={chosenDateTime as Date}
          chosenServices={chosenServices}
          chosenStaff={chosenStaff}
          setStepIndex={setStepIndex}
        />
        <div className="col-span-12 md:col-span-8">
          <div className="flex justify-between items-start mb-6">
            {stepIndex === 0 ? (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-xl bg-gray-900 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-gray-900/25">
                    1
                  </span>
                  <h2 className="text-xl font-bold text-gray-900">Choose your services</h2>
                </div>
                <p className="text-gray-500 ml-11">
                  Select one or more services for your appointment
                </p>
              </div>
            ) : stepIndex === 1 ? (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-xl bg-gray-900 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-gray-900/25">
                    2
                  </span>
                  <h2 className="text-xl font-bold text-gray-900">Select your host</h2>
                </div>
                <p className="text-gray-500 ml-11">Choose who you&apos;d like to see</p>
              </div>
            ) : stepIndex === 2 ? (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-xl bg-gray-900 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-gray-900/25">
                    3
                  </span>
                  <h2 className="text-xl font-bold text-gray-900">Pick a date & time</h2>
                </div>
                <p className="text-gray-500 ml-11">Select an available slot that works for you</p>
              </div>
            ) : stepIndex === 3 ? (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-xl bg-gray-900 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-gray-900/25">
                    4
                  </span>
                  <h2 className="text-xl font-bold text-gray-900">Your details</h2>
                </div>
                <p className="text-gray-500 ml-11">Complete your booking information</p>
              </div>
            ) : null}
          </div>
          <div className={cn(stepIndex === 0 ? 'block animate-fade-in-up' : 'hidden')}>
            <ServicesList
              chosenServices={chosenServices}
              services={services}
              setChosenServices={setChosenServices}
            />
          </div>

          <div className={cn(stepIndex === 1 ? 'block animate-fade-in-up' : 'hidden')}>
            <HostList
              chosenStaff={chosenStaff}
              setChosenStaff={setChosenStaff}
              teamMembers={teamMembers}
            />
          </div>

          <div className={cn(stepIndex === 2 ? 'block animate-fade-in-up' : 'hidden')}>
            {stepIndex === 2 ? (
              <SelectDateTime
                chosenServices={chosenServices}
                chosenStaff={chosenStaff}
                isAuthenticated={isAuthenticated}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                setSelectedDate={setSelectedDate}
                setSelectedTime={setSelectedTime}
              />
            ) : null}
          </div>
          <div className={cn(stepIndex === 3 ? 'block animate-fade-in-up' : 'hidden')}>
            <CustomerDetails
              chosenDateTime={chosenDateTime as Date}
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
            <div className="flex items-center gap-3 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl p-4 animate-scale-in">
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
              {bookingError}
            </div>
          )}
          <div className="flex justify-between">
            {stepIndex !== 0 ? (
              <Button
                onClick={prevStep}
                variant="outline"
                className="border-gray-200 hover:border-gray-300 hover:text-gray-900 transition-all duration-200"
              >
                <svg
                  className="w-4 h-4 mr-1.5"
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
                className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-lg shadow-gray-900/25 hover:shadow-xl hover:shadow-gray-900/30 transition-all duration-300 hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:opacity-50"
              >
                Continue
                <svg
                  className="w-4 h-4 ml-1.5"
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
                size="lg"
                className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-lg shadow-gray-900/25 hover:shadow-xl hover:shadow-gray-900/30 transition-all duration-300 hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:opacity-50"
              >
                {bookingLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Booking...
                  </span>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-1.5"
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
                    Confirm Booking
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookNow;
