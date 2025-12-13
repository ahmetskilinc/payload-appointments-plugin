'use client'

import React from 'react'

import type { TeamMember } from '../../payload-types'

const HostList: React.FC<{
  chosenStaff: null | TeamMember
  setChosenStaff: React.Dispatch<React.SetStateAction<null | TeamMember>>
  teamMembers: TeamMember[]
}> = ({ setChosenStaff, teamMembers }) => {
  return (
    <div className="space-y-6">
      <div className="divide-y divide-gray-100 overflow-hidden bg-white shadow-none md:shadow-sm ring-1 ring-gray-900/5">
        {teamMembers.map((staff) => (
          <label
            className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6 cursor-pointer disabled:bg-black"
            htmlFor={staff.preferredNameAppointments}
            key={staff.id}
          >
            <div className="flex min-w-0 gap-x-4">
              <div className="min-w-0 flex-auto">
                <p className="text-sm font-semibold leading-6 text-gray-900">
                  {staff.preferredNameAppointments}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-x-4">
              <input
                defaultChecked={false}
                disabled={!staff.takingAppointments}
                id={staff.preferredNameAppointments}
                name="selected-barber"
                onChange={() => {
                  setChosenStaff(staff)
                }}
                type="radio"
                value={staff.toString()}
              />
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

export default HostList
