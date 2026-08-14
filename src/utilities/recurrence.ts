import moment from 'moment';

export const MAX_OCCURRENCES = 52;

export type RecurrencePattern = 'weekly' | 'biweekly' | 'monthly';

const getNextDate = (currentDate: moment.Moment, pattern: RecurrencePattern): moment.Moment => {
  switch (pattern) {
    case 'weekly':
      return currentDate.clone().add(1, 'week');
    case 'biweekly':
      return currentDate.clone().add(2, 'weeks');
    case 'monthly':
      return currentDate.clone().add(1, 'month');
    default:
      return currentDate.clone().add(1, 'week');
  }
};

/**
 * Dates of the follow-up occurrences in a recurring series (the first
 * occurrence — the original appointment — is not included).
 *
 * - `endType: 'occurrences'`: returns `occurrences - 1` dates (capped at
 *   MAX_OCCURRENCES total).
 * - `endType: 'endDate'`: returns dates up to and including `endDate`
 *   (capped at MAX_OCCURRENCES total, and at 1 year when no endDate given).
 */
export const calculateOccurrenceDates = (
  startDate: moment.Moment,
  pattern: RecurrencePattern,
  endType: 'occurrences' | 'endDate',
  occurrences?: number,
  endDate?: string,
): moment.Moment[] => {
  const dates: moment.Moment[] = [];
  let currentDate = startDate.clone();

  const maxTotal =
    endType === 'occurrences'
      ? Math.min(occurrences || MAX_OCCURRENCES, MAX_OCCURRENCES)
      : MAX_OCCURRENCES;
  const maxEndDate = endDate ? moment(endDate).endOf('day') : startDate.clone().add(1, 'year');

  while (dates.length < maxTotal - 1) {
    currentDate = getNextDate(currentDate, pattern);

    if (endType === 'endDate' && currentDate.isAfter(maxEndDate)) {
      break;
    }

    dates.push(currentDate.clone());
  }

  return dates;
};
