import moment from 'moment-timezone';

export type SlotWindow = {
  /** ISO instant before which booking is not allowed (lead time), or null. */
  earliestBookableTime: string | null;
};

export type ExistingBooking = {
  end: string;
  start: string;
};

/**
 * Generates bookable slot start times between `openingTime` and `closingTime`
 * (ISO instants). A slot is only emitted when the full `slotDuration` (service
 * duration + buffer, minutes) fits before closing, and when the slot starts
 * after `earliestBookableTime`.
 */
export const curateSlots = (
  slotDuration: number,
  openingTime: string,
  closingTime: string,
  window: SlotWindow,
  now: Date = new Date(),
): string[] => {
  if (slotDuration <= 0) {
    return [];
  }

  const slots: string[] = [];
  const current = moment(openingTime);
  const end = moment(closingTime);
  const earliestBookable = window.earliestBookableTime
    ? moment(window.earliestBookableTime)
    : moment(now);

  while (current.clone().add(slotDuration, 'minutes').isSameOrBefore(end)) {
    if (current.isAfter(earliestBookable)) {
      slots.push(current.toISOString());
    }
    current.add(slotDuration, 'minutes');
  }

  return slots;
};

/**
 * Removes slots that overlap any existing booking. `slotDuration` is in minutes.
 */
export const filterOverlappingSlots = (
  slots: string[],
  slotDuration: number,
  existing: ExistingBooking[],
): string[] => {
  return slots.filter((slot) => {
    const slotStart = moment(slot);
    const slotEnd = slotStart.clone().add(slotDuration, 'minutes');

    return !existing.some((booking) => {
      const bookingStart = moment(booking.start);
      const bookingEnd = moment(booking.end);
      return slotStart.isBefore(bookingEnd) && slotEnd.isAfter(bookingStart);
    });
  });
};

/**
 * Resolves a wall-clock time (taken from a stored time-only date value) on a
 * given calendar day, interpreted in the business timezone. Returns an ISO instant.
 */
export const resolveTimeOnDay = (day: string, timeValue: string, timezone: string): string => {
  // Time-only date fields store a full timestamp; its wall-clock reading in the
  // business timezone is the intended opening/closing hour.
  const time = moment.tz(timeValue, timezone);
  const dayInTz = moment.tz(day, timezone);

  return dayInTz
    .clone()
    .set({
      hour: time.hour(),
      millisecond: 0,
      minute: time.minute(),
      second: 0,
    })
    .toISOString();
};

/** Lowercase day-of-week name for a calendar day, in the business timezone. */
export const dayOfWeekInTimezone = (day: string, timezone: string): string => {
  return moment.tz(day, timezone).format('dddd').toLowerCase();
};
