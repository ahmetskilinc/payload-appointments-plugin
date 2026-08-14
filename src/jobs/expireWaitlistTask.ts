import type { TaskConfig } from 'payload';

import { notifyWaitlistEntry } from '../hooks/notifyWaitlist';
import { getSlugs } from '../slugs';
import { findAll } from '../utilities/findAll';

type WaitlistDoc = {
  host?: { id: number | string } | number | string | null;
  id: number | string;
  service?: { id: number | string } | number | string | null;
};

const toId = (value: WaitlistDoc['service']): number | string | undefined =>
  value && typeof value === 'object' ? value.id : (value ?? undefined);

/**
 * Expires waitlist notifications whose booking window has lapsed, then offers
 * the freed spot to the next waiting entry. Schedule via the Jobs Queue.
 */
export const expireWaitlistTask: TaskConfig<{
  input: object;
  output: { expired: number; notified: number };
}> = {
  slug: 'appointmentsExpireWaitlist',
  handler: async ({ req }) => {
    const now = new Date().toISOString();
    const waitlistSlug = getSlugs(req.payload.config).waitlist;

    const expiredEntries = await findAll<WaitlistDoc>({
      collection: waitlistSlug,
      depth: 0,
      payload: req.payload,
      req,
      where: {
        and: [{ status: { equals: 'notified' } }, { expiresAt: { less_than: now } }],
      },
    });

    let expired = 0;
    let notified = 0;

    for (const entry of expiredEntries) {
      try {
        await req.payload.update({
          collection: waitlistSlug,
          id: entry.id,
          data: {
            status: 'expired',
          },
          req,
        });
        expired += 1;
      } catch (error) {
        req.payload.logger.error(`Failed to expire waitlist entry ${entry.id}: ${error}`);
        continue;
      }

      // Offer the spot to the next waiting entry for the same service (and
      // compatible host preference).
      const serviceId = toId(entry.service);
      if (!serviceId) {
        continue;
      }

      const hostId = toId(entry.host);
      const nextInLine = await req.payload.find({
        collection: waitlistSlug,
        depth: 1,
        limit: 1,
        req,
        sort: 'createdAt',
        where: {
          and: [
            { service: { equals: serviceId } },
            { status: { equals: 'waiting' } },
            ...(hostId
              ? [{ or: [{ host: { equals: hostId } }, { host: { exists: false } }] }]
              : []),
          ],
        },
      });

      if (nextInLine.totalDocs > 0) {
        await notifyWaitlistEntry(
          req.payload,
          nextInLine.docs[0] as Parameters<typeof notifyWaitlistEntry>[1],
          req,
        );
        notified += 1;
      }
    }

    if (expired > 0) {
      req.payload.logger.info(
        `Expired ${expired} waitlist notification(s), notified ${notified} next in line`,
      );
    }

    return {
      output: { expired, notified },
    };
  },
};
