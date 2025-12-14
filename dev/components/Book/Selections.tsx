'use client';

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import React from 'react';

import type { Service, TeamMember } from '../../payload-types';

import SelectionsList from './SelectionsList';

const Selections: React.FC<{
  chosenDateTime: Date | null;
  chosenServices: Service[];
  chosenStaff: null | TeamMember;
  setStepIndex: (value: number) => void;
}> = ({ chosenDateTime, chosenServices, chosenStaff, setStepIndex }) => {
  return (
    <Disclosure as="div" className="col-span-12 md:col-span-4 mt-0!" defaultOpen={true}>
      {({ open }) => (
        <React.Fragment>
          <DisclosureButton className="flex w-full items-center justify-between text-left text-gray-900 mb-4 md:hidden group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shadow-lg shadow-gray-900/25 group-hover:shadow-gray-500/40 transition-all">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Booking Summary</p>
                <p className="text-xs text-gray-500">Tap to {open ? 'collapse' : 'expand'}</p>
              </div>
            </div>
            <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-100 transition-colors">
              {open ? (
                <MinusIcon
                  aria-hidden="true"
                  className="h-5 w-5 text-gray-500 group-hover:text-gray-900"
                />
              ) : (
                <PlusIcon
                  aria-hidden="true"
                  className="h-5 w-5 text-gray-500 group-hover:text-gray-900"
                />
              )}
            </span>
          </DisclosureButton>
          <div className="hidden md:block">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shadow-lg shadow-gray-900/25">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Booking Summary</p>
                <p className="text-xs text-gray-500">Your selections</p>
              </div>
            </div>
            <SelectionsList
              chosenDateTime={chosenDateTime}
              chosenServices={chosenServices}
              chosenStaff={chosenStaff}
              setStepIndex={setStepIndex}
            />
          </div>
          <DisclosurePanel as="div" className="md:hidden">
            <SelectionsList
              chosenDateTime={chosenDateTime}
              chosenServices={chosenServices}
              chosenStaff={chosenStaff}
              setStepIndex={setStepIndex}
            />
          </DisclosurePanel>
        </React.Fragment>
      )}
    </Disclosure>
  );
};

export default Selections;
