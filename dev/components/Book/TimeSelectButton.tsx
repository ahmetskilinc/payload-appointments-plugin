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
  return (
    <button
      className={cn(
        'bg-indigo-500 py-2.5 hover:bg-indigo-600 text-white rounded-sm cursor-pointer',
        'tabular-nums',
        'transition-colors',
        'text-sm',
        moment(availability).format('HH:mm') === moment(chosenDateTime).format('HH:mm')
          ? 'bg-red-500 hover:bg-red-600'
          : null,
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
