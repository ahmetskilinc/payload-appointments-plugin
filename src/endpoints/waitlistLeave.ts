import type { PayloadHandler, PayloadRequest } from 'payload';

export const waitlistLeave: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return Response.json({ error: 'Missing waitlist entry ID' }, { status: 400 });
    }

    const entry = await req.payload.findByID({
      collection: 'waitlist',
      id,
      depth: 0,
    });

    if (!entry) {
      return Response.json({ error: 'Waitlist entry not found' }, { status: 404 });
    }

    if (entry.status === 'booked') {
      return Response.json(
        { error: 'Cannot remove entry that has already been booked' },
        { status: 400 },
      );
    }

    await req.payload.update({
      collection: 'waitlist',
      id,
      data: {
        status: 'cancelled',
      },
    });

    return Response.json({
      success: true,
      message: 'Removed from waitlist',
    });
  } catch (error) {
    req.payload.logger.error(`Waitlist leave error: ${error}`);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
