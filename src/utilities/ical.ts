import moment from 'moment';

import type { Appointment, Recurrence } from '../types';

const escapeICalText = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

const formatICalDate = (date: Date): string => {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
};

const foldLine = (line: string): string => {
  const maxLength = 75;
  if (line.length <= maxLength) {
    return line;
  }

  const result: string[] = [];
  let remaining = line;

  while (remaining.length > maxLength) {
    result.push(remaining.substring(0, maxLength));
    remaining = ' ' + remaining.substring(maxLength);
  }

  if (remaining.length > 0) {
    result.push(remaining);
  }

  return result.join('\r\n');
};

export type ICalEvent = {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  status?: 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED';
  organizer?: {
    name: string;
    email?: string;
  };
  attendee?: {
    name: string;
    email?: string;
  };
  /** RRULE value (without the `RRULE:` prefix) for a recurring master event. */
  rrule?: string;
  /** Occurrence start times excluded from the recurrence (cancelled slots). */
  exdates?: Date[];
};

const generateVEvent = (event: ICalEvent): string => {
  const lines: string[] = [
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${formatICalDate(new Date())}`,
    `DTSTART:${formatICalDate(event.start)}`,
    `DTEND:${formatICalDate(event.end)}`,
    `SUMMARY:${escapeICalText(event.summary)}`,
  ];

  if (event.rrule) {
    lines.push(`RRULE:${event.rrule}`);
  }

  if (event.exdates && event.exdates.length > 0) {
    lines.push(`EXDATE:${event.exdates.map(formatICalDate).join(',')}`);
  }

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICalText(event.description)}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeICalText(event.location)}`);
  }

  if (event.status) {
    lines.push(`STATUS:${event.status}`);
  }

  if (event.organizer) {
    const organizerLine = event.organizer.email
      ? `ORGANIZER;CN=${escapeICalText(event.organizer.name)}:mailto:${event.organizer.email}`
      : `ORGANIZER;CN=${escapeICalText(event.organizer.name)}`;
    lines.push(organizerLine);
  }

  if (event.attendee) {
    const attendeeLine = event.attendee.email
      ? `ATTENDEE;CN=${escapeICalText(event.attendee.name)}:mailto:${event.attendee.email}`
      : `ATTENDEE;CN=${escapeICalText(event.attendee.name)}`;
    lines.push(attendeeLine);
  }

  lines.push('END:VEVENT');

  return lines.map(foldLine).join('\r\n');
};

export const appointmentToICalEvent = (appointment: Appointment, baseUrl: string): ICalEvent => {
  const host = appointment.host;
  const customer = appointment.customer || appointment.guestCustomer;

  let summary = 'Appointment';
  if (appointment.services && appointment.services.length > 0) {
    summary = appointment.services.map((s) => s.title).join(', ');
  } else if (appointment.title) {
    summary = appointment.title;
  }

  let description = '';
  if (customer) {
    const customerName =
      'firstName' in customer
        ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
        : 'Guest';
    description += `Customer: ${customerName}\n`;
  }
  if (appointment.customerNotes) {
    description += `Notes: ${appointment.customerNotes}\n`;
  }

  const hostName =
    host.preferredNameAppointments ||
    `${host.firstName || ''} ${host.lastName || ''}`.trim() ||
    'Host';

  let status: ICalEvent['status'] = 'CONFIRMED';
  if (appointment.status === 'cancelled') {
    status = 'CANCELLED';
  } else if (appointment.status === 'pending') {
    status = 'TENTATIVE';
  }

  return {
    uid: `${appointment.id}@${new URL(baseUrl).hostname}`,
    summary,
    description: description.trim() || undefined,
    start: new Date(appointment.start),
    end: new Date(appointment.end),
    status,
    organizer: {
      name: hostName,
      email: host.email,
    },
    attendee: customer
      ? {
          name:
            'firstName' in customer
              ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
              : 'Guest',
          email: 'email' in customer ? customer.email : undefined,
        }
      : undefined,
  };
};

const FREQ_BY_PATTERN: Record<string, string> = {
  biweekly: 'FREQ=WEEKLY;INTERVAL=2',
  monthly: 'FREQ=MONTHLY',
  weekly: 'FREQ=WEEKLY',
};

