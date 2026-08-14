import type { PayloadHandler, PayloadRequest, Where } from 'payload';

import moment from 'moment';

import { getSlugs } from '../slugs';
import { findAll } from '../utilities/findAll';

export type UpdateRecurringPayload = {
  appointmentId: string;
  updateType: 'single' | 'all' | 'future';
  data: Record<string, unknown>;
};

/** Only these fields may be updated through this endpoint. */
const UPDATABLE_FIELDS = [
  'start',
  'end',
  'services',
  'host',
  'customerNotes',
  'internalNotes',
  'status',
] as const;

const pickUpdatableFields = (data: Record<string, unknown>): Record<string, unknown> => {
  const picked: Record<string, unknown> = {};
  for (const field of UPDATABLE_FIELDS) {
    if (field in data) {
      picked[field] = data[field];
    }
  }
  return picked;
};

export const updateRecurringAppointment: PayloadHandler = async (req: PayloadRequest) => {
  try {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json?.()) as UpdateRecurringPayload | undefined;

    if (!body || !body.appointmentId || !body.updateType || !body.data) {
      return Response.json(
        { error: 'Missing required fields: appointmentId, updateType, data' },
        { status: 400 },
      );
    }

    const { appointmentId, updateType } = body;
    const appointmentsSlug = getSlugs(req.payload.config).appointments;
    const data = pickUpdatableFields(body.data);

    if (Object.keys(data).length === 0) {
      return Response.json(
        { error: `No updatable fields provided. Allowed: ${UPDATABLE_FIELDS.join(', ')}` },
        { status: 400 },
      );
    }

    const appointment = await req.payload.findByID({
      collection: appointmentsSlug,
      id: appointmentId,
      depth: 0,
      disableErrors: true,
      overrideAccess: false,
      req,
      user: req.user,
    });

    if (!appointment) {
      return Response.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const recurrence = appointment.recurrence as
      | {
          isRecurring?: boolean;
          seriesId?: string;
        }
      | undefined;

    if (updateType === 'single' || !recurrence?.seriesId) {
      const updated = await req.payload.update({
        collection: appointmentsSlug,
        id: appointmentId,
        data,
        overrideAccess: false,
        req,
        user: req.user,
      });
      return Response.json({ success: true, updated: [updated.id] });
    }

    const seriesId = recurrence.seriesId;
    const appointmentStart = moment(appointment.start);

    const conditions: Where[] = [{ 'recurrence.seriesId': { equals: seriesId } }];

    if (updateType === 'future') {
      conditions.push({ start: { greater_than_equal: appointmentStart.toISOString() } });
    }

    const seriesAppointments = await findAll<{ end: string; id: number | string; start: string }>({
      collection: appointmentsSlug,
      overrideAccess: false,
      payload: req.payload,
      req,
      user: req.user,
      where: { and: conditions },
    });

    const updatedIds: string[] = [];
    const failedIds: string[] = [];

    for (const appt of seriesAppointments) {
      try {
        const updateData = { ...data };

        if (data.start && updateType === 'all') {
          const originalStart = moment(appointment.start);
          const newStart = moment(data.start as string);
          const timeDiff = newStart.diff(originalStart);

          const apptStart = moment(appt.start);
          apptStart.add(timeDiff, 'milliseconds');
          updateData.start = apptStart.toISOString();

          if (data.end) {
            const apptEnd = moment(appt.end);
            apptEnd.add(timeDiff, 'milliseconds');
            updateData.end = apptEnd.toISOString();
          }
        }

        await req.payload.update({
          collection: appointmentsSlug,
          id: appt.id,
          data: updateData,
          overrideAccess: false,
          req,
          user: req.user,
        });
        updatedIds.push(String(appt.id));
      } catch (error) {
        req.payload.logger.error(`Failed to update appointment ${appt.id}: ${error}`);
        failedIds.push(String(appt.id));
      }
    }

    return Response.json({
      success: failedIds.length === 0,
      updated: updatedIds,
      failed: failedIds,
      total: updatedIds.length,
    });
  } catch (error) {
    req.payload.logger.error(`Update recurring appointment error: ${error}`);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
