import type { PayloadHandler, PayloadRequest } from 'payload';

export type WaitlistJoinPayload = {
  serviceId: string;
  hostId?: string;
  customerId?: string;
  guestCustomerId?: string;
  preferredDates?: string[];
  preferredTimeRange?: {
    start?: string;
    end?: string;
  };
  notes?: string;
};

export const waitlistJoin: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const body = (await req.json?.()) as WaitlistJoinPayload | undefined;

    if (!body || !body.serviceId) {
      return Response.json({ error: 'Missing required field: serviceId' }, { status: 400 });
    }

    if (!body.customerId && !body.guestCustomerId) {
      return Response.json(
        { error: 'Either customerId or guestCustomerId is required' },
        { status: 400 },
      );
    }

    const existingEntry = await req.payload.find({
      collection: 'waitlist',
      depth: 0,
      limit: 1,
      where: {
        and: [
          { service: { equals: body.serviceId } },
          { status: { in: ['waiting', 'notified'] } },
          body.customerId
            ? { customer: { equals: body.customerId } }
            : { guestCustomer: { equals: body.guestCustomerId } },
        ],
      },
    });

    if (existingEntry.totalDocs > 0) {
      return Response.json(
        { error: 'Already on waitlist for this service', existingId: existingEntry.docs[0].id },
        { status: 409 },
      );
    }

    const preferredDates = body.preferredDates?.map((date) => ({ date })) || [];

    const entry = await req.payload.create({
      collection: 'waitlist',
      data: {
        service: body.serviceId,
        host: body.hostId,
        customer: body.customerId,
        guestCustomer: body.guestCustomerId,
        preferredDates,
        preferredTimeRange: body.preferredTimeRange,
        notes: body.notes,
        status: 'waiting',
      },
    });

    return Response.json({
      success: true,
      id: entry.id,
      message: 'Added to waitlist',
    });
  } catch (error) {
    req.payload.logger.error(`Waitlist join error: ${error}`);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
