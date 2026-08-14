import type { Appointment } from '../types';

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

export const generateICalFeed = (
  appointments: Appointment[],
  calendarName: string,
  baseUrl: string,
): string => {
  const events = appointments
    .filter((a) => a.appointmentType === 'appointment')
    .map((a) => appointmentToICalEvent(a, baseUrl));

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
