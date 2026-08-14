import { type CollectionBeforeValidateHook, ValidationError } from 'payload';

import moment from 'moment';

const toId = (value: unknown): number | string =>
  value && typeof value === 'object'
    ? (value as { id: number | string }).id
    : (value as number | string);

export const validateNoOverlap: CollectionBeforeValidateHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  // Merge with the stored doc so partial updates (e.g. only `start` changed)
  // still validate against the effective values.
  const appointmentType = data?.appointmentType ?? originalDoc?.appointmentType;
  const host = data?.host ?? originalDoc?.host;
  const start = data?.start ?? originalDoc?.start;
  const status = data?.status ?? originalDoc?.status;
  const end = data?.end ?? originalDoc?.end;
  const services = data?.services ?? originalDoc?.services;

  if (!host || !start || appointmentType === 'blockout') {
    return data;
  }

  if (status === 'cancelled') {
    return data;
  }

  const hostId = toId(host);
  const startTime = moment(start);

  let endTime: moment.Moment;
  if (end) {
    endTime = moment(end);
  } else if (services?.length) {
    const serviceIds = [...new Set((services as unknown[]).map(toId))];
    const foundServices = await req.payload.find({
      collection: 'services',
      depth: 0,
      limit: serviceIds.length,
      req,
      where: {
        id: {
          in: serviceIds,
        },
      },
    });
    const totalDuration = foundServices.docs.reduce(
      (total, service) => total + (service.duration || 0),
      0,
    );
    endTime = startTime.clone().add(totalDuration, 'minutes');
  } else {
    endTime = startTime.clone().add(30, 'minutes');
  }

  const currentId = operation === 'update' && originalDoc?.id ? originalDoc.id : null;

  const existingAppointments = await req.payload.find({
    collection: 'appointments',
    depth: 0,
    limit: 1,
    req,
    where: {
      and: [
        { host: { equals: hostId } },
        { status: { not_equals: 'cancelled' } },
        ...(currentId ? [{ id: { not_equals: currentId } }] : []),
        { start: { less_than: endTime.toISOString() } },
        { end: { greater_than: startTime.toISOString() } },
      ],
    },
  });

  if (existingAppointments.docs.length > 0) {
    const conflicting = existingAppointments.docs[0];
    const conflictStart = moment(conflicting.start).format('HH:mm');
    const conflictEnd = moment(conflicting.end).format('HH:mm');
    throw new ValidationError({
      errors: [
        {
          message: `This time slot overlaps with an existing appointment (${conflictStart} - ${conflictEnd}). Please choose a different time.`,
          path: 'start',
        },
      ],
    });
  }

  return data;
};
