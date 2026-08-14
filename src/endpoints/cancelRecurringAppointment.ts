import type { PayloadHandler, PayloadRequest, Where } from 'payload';

import moment from 'moment';

import { findAll } from '../utilities/findAll';

export type CancelRecurringPayload = {
  appointmentId: string;
  cancelType: 'single' | 'all' | 'future';
};

export const cancelRecurringAppointment: PayloadHandler = async (req: PayloadRequest) => {
  try {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json?.()) as CancelRecurringPayload | undefined;

    if (!body || !body.appointmentId || !body.cancelType) {
      return Response.json(
        { error: 'Missing required fields: appointmentId, cancelType' },
        { status: 400 },
      );
    }

    const { appointmentId, cancelType } = body;

    const appointment = await req.payload.findByID({
      collection: 'appointments',
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

    const now = new Date().toISOString();

    if (cancelType === 'single' || !recurrence?.seriesId) {
      await req.payload.update({
        collection: 'appointments',
        id: appointmentId,
        data: {
          status: 'cancelled',
          cancelledAt: now,
        },
        overrideAccess: false,
        req,
        user: req.user,
      });
      return Response.json({ success: true, cancelled: [appointmentId] });
    }

    const seriesId = recurrence.seriesId;
    const appointmentStart = moment(appointment.start);

    const conditions: Where[] = [
      { 'recurrence.seriesId': { equals: seriesId } },
      { status: { not_equals: 'cancelled' } },
    ];

    if (cancelType === 'future') {
      conditions.push({ start: { greater_than_equal: appointmentStart.toISOString() } });
    }

    const seriesAppointments = await findAll<{ id: number | string }>({
      collection: 'appointments',
      overrideAccess: false,
      payload: req.payload,
      req,
      user: req.user,
      where: { and: conditions },
    });

    const cancelledIds: string[] = [];
    const failedIds: string[] = [];

    for (const appt of seriesAppointments) {
      try {
        await req.payload.update({
          collection: 'appointments',
          id: appt.id,
          data: {
            status: 'cancelled',
            cancelledAt: now,
          },
          overrideAccess: false,
          req,
          user: req.user,
        });
        cancelledIds.push(String(appt.id));
      } catch (error) {
        req.payload.logger.error(`Failed to cancel appointment ${appt.id}: ${error}`);
        failedIds.push(String(appt.id));
      }
    }

    return Response.json({
      success: failedIds.length === 0,
      cancelled: cancelledIds,
      failed: failedIds,
      total: cancelledIds.length,
    });
  } catch (error) {
    req.payload.logger.error(`Cancel recurring appointment error: ${error}`);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
