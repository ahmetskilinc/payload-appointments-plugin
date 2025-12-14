import moment from 'moment'
import React from 'react'

import type { Service, TeamMember } from '../../payload-types'

import { formatPrice } from '../../lib/formatPrice'

const SelectionsList: React.FC<{
  chosenDateTime?: Date | null
  chosenServices?: null | Service[]
  chosenStaff: null | TeamMember
  setStepIndex: (value: number) => void
}> = ({ chosenDateTime, chosenServices, chosenStaff, setStepIndex }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {chosenDateTime ? (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Date & time
              </p>
              <button
                className="text-xs font-medium text-violet-600 hover:text-violet-700"
                onClick={() => setStepIndex(2)}
                type="button"
              >
                Edit
              </button>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {moment(chosenDateTime).format('dddd, Do MMMM YYYY')}
              {moment(chosenDateTime).isAfter(moment(chosenDateTime).startOf('day')) &&
              moment(chosenDateTime).isSame(moment(), 'hour') === false ? (
                <span className="text-violet-600">
                  {' '}
                  at {moment(chosenDateTime).format('HH:mm')}
                </span>
              ) : null}
            </p>
          </div>
        ) : null}

        {chosenServices?.length ? (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Service{chosenServices?.length > 1 ? 's' : ''}
              </p>
              <button
                className="text-xs font-medium text-violet-600 hover:text-violet-700"
                onClick={() => setStepIndex(0)}
                type="button"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2">
              {chosenServices.map((service) => (
                <div className="flex items-center justify-between" key={service.id}>
                  <span className="text-sm text-gray-900">{service.title}</span>
                  <span className="text-xs text-gray-500">{service.duration} mins</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {chosenStaff ? (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Host</p>
              <button
                className="text-xs font-medium text-violet-600 hover:text-violet-700"
                onClick={() => setStepIndex(1)}
                type="button"
              >
                Edit
              </button>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {chosenStaff.preferredNameAppointments}
            </p>
          </div>
        ) : null}

        {chosenServices?.length ? (
          <div className="p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Total</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatPrice(chosenServices.reduce((acc, { price }) => acc + Number(price), 0))}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {!chosenStaff && !chosenServices?.length && !chosenDateTime ? (
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-gray-500 text-sm">No selections yet</p>
        </div>
      ) : null}
    </div>
  )
}

export default SelectionsList
