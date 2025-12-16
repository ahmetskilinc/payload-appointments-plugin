import type { CollectionBeforeValidateHook } from 'payload';

import moment from 'moment';

export const validateNoOverlap: CollectionBeforeValidateHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (!data?.host || !data?.start || data?.appointmentType === 'blockout') {
    return data;
  }

  if (data?.status === 'cancelled') {
    return data;
  }

  const hostId = typeof data.host === 'object' ? data.host.id : data.host;
  const startTime = moment(data.start);

  let endTime: moment.Moment;
  if (data.end) {
    endTime = moment(data.end);
  } else if (data.services?.length) {
    const services = await req.payload.find({
      collection: 'services',
      depth: 0,
      limit: data.services.length,
      where: {
        id: {
          in: data.services.map((s: any) => (typeof s === 'object' ? s.id : s)),
        },
      },
    });
    const totalDuration = services.docs.reduce(
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
    where: {
      and: [
        { host: { equals: hostId } },
        { status: { not_equals: 'cancelled' } },
        ...(currentId ? [{ id: { not_equals: currentId } }] : []),
        {
          or: [
            {
              and: [
                { start: { less_than: endTime.toISOString() } },
                { end: { greater_than: startTime.toISOString() } },
              ],
            },
          ],
        },
      ],
    },
  });

  if (existingAppointments.docs.length > 0) {
    const conflicting = existingAppointments.docs[0];
    const conflictStart = moment(conflicting.start).format('HH:mm');
    const conflictEnd = moment(conflicting.end).format('HH:mm');
    throw new Error(
      `This time slot overlaps with an existing appointment (${conflictStart} - ${conflictEnd}). Please choose a different time.`,
    );
  }

  return data;
};
