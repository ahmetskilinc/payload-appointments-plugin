import moment from 'moment';
import React from 'react';

import { cn } from '../../lib/utils';

const TimeSelectButton = ({
  availability,
  selectedTime,
  setSelectedTime,
}: {
  availability: string;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;
}) => {
  const isSelected =
    selectedTime && moment(availability).format('HH:mm') === moment(selectedTime).format('HH:mm');

  return (
    <button
      className={cn(
        'py-3 px-4 rounded-xl cursor-pointer font-semibold',
        'tabular-nums',
        'transition-all duration-300',
        'text-sm',
        isSelected
          ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/25 scale-105'
          : 'bg-white border-2 border-gray-100 text-gray-700 hover:border-gray-300 hover:text-gray-900 hover:shadow-md hover:-translate-y-0.5',
      )}
      key={JSON.stringify(availability)}
      onClick={() => setSelectedTime(availability)}
      type="button"
    >
      {moment(availability).format('HH:mm')}
    </button>
  );
};

export default TimeSelectButton;
