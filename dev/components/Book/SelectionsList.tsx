import moment from 'moment';
import React from 'react';

import type { Service, TeamMember } from '../../payload-types';

import { formatPrice } from '../../lib/formatPrice';

const SelectionsList: React.FC<{
  chosenDateTime?: Date | null;
  chosenServices?: null | Service[];
  chosenStaff: null | TeamMember;
  setStepIndex: (value: number) => void;
}> = ({ chosenDateTime, chosenServices, chosenStaff, setStepIndex }) => {
  return (
    <div className="space-y-4">
      <div className="glass-card overflow-hidden">
        {chosenServices?.length ? (
          <div className="p-5 border-b border-gray-100/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br bg-gray-100 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-gray-900"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                    />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Service{chosenServices?.length > 1 ? 's' : ''}
                </p>
              </div>
              <button
                className="text-xs font-semibold text-gray-900 hover:text-gray-500 transition-colors"
                onClick={() => setStepIndex(0)}
                type="button"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2">
              {chosenServices.map((service) => (
                <div className="flex items-center justify-between" key={service.id}>
                  <span className="text-sm font-medium text-gray-900">{service.title}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                    {service.duration} min
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {chosenStaff ? (
          <div className="p-5 border-b border-gray-100/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br bg-gray-100 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-gray-900"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Host</p>
              </div>
              <button
                className="text-xs font-semibold text-gray-900 hover:text-gray-500 transition-colors"
                onClick={() => setStepIndex(1)}
                type="button"
              >
                Edit
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white font-bold text-sm">
                {chosenStaff.preferredNameAppointments?.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {chosenStaff.preferredNameAppointments}
              </p>
            </div>
          </div>
        ) : null}

        {chosenDateTime ? (
          <div className="p-5 border-b border-gray-100/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br bg-gray-100 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-gray-900"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date & time
                </p>
              </div>
              <button
                className="text-xs font-semibold text-gray-900 hover:text-gray-500 transition-colors"
                onClick={() => setStepIndex(2)}
                type="button"
              >
                Edit
              </button>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {moment(chosenDateTime).format('dddd, Do MMMM YYYY')}
              {moment(chosenDateTime).isAfter(moment(chosenDateTime).startOf('day')) &&
              moment(chosenDateTime).isSame(moment(), 'hour') === false ? (
                <span className="text-gray-900 ml-1">
                  at {moment(chosenDateTime).format('HH:mm')}
                </span>
              ) : null}
            </p>
          </div>
        ) : null}

        {chosenServices?.length ? (
          <div className="p-5 bg-linear-to-br bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Total</p>
              <p className="text-xl font-bold bg-gray-900 bg-clip-text text-transparent">
                {formatPrice(chosenServices.reduce((acc, { price }) => acc + Number(price), 0))}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {!chosenStaff && !chosenServices?.length && !chosenDateTime ? (
        <div className="glass-card p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No selections yet</p>
          <p className="text-gray-400 text-sm mt-1">Start by choosing a service</p>
        </div>
      ) : null}
    </div>
  );
};

export default SelectionsList;
