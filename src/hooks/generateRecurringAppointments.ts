import type { CollectionAfterChangeHook } from 'payload';

import crypto from 'crypto';
import moment from 'moment';

const MAX_OCCURRENCES = 52;

type RecurrencePattern = 'weekly' | 'biweekly' | 'monthly';

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

const calculateOccurrenceDates = (
  startDate: moment.Moment,
  pattern: RecurrencePattern,
  endType: 'occurrences' | 'endDate',
  occurrences?: number,
  endDate?: string,
): moment.Moment[] => {
  const dates: moment.Moment[] = [];
  let currentDate = startDate.clone();
  let count = 0;
  const maxCount = Math.min(occurrences || MAX_OCCURRENCES, MAX_OCCURRENCES);
  const maxEndDate = endDate ? moment(endDate) : startDate.clone().add(1, 'year');

  while (count < maxCount - 1) {
    currentDate = getNextDate(currentDate, pattern);

    if (endType === 'endDate' && currentDate.isAfter(maxEndDate)) {
      break;
    }

    dates.push(currentDate.clone());
    count++;

    if (endType === 'occurrences' && count >= maxCount - 1) {
      break;
    }
  }

  return dates;
};

export const generateRecurringAppointments: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') {
    return doc;
  }

  if (doc.appointmentType !== 'appointment') {
    return doc;
  }

  const recurrence = doc.recurrence as
    | {
        isRecurring?: boolean;
        pattern?: RecurrencePattern;
        endType?: 'occurrences' | 'endDate';
        occurrences?: number;
        endDate?: string;
        seriesId?: string;
      }
    | undefined;

  if (!recurrence?.isRecurring || !recurrence.pattern) {
    return doc;
  }

  if (recurrence.seriesId) {
    return doc;
  }

  const seriesId = crypto.randomUUID();
  const startDate = moment(doc.start);
  const endTime = moment(doc.end);
  const duration = moment.duration(endTime.diff(startDate));

  const occurrenceDates = calculateOccurrenceDates(
    startDate,
    recurrence.pattern,
    recurrence.endType || 'occurrences',
    recurrence.occurrences,
    recurrence.endDate,
  );

  await req.payload.update({
    collection: 'appointments',
    id: doc.id,
    data: {
      recurrence: {
        ...recurrence,
        seriesId,
      },
    },
  });

  const createdAppointments: string[] = [doc.id];

  for (const date of occurrenceDates) {
    const newStart = date.clone();
    const newEnd = date.clone().add(duration);

    try {
      const newAppointment = await req.payload.create({
        collection: 'appointments',
        data: {
          appointmentType: doc.appointmentType,
          bookedBy: doc.bookedBy,
          customer: typeof doc.customer === 'object' ? doc.customer?.id : doc.customer,
          customerNotes: doc.customerNotes,
          guestCustomer:
            typeof doc.guestCustomer === 'object' ? doc.guestCustomer?.id : doc.guestCustomer,
          host: typeof doc.host === 'object' ? doc.host?.id : doc.host,
          internalNotes: doc.internalNotes,
          services: doc.services?.map((s: any) => (typeof s === 'object' ? s.id : s)),
          start: newStart.toISOString(),
          end: newEnd.toISOString(),
          status: doc.status,
          recurrence: {
            isRecurring: true,
            pattern: recurrence.pattern,
            endType: recurrence.endType,
            occurrences: recurrence.occurrences,
            endDate: recurrence.endDate,
            seriesId,
          },
        },
      });

      createdAppointments.push(String(newAppointment.id));
    } catch (error) {
      req.payload.logger.error(`Failed to create recurring appointment: ${error}`);
    }
  }

  req.payload.logger.info(
    `Created ${createdAppointments.length} appointments for series ${seriesId}`,
  );

  return doc;
};