/** RRULE value for a series, or null when no bounded rule can be built. */
export const rruleForRecurrence = (recurrence: Recurrence | undefined): string | null => {
  const freq = recurrence?.pattern ? FREQ_BY_PATTERN[recurrence.pattern] : undefined;
  if (!freq) {
    return null;
  }
  if (recurrence?.endType === 'endDate' && recurrence.endDate) {
    return `${freq};UNTIL=${formatICalDate(moment(recurrence.endDate).endOf('day').toDate())}`;
  }
  if (recurrence?.occurrences) {
    return `${freq};COUNT=${recurrence.occurrences}`;
  }
  return null;
};

const stepForPattern = (start: moment.Moment, pattern: string): moment.Moment => {
  switch (pattern) {
    case 'biweekly':
      return start.clone().add(2, 'weeks');
    case 'monthly':
      return start.clone().add(1, 'month');
    default:
      return start.clone().add(1, 'week');
  }
};

/**
 * Collapses one recurring series into a master event with an RRULE, EXDATEs
 * for expected-but-missing (cancelled) occurrences inside the feed window, and
 * standalone events for occurrences that were individually rescheduled off the
 * series pattern.
 */
const seriesToEvents = (
  series: Appointment[],
  baseUrl: string,
  window?: { end: Date; start: Date },
): ICalEvent[] => {
  const sorted = [...series].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );
  const master = sorted[0];
  const rrule = rruleForRecurrence(master.recurrence);

  if (!rrule) {
    return sorted.map((a) => appointmentToICalEvent(a, baseUrl));
  }

  // Expected occurrence starts, walked from the (earliest fetched) master.
  const pattern = master.recurrence?.pattern ?? 'weekly';
  const maxCount = master.recurrence?.occurrences ?? 52;
  const untilMoment =
    master.recurrence?.endType === 'endDate' && master.recurrence.endDate
      ? moment(master.recurrence.endDate).endOf('day')
      : null;
  const windowEnd = window ? moment(window.end) : moment(sorted[sorted.length - 1].start);

  const expected: moment.Moment[] = [];
  let cursor = moment(master.start);
  while (
    expected.length < maxCount &&
    cursor.isSameOrBefore(windowEnd) &&
    (!untilMoment || cursor.isSameOrBefore(untilMoment))
  ) {
    expected.push(cursor.clone());
    cursor = stepForPattern(cursor, pattern);
  }

  const byStart = new Map(sorted.map((a) => [new Date(a.start).toISOString(), a]));
  const matchedIds = new Set<string>();
  const exdates: Date[] = [];

  for (const time of expected) {
    const match = byStart.get(time.toISOString());
    if (match) {
      matchedIds.add(String(match.id));
    } else {
      exdates.push(time.toDate());
    }
  }

  // Occurrences moved off the pattern are emitted as their own events.
  const offPattern = sorted.filter((a) => !matchedIds.has(String(a.id)));

  const masterEvent: ICalEvent = {
    ...appointmentToICalEvent(master, baseUrl),
    // A stable series UID so calendar clients treat the rule as one event.
    uid: `${master.recurrence?.seriesId}@${new URL(baseUrl).hostname}`,
    rrule,
    exdates,
  };

  return [masterEvent, ...offPattern.map((a) => appointmentToICalEvent(a, baseUrl))];
};

export const generateICalFeed = (
  appointments: Appointment[],
  calendarName: string,
  baseUrl: string,
  window?: { end: Date; start: Date },
): string => {
  const relevant = appointments.filter((a) => a.appointmentType === 'appointment');

  const singles: Appointment[] = [];
  const seriesById = new Map<string, Appointment[]>();
  for (const appointment of relevant) {
    const seriesId = appointment.recurrence?.isRecurring
      ? appointment.recurrence.seriesId
      : undefined;
    if (seriesId) {
      seriesById.set(seriesId, [...(seriesById.get(seriesId) ?? []), appointment]);
    } else {
      singles.push(appointment);
    }
  }

  const events = [
    ...singles.map((a) => appointmentToICalEvent(a, baseUrl)),
    ...[...seriesById.values()].flatMap((series) => seriesToEvents(series, baseUrl, window)),
  ];

  const vcalendar: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Payload Appointments Plugin//EN',
    `X-WR-CALNAME:${escapeICalText(calendarName)}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const event of events) {
    vcalendar.push(generateVEvent(event));
  }

  vcalendar.push('END:VCALENDAR');

  return vcalendar.join('\r\n');
};
