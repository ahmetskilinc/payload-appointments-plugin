import React from 'react';

import type { Service } from '../../payload-types';

import { cn } from '../../lib/utils';
import { formatPrice } from '../../lib/formatPrice';

const ServicesList: React.FC<{
  chosenServices: Service[];
  services: Service[];
  setChosenServices: React.Dispatch<React.SetStateAction<Service[]>>;
}> = ({ chosenServices, services, setChosenServices }) => {
  return (
    <div className="space-y-3">
      {services.map((service, index) => {
        const isSelected = chosenServices.some((s) => s.id === service.id);
        return (
          <label
            className={cn(
              'relative flex items-center justify-between gap-x-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 group',
              isSelected
                ? 'border-gray-500 bg-gradient-to-br bg-gray-50 shadow-lg shadow-gray-500/10'
                : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg hover:shadow-gray-900/5 hover:-translate-y-0.5',
            )}
            htmlFor={service.id.toString()}
            key={service.id}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300',
                  isSelected
                    ? 'bg-gray-900 shadow-lg shadow-gray-900/25'
                    : 'bg-gray-100 group-hover:bg-gray-100',
                )}
              >
                <svg
                  className={cn(
                    'w-6 h-6 transition-colors duration-300',
                    isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-500',
                  )}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">{service.title}</p>
                <p className="mt-1 text-sm text-gray-500 flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {formatPrice(Number(service.price?.toString().slice(0, 2)))}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>{service.duration} min</span>
                </p>
              </div>
            </div>
            <div
              className={cn(
                'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300',
                isSelected
                  ? 'border-gray-500 bg-gray-900 shadow-lg shadow-gray-900/25'
                  : 'border-gray-300 group-hover:border-gray-300',
              )}
            >
              {isSelected && (
                <svg
                  className="w-3.5 h-3.5 text-white"
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
                    setChosenServices((prevState) => [...prevState, service]);
                  } else {
                    setChosenServices((prevState) => [
                      ...prevState.filter((prevStateService) => prevStateService.id !== service.id),
                    ]);
                  }
                } else {
                  setChosenServices([service]);
                }
              }}
              type="checkbox"
            />
          </label>
        );
      })}
    </div>
  );
};

export default ServicesList;
