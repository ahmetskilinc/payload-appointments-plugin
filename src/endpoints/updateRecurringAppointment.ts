import type { PayloadHandler, PayloadRequest } from 'payload';

import moment from 'moment';

export type UpdateRecurringPayload = {
  appointmentId: string;
  updateType: 'single' | 'all' | 'future';
  data: Record<string, unknown>;
};

export const updateRecurringAppointment: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const body = (await req.json?.()) as UpdateRecurringPayload | undefined;

    if (!body || !body.appointmentId || !body.updateType || !body.data) {
      return Response.json(
        { error: 'Missing required fields: appointmentId, updateType, data' },
        { status: 400 },
      );
    }

    const { appointmentId, updateType, data } = body;

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

    if (updateType === 'single' || !recurrence?.seriesId) {
      const updated = await req.payload.update({
        collection: 'appointments',
        id: appointmentId,
        data,
      });
      return Response.json({ success: true, updated: [updated.id] });
    }

    const seriesId = recurrence.seriesId;
    const appointmentStart = moment(appointment.start);

    let whereClause: any = {
      'recurrence.seriesId': { equals: seriesId },
    };

    if (updateType === 'future') {
      whereClause = {
        and: [
          { 'recurrence.seriesId': { equals: seriesId } },
          { start: { greater_than_equal: appointmentStart.toISOString() } },
        ],
      };
    }

    const seriesAppointments = await req.payload.find({
      collection: 'appointments',
      depth: 0,
      limit: 100,
      where: whereClause,
    });

    const updatedIds: string[] = [];

    for (const appt of seriesAppointments.docs) {
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
          collection: 'appointments',
          id: appt.id,
          data: updateData,
        });
        updatedIds.push(String(appt.id));
      } catch (error) {
        req.payload.logger.error(`Failed to update appointment ${appt.id}: ${error}`);
      }
    }

    return Response.json({
      success: true,
      updated: updatedIds,
      total: updatedIds.length,
    });
  } catch (error) {
    req.payload.logger.error(`Update recurring appointment error: ${error}`);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
