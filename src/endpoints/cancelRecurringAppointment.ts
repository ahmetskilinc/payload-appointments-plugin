import type { PayloadHandler, PayloadRequest } from 'payload';

import moment from 'moment';

export type CancelRecurringPayload = {
  appointmentId: string;
  cancelType: 'single' | 'all' | 'future';
};

export const cancelRecurringAppointment: PayloadHandler = async (req: PayloadRequest) => {
  try {
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
      });
      return Response.json({ success: true, cancelled: [appointmentId] });
    }

    const seriesId = recurrence.seriesId;
    const appointmentStart = moment(appointment.start);

    let whereClause: any = {
      and: [
        { 'recurrence.seriesId': { equals: seriesId } },
        { status: { not_equals: 'cancelled' } },
      ],
    };

    if (cancelType === 'future') {
      whereClause = {
        and: [
          { 'recurrence.seriesId': { equals: seriesId } },
          { start: { greater_than_equal: appointmentStart.toISOString() } },
          { status: { not_equals: 'cancelled' } },
        ],
      };
    }

    const seriesAppointments = await req.payload.find({
      collection: 'appointments',
      depth: 0,
      limit: 100,
      where: whereClause,
    });

    const cancelledIds: string[] = [];

    for (const appt of seriesAppointments.docs) {
      try {
        await req.payload.update({
          collection: 'appointments',
          id: appt.id,
          data: {
            status: 'cancelled',
            cancelledAt: now,
          },
        });
        cancelledIds.push(String(appt.id));
      } catch (error) {
        req.payload.logger.error(`Failed to cancel appointment ${appt.id}: ${error}`);
      }
    }

    return Response.json({
      success: true,
      cancelled: cancelledIds,
      total: cancelledIds.length,
    });
  } catch (error) {
    req.payload.logger.error(`Cancel recurring appointment error: ${error}`);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
