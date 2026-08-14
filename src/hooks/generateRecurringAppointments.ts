import type { CollectionAfterChangeHook } from 'payload';

import crypto from 'crypto';
import moment from 'moment';

import { getSlugs } from '../slugs';
import { calculateOccurrenceDates, type RecurrencePattern } from '../utilities/recurrence';

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

  const appointmentsSlug = getSlugs(req.payload.config).appointments;

  await req.payload.update({
    collection: appointmentsSlug,
    id: doc.id,
    context: {
      skipCustomerEmail: true,
    },
    req,
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
        collection: appointmentsSlug,
        // The booking confirmation for the series is the original appointment's
        // email — don't spam one email per generated occurrence.
        context: {
          skipCustomerEmail: true,
        },
        req,
        data: {
          appointmentType: doc.appointmentType,
          bookedBy: doc.bookedBy,
          customer: typeof doc.customer === 'object' ? doc.customer?.id : doc.customer,
          customerNotes: doc.customerNotes,
          guestCustomer:
            typeof doc.guestCustomer === 'object' ? doc.guestCustomer?.id : doc.guestCustomer,
          host: typeof doc.host === 'object' ? doc.host?.id : doc.host,
          internalNotes: doc.internalNotes,
          services: doc.services?.map((s: { id: number | string } | number | string) =>
            typeof s === 'object' ? s.id : s,
          ),
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
