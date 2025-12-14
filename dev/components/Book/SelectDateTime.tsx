'use client';

import moment from 'moment';
import React, { useEffect, useState } from 'react';
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import MoonLoader from 'react-spinners/MoonLoader';

import type { Service, TeamMember } from '../../payload-types';

import { fetchPublic } from '../../lib/api';
import { filterByDateAndPeriod } from '../../lib/filterByDateAndPeriod';
import TimeSelectButton from './TimeSelectButton';

const SelectDateTime: React.FC<{
  chosenServices: Service[];
  chosenStaff: null | TeamMember;
  selectedDate: string;
  selectedTime: string | null;
  setSelectedDate: (date: string) => void;
  setSelectedTime: (time: string | null) => void;
}> = ({
  chosenServices,
  chosenStaff,
  selectedDate,
  selectedTime,
  setSelectedDate,
  setSelectedTime,
}) => {
  const [slots, setSlots] = useState<null | string[]>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const calendarDate = moment(selectedDate).toDate();

  useEffect(() => {
    const services = chosenServices.map((service) => service.id).join(',');
    const day = moment(selectedDate).toISOString();
    const getAvailabilities = async () => {
      setLoading(true);
      const data = await fetchPublic(
        `/api/get-available-appointment-slots?services=${services}&host=${chosenStaff?.id}&day=${day}`,
        {
          method: 'get',
        },
      );

      const slots = await data.json();
      setSlots(slots.filteredSlots);
      setLoading(false);
    };

    void getAvailabilities();
  }, [selectedDate, chosenServices, chosenStaff?.id]);

  const morningSlots = slots ? filterByDateAndPeriod('morning', calendarDate, slots) : [];
  const afternoonSlots = slots ? filterByDateAndPeriod('afternoon', calendarDate, slots) : [];
  const eveningSlots = slots ? filterByDateAndPeriod('evening', calendarDate, slots) : [];

  const handleDateChange = (value: Date) => {
    setSelectedDate(moment(value).format('YYYY-MM-DD'));
    setSelectedTime(null);
  };

  return (
    <div>
      <div className="glass-card overflow-hidden">
        <Calendar
          defaultValue={calendarDate}
          locale="en-GB"
          maxDate={new Date(new Date().setMonth(new Date().getMonth() + 1))}
          maxDetail="month"
          minDate={new Date()}
          minDetail="month"
          onChange={(value) => handleDateChange(new Date(value!.toString()))}
          value={calendarDate}
        />
      </div>
      {!loading ? (
        slots && slots.length > 0 ? (
          <div className="space-y-8 mt-8">
            {morningSlots.length > 0 && (
              <div className="animate-fade-in-up">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-amber-600"
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
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Morning</p>
                    <p className="text-xs text-gray-400">{morningSlots.length} slots available</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                  {morningSlots.map((availability) => (
                    <TimeSelectButton
                      availability={availability}
                      key={availability}
                      selectedTime={selectedTime}
                      setSelectedTime={setSelectedTime}
                    />
                  ))}
                </div>
              </div>
            )}
            {afternoonSlots.length > 0 && (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-orange-600"
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
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Afternoon</p>
                    <p className="text-xs text-gray-400">{afternoonSlots.length} slots available</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                  {afternoonSlots.map((availability) => (
                    <TimeSelectButton
                      availability={availability}
                      key={availability}
                      selectedTime={selectedTime}
                      setSelectedTime={setSelectedTime}
                    />
                  ))}
                </div>
              </div>
            )}
            {eveningSlots.length > 0 && (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-gray-100 flex items-center justify-center">
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
                        d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Evening</p>
                    <p className="text-xs text-gray-400">{eveningSlots.length} slots available</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                  {eveningSlots.map((availability) => (
                    <TimeSelectButton
                      availability={availability}
                      key={availability}
                      selectedTime={selectedTime}
                      setSelectedTime={setSelectedTime}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : slots && slots.length === 0 ? (
          <div className="mt-8 text-center py-12 glass-card animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
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
            </div>
            <p className="text-gray-900 font-semibold text-lg mb-1">No available slots</p>
            <p className="text-gray-500">Try selecting a different date</p>
          </div>
        ) : null
      ) : (
        <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in">
          <MoonLoader color="#374151" size={40} />
          <p className="text-gray-500 font-medium">Loading available times...</p>
        </div>
      )}
    </div>
  );
};

export default SelectDateTime;
