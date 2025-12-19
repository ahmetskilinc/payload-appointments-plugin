import type { PayloadHandler, PayloadRequest } from 'payload';

import moment from 'moment';

export const cancelAppointment: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return Response.json({ error: 'Missing or invalid appointment ID' }, { status: 400 });
    }

    const appointment = await req.payload.findByID({
      id,
      collection: 'appointments',
      depth: 0,
    });

    if (!appointment) {
      return Response.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (appointment.appointmentType !== 'appointment') {
      return Response.json({ error: 'Cannot cancel a blockout' }, { status: 400 });
    }

    if (appointment.status === 'cancelled') {
      return Response.json({ error: 'Appointment is already cancelled' }, { status: 400 });
    }

    if (appointment.status === 'completed') {
      return Response.json({ error: 'Cannot cancel a completed appointment' }, { status: 400 });
    }

    const updatedAppointment = await req.payload.update({
      id,
      collection: 'appointments',
      data: {
        cancelledAt: moment().toISOString(),
        status: 'cancelled',
      },
      depth: 2,
    });

    return Response.json({
      appointment: updatedAppointment,
      message: 'Appointment cancelled successfully',
      success: true,
    });
  } catch (error) {
    req.payload.logger.error(`Error cancelling appointment: ${error}`);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
