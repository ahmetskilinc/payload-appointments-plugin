import type { PayloadHandler, PayloadRequest } from 'payload';

import moment from 'moment';

import { getSlugs } from '../slugs';
import { toPublicAppointment } from '../utilities/publicAppointment';

export const cancelAppointmentByToken: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return Response.json({ error: 'Missing or invalid cancellation token' }, { status: 400 });
    }

    // Intentionally privileged (overrideAccess defaults to true): possession of the
    // unguessable cancellation token IS the authorization for this operation.
    const appointmentsSlug = getSlugs(req.payload.config).appointments;

    const appointments = await req.payload.find({
      collection: appointmentsSlug,
      depth: 1,
      limit: 1,
      where: {
        cancellationToken: {
          equals: token,
        },
      },
    });

    if (appointments.docs.length === 0) {
      return Response.json({ error: 'Invalid cancellation token' }, { status: 404 });
    }

    const appointment = appointments.docs[0];

    if (appointment.appointmentType !== 'appointment') {
      return Response.json({ error: 'Cannot cancel a blockout' }, { status: 400 });
    }

    if (appointment.status === 'cancelled') {
      return Response.json({
        appointment: toPublicAppointment(appointment),
        error: 'Appointment is already cancelled',
        success: false,
      });
    }

    if (appointment.status === 'completed') {
      return Response.json({
        appointment: toPublicAppointment(appointment),
        error: 'Cannot cancel a completed appointment',
        success: false,
      });
    }

    const startTime = moment(appointment.start);
    if (startTime.isBefore(moment())) {
      return Response.json({
        appointment: toPublicAppointment(appointment),
        error: 'Cannot cancel a past appointment',
        success: false,
      });
    }

    const updatedAppointment = await req.payload.update({
      id: appointment.id,
      collection: appointmentsSlug,
      data: {
        cancelledAt: moment().toISOString(),
        status: 'cancelled',
      },
      depth: 1,
      req,
    });

    return Response.json({
      appointment: toPublicAppointment(updatedAppointment),
      message: 'Appointment cancelled successfully',
      success: true,
    });
  } catch (error) {
    req.payload.logger.error(`Error cancelling appointment by token: ${error}`);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
