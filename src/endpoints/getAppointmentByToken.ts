import type { PayloadHandler, PayloadRequest } from 'payload';

import { toPublicAppointment } from '../utilities/publicAppointment';

export const getAppointmentByToken: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return Response.json({ error: 'Missing or invalid cancellation token' }, { status: 400 });
    }

    // Intentionally privileged: the unguessable cancellation token authorizes
    // this read. Only a minimal, PII-safe shape is returned below.
    const appointments = await req.payload.find({
      collection: 'appointments',
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

    return Response.json({
      appointment: toPublicAppointment(appointment),
      success: true,
    });
  } catch (error) {
    req.payload.logger.error(`Error getting appointment by token: ${error}`);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
