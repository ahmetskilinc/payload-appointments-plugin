import moment from 'moment';

export const formatAppointmentDate = (date: Date | string): string => {
  return moment(date).format('dddd, MMMM D, YYYY [at] h:mm A');
};

export const formatTimeSlot = (time: Date | string): string => {
  return moment(time).format('h:mm A');
};

export const isValidAppointmentDate = (date: Date | string): boolean => {
  const appointmentDate = moment(date);
  const now = moment();

  if (appointmentDate.isBefore(now.add(30, 'minutes'))) {
    return false;
  }

  if (appointmentDate.isAfter(now.add(1, 'year'))) {
    return false;
  }

  return true;
};

export const getDaysBetweenDates = (startDate: Date | string, endDate: Date | string): number => {
  const start = moment(startDate).startOf('day');
  const end = moment(endDate).startOf('day');
  return end.diff(start, 'days');
};

export const formatInTimezone = (
  date: Date | string,
  timezone: string,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  };
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
};

export const formatDateInTimezone = (date: Date | string, timezone: string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timezone,
  }).format(dateObj);
};

export const formatTimeRangeInTimezone = (
  start: Date | string,
  end: Date | string,
  timezone: string,
): string => {
  const startFormatted = formatInTimezone(start, timezone);
  const endFormatted = formatInTimezone(end, timezone);
  return `${startFormatted} - ${endFormatted}`;
};

export const getTimezoneAbbreviation = (date: Date | string, timezone: string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short',
  }).formatToParts(dateObj);
  const tzPart = parts.find((part) => part.type === 'timeZoneName');
  return tzPart?.value || timezone;
};
