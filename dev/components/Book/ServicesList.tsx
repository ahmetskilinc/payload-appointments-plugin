import React from 'react'

import type { Service } from '../../payload-types'

import { cn } from '../../lib/utils'
import { formatPrice } from '../../lib/formatPrice'

const ServicesList: React.FC<{
  chosenServices: Service[]
  services: Service[]
  setChosenServices: React.Dispatch<React.SetStateAction<Service[]>>
}> = ({ chosenServices, services, setChosenServices }) => {
  return (
    <div className="space-y-3">
      {services.map((service) => {
        const isSelected = chosenServices.some((s) => s.id === service.id)
        return (
          <label
            className={cn(
              'relative flex items-center justify-between gap-x-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2',
              isSelected
                ? 'border-violet-500 bg-violet-50/50 shadow-sm'
                : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm',
            )}
            htmlFor={service.id.toString()}
            key={service.id}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                  isSelected ? 'bg-violet-100' : 'bg-gray-100',
                )}
              >
                <svg
                  className={cn('w-5 h-5', isSelected ? 'text-violet-600' : 'text-gray-400')}
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
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{service.title}</p>
                <p className="mt-0.5 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">
                    {formatPrice(Number(service.price?.toString().slice(0, 2)))}
                  </span>
                  <span className="mx-1.5">·</span>
                  {service.duration} minutes
                </p>
              </div>
            </div>
            <div
              className={cn(
                'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                isSelected ? 'border-violet-500 bg-violet-500' : 'border-gray-300',
              )}
            >
              {isSelected && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <input
              className="sr-only"
              checked={isSelected}
              id={service.id.toString()}
              name={service.id.toString()}
              onChange={(e) => {
                if (chosenServices) {
                  if (e.target.checked) {
                    setChosenServices((prevState) => [...prevState, service])
                  } else {
                    setChosenServices((prevState) => [
                      ...prevState.filter((prevStateService) => prevStateService.id !== service.id),
                    ])
                  }
                } else {
                  setChosenServices([service])
                }
              }}
              type="checkbox"
            />
          </label>
        )
      })}
    </div>
  )
}

export default ServicesList
