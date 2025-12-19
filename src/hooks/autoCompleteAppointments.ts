import type { CollectionAfterChangeHook } from 'payload';

import moment from 'moment';

export const autoCompleteAppointments: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create' && operation !== 'update') {
    return doc;
  }

  if (doc.appointmentType !== 'appointment') {
    return doc;
  }

  if (doc.status === 'cancelled' || doc.status === 'completed' || doc.status === 'no-show') {
    return doc;
  }

  const endTime = moment(doc.end);
  const now = moment();

  if (endTime.isBefore(now) && doc.status !== 'completed') {
    try {
      await req.payload.update({
        id: doc.id,
        collection: 'appointments',
        data: {
          status: 'completed',
        },
        depth: 0,
      });
    } catch (error) {
      req.payload.logger.error(`Error auto-completing appointment ${doc.id}: ${error}`);
    }
  }

  return doc;
};

