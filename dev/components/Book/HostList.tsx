'use client'

import React from 'react'

import type { TeamMember } from '../../payload-types'

import { cn } from '../../lib/utils'

const HostList: React.FC<{
  chosenStaff: null | TeamMember
  setChosenStaff: React.Dispatch<React.SetStateAction<null | TeamMember>>
  teamMembers: TeamMember[]
}> = ({ chosenStaff, setChosenStaff, teamMembers }) => {
  return (
    <div className="space-y-3">
      {teamMembers.map((staff) => {
        const isSelected = chosenStaff?.id === staff.id
        const isDisabled = !staff.takingAppointments
        return (
          <label
            className={cn(
              'relative flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2',
              isDisabled && 'opacity-50 cursor-not-allowed',
              isSelected
                ? 'border-violet-500 bg-violet-50/50 shadow-sm'
                : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm',
            )}
            htmlFor={staff.preferredNameAppointments}
            key={staff.id}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                isSelected
                  ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600',
              )}
            >
              {staff.preferredNameAppointments?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {staff.preferredNameAppointments}
              </p>
              {isDisabled && <p className="text-xs text-gray-500">Not available</p>}
            </div>
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                isSelected ? 'border-violet-500 bg-violet-500' : 'border-gray-300',
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
                setChosenStaff(staff)
              }}
              type="radio"
              value={staff.toString()}
            />
          </label>
        )
      })}
    </div>
  )
}

export default HostList
