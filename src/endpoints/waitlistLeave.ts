import type { PayloadHandler, PayloadRequest } from 'payload';

import { getSlugs } from '../slugs';

export const waitlistLeave: PayloadHandler = async (req: PayloadRequest) => {
  try {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return Response.json({ error: 'Missing waitlist entry ID' }, { status: 400 });
    }

    const waitlistSlug = getSlugs(req.payload.config).waitlist;

    const entry = await req.payload.findByID({
      collection: waitlistSlug,
      id,
      depth: 0,
      disableErrors: true,
      overrideAccess: false,
      req,
      user: req.user,
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
      collection: waitlistSlug,
      id,
      data: {
        status: 'cancelled',
      },
      overrideAccess: false,
      req,
      user: req.user,
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
