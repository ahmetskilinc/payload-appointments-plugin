import moment from 'moment'
import React from 'react'

import { cn } from '../../lib/utils'

const TimeSelectButton = ({
  availability,
  chosenDateTime,
  setChosenDateTime,
}: {
  availability: string
  chosenDateTime: Date
  setChosenDateTime: React.Dispatch<React.SetStateAction<Date>>
}) => {
  const isSelected = moment(availability).format('HH:mm') === moment(chosenDateTime).format('HH:mm')

  return (
    <button
      className={cn(
        'py-2.5 px-3 rounded-lg cursor-pointer font-medium',
        'tabular-nums',
        'transition-all duration-200',
        'text-sm',
        isSelected
          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25'
          : 'bg-white border border-gray-200 text-gray-700 hover:border-violet-300 hover:text-violet-600',
      )}
      key={JSON.stringify(availability)}
      onClick={() => setChosenDateTime(moment(availability).toDate())}
      type="button"
    >
      {moment(availability).format('HH:mm')}
    </button>
  )
}

export default TimeSelectButton
