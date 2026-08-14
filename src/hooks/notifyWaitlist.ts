import type { CollectionAfterChangeHook, Payload, PayloadRequest } from 'payload';

import moment from 'moment';

import { getSlugs } from '../slugs';
import { getEmailFromAddress } from '../utilities/emailFrom';

const WAITLIST_EXPIRY_HOURS = 2;

type WaitlistEntryDoc = {
  customer?: { email?: string; firstName?: string } | number | string | null;
  guestCustomer?: { email?: string; firstName?: string } | number | string | null;
  id: number | string;
  service?: { title?: string } | number | string | null;
};

const getRecipient = (
  entry: WaitlistEntryDoc,
): { email: string; firstName?: string } | null => {
  for (const person of [entry.customer, entry.guestCustomer]) {
    if (person && typeof person === 'object' && person.email) {
      return { email: person.email, firstName: person.firstName };
    }
  }
  return null;
};

export const notifyWaitlistEntry = async (
  payload: Payload,
  entry: WaitlistEntryDoc,
  req?: PayloadRequest,
): Promise<void> => {
  const expiresAt = moment().add(WAITLIST_EXPIRY_HOURS, 'hours').toISOString();

  await payload.update({
    collection: getSlugs(payload.config).waitlist,
    id: entry.id,
    data: {
      status: 'notified',
      notifiedAt: new Date().toISOString(),
      expiresAt,
    },
    req,
  });

  const recipient = getRecipient(entry);

  if (!recipient) {
    payload.logger.warn(
      `Waitlist entry ${entry.id} marked as notified but has no email address to notify`,
    );
    return;
  }

  const serviceTitle =
    entry.service && typeof entry.service === 'object' ? entry.service.title : undefined;

  try {
    await payload.sendEmail({
      from: getEmailFromAddress(payload),
      to: recipient.email,
      subject: 'A spot has opened up!',
      text: [
        `Hi${recipient.firstName ? ` ${recipient.firstName}` : ''},`,
        '',
        `Good news — a spot has opened up${serviceTitle ? ` for ${serviceTitle}` : ''}.`,
        `Please book within ${WAITLIST_EXPIRY_HOURS} hours to keep your place on the waitlist.`,
      ].join('\n'),
    });
  } catch (error) {
    payload.logger.error(`Failed to send waitlist notification for entry ${entry.id}: ${error}`);
  }

  payload.logger.info(`Notified waitlist entry ${entry.id}`);
};

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

  const serviceIds =
    doc.services?.map((s: { id: number | string } | number | string) =>
      typeof s === 'object' ? s.id : s,
    ) || [];
  const hostId = typeof doc.host === 'object' ? doc.host?.id : doc.host;

  if (serviceIds.length === 0) {
    return doc;
  }

  const waitlistEntries = await req.payload.find({
    collection: getSlugs(req.payload.config).waitlist,
    depth: 1,
    limit: 1,
    req,
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

  await notifyWaitlistEntry(
    req.payload,
    waitlistEntries.docs[0] as unknown as WaitlistEntryDoc,
    req,
  );

  return doc;
};
