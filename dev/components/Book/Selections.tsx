'use client'

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import React from 'react'

import type { Service, TeamMember } from '../../payload-types'

import SelectionsList from './SelectionsList'

const Selections: React.FC<{
  chosenDateTime: Date | null
  chosenServices: Service[]
  chosenStaff: null | TeamMember
  setStepIndex: (value: number) => void
}> = ({ chosenDateTime, chosenServices, chosenStaff, setStepIndex }) => {
  return (
    <Disclosure as="div" className="col-span-12 md:col-span-4 !mt-0" defaultOpen={true}>
      {({ open }) => (
        <React.Fragment>
          <DisclosureButton className="flex w-full items-start justify-between text-left text-gray-900">
            <p className="text-base md:mb-4">Your selection</p>
            <span className="ml-6 flex h-7 items-center md:hidden">
              {open ? (
                <MinusIcon aria-hidden="true" className="block h-6 w-6 md:hidden" />
              ) : (
                <PlusIcon aria-hidden="true" className="block h-6 w-6 md:hidden" />
              )}
            </span>
          </DisclosureButton>
          <DisclosurePanel as="div" className="space-y-4">
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
  )
}

export default Selections
