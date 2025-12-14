'use client';

import React from 'react';

import type { TeamMember } from '../../payload-types';

import { cn } from '../../lib/utils';

const HostList: React.FC<{
  chosenStaff: null | TeamMember;
  setChosenStaff: (staff: TeamMember | null) => void;
  teamMembers: TeamMember[];
}> = ({ chosenStaff, setChosenStaff, teamMembers }) => {
  return (
    <div className="space-y-3">
      {teamMembers.map((staff, index) => {
        const isSelected = chosenStaff?.id.toString() === staff.id.toString();
        const isDisabled = !staff.takingAppointments;
        return (
          <label
            className={cn(
              'relative flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 group',
              isDisabled && 'opacity-50 cursor-not-allowed',
              isSelected
                ? 'border-gray-500 bg-gradient-to-br bg-gray-50 shadow-lg shadow-gray-500/10'
                : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg hover:shadow-gray-900/5 hover:-translate-y-0.5',
            )}
            htmlFor={staff.preferredNameAppointments}
            key={staff.id}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div
              className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-300',
                isSelected
                  ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/30'
                  : 'bg-gradient-to-br bg-gray-100 text-gray-500 group-hover:from-gray-100 group-hover:to-slate-100 group-hover:text-gray-900',
              )}
            >
              {staff.preferredNameAppointments?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-gray-900">
                {staff.preferredNameAppointments}
              </p>
              {isDisabled ? (
                <p className="text-sm text-gray-400 mt-0.5">Currently unavailable</p>
              ) : (
                <p className="text-sm text-emerald-600 mt-0.5 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Available for bookings
                </p>
              )}
            </div>
            <div
              className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                isSelected
                  ? 'border-gray-500 bg-gray-900 shadow-lg shadow-gray-900/25'
                  : 'border-gray-300 group-hover:border-gray-300',
              )}
            >
              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <input
              className="sr-only"
              checked={isSelected}
              disabled={isDisabled}
              id={staff.preferredNameAppointments}
              name="selected-barber"
              onChange={() => {
                setChosenStaff(staff);
              }}
              type="radio"
              value={staff.toString()}
            />
          </label>
        );
      })}
    </div>
  );
};

export default HostList;
