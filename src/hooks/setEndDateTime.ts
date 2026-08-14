import type { FieldHook } from 'payload';

import moment from 'moment';

import { getSlugs } from '../slugs';

const toServiceId = (service: unknown): number | string =>
  service && typeof service === 'object'
    ? (service as { id: number | string }).id
    : (service as number | string);

export const setEndDateTime: FieldHook = async ({ req, siblingData }) => {
  if (siblingData.appointmentType !== 'appointment') {
    return siblingData.end;
  }

  if (!siblingData.start) {
    return siblingData.end;
  }

  if (!siblingData.services?.length) {
    // No services yet (e.g. a partially filled admin form) — leave `end`
    // untouched rather than silently creating a zero-length appointment.
    return siblingData.end;
  }

  // Services may arrive populated (objects) or as raw ids.
  const serviceIds = [...new Set((siblingData.services as unknown[]).map(toServiceId))];

  const services = await req.payload.find({
    collection: getSlugs(req.payload.config).services,
    depth: 0,
    limit: serviceIds.length,
    req,
    where: {
      id: {
        in: serviceIds,
      },
    },
  });

  if (services.docs.length === 0) {
    return siblingData.end;
  }

  const totalDuration = services.docs.reduce((total, service) => total + (service.duration || 0), 0);

  const maxBufferTime = services.docs.reduce(
    (max, service) => Math.max(max, service.bufferTime || 0),
    0,
  );

  return moment(siblingData.start)
    .add(totalDuration + maxBufferTime, 'minutes')
    .toISOString();
};
