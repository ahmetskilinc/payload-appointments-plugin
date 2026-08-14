import type { PayloadHandler, PayloadRequest, Where } from 'payload';

export const waitlistPosition: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return Response.json({ error: 'Missing waitlist entry ID' }, { status: 400 });
    }

    const entry = await req.payload.findByID({
      collection: 'waitlist',
      id,
      depth: 1,
    });

    if (!entry) {
      return Response.json({ error: 'Waitlist entry not found' }, { status: 404 });
    }

    const serviceId = typeof entry.service === 'object' ? entry.service?.id : entry.service;
    const hostId = typeof entry.host === 'object' ? entry.host?.id : entry.host;

    const conditions: Where[] = [
      { service: { equals: serviceId } },
      { status: { equals: 'waiting' } },
      { createdAt: { less_than: entry.createdAt } },
    ];

    if (hostId) {
      conditions.push({
        or: [{ host: { equals: hostId } }, { host: { exists: false } }],
      });
    }

    const aheadCount = await req.payload.count({
      collection: 'waitlist',
      where: { and: conditions },
    });

    return Response.json({
      success: true,
      entryId: entry.id,
      status: entry.status,
      position: aheadCount.totalDocs + 1,
      notifiedAt: entry.notifiedAt,
      expiresAt: entry.expiresAt,
    });
  } catch (error) {
    req.payload.logger.error(`Waitlist position error: ${error}`);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
