import type { CollectionAfterChangeHook } from 'payload';

import moment from 'moment';

const WAITLIST_EXPIRY_HOURS = 2;

export const notifyWaitlist: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (operation !== 'update') {
    return doc;
  }

  if (doc.appointmentType !== 'appointment') {
    return doc;
  }

  const wasCancelled = previousDoc?.status !== 'cancelled' && doc.status === 'cancelled';

  if (!wasCancelled) {
    return doc;
  }

  const serviceIds = doc.services?.map((s: any) => (typeof s === 'object' ? s.id : s)) || [];
  const hostId = typeof doc.host === 'object' ? doc.host?.id : doc.host;

  if (serviceIds.length === 0) {
    return doc;
  }

  const waitlistEntries = await req.payload.find({
    collection: 'waitlist',
    depth: 1,
    limit: 10,
    sort: 'createdAt',
    where: {
      and: [
        { service: { in: serviceIds } },
        { status: { equals: 'waiting' } },
        {
          or: [{ host: { equals: hostId } }, { host: { exists: false } }],
        },
      ],
    },
  });

  if (waitlistEntries.totalDocs === 0) {
    return doc;
  }

  const firstEntry = waitlistEntries.docs[0];
  const expiresAt = moment().add(WAITLIST_EXPIRY_HOURS, 'hours').toISOString();

  await req.payload.update({
    collection: 'waitlist',
    id: String(firstEntry.id),
    data: {
      status: 'notified',
      notifiedAt: new Date().toISOString(),
      expiresAt,
    },
  });

  req.payload.logger.info(
    `Notified waitlist entry ${firstEntry.id} about cancelled appointment ${doc.id}`,
  );

  return doc;
};
