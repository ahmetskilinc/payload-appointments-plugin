import type { CollectionAfterChangeHook } from 'payload';

import moment from 'moment';

export const autoCompleteAppointments: CollectionAfterChangeHook = async ({
  context,
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create' && operation !== 'update') {
    return doc;
  }

  // Guard against the self-update below re-triggering this hook.
  if (context?.skipAutoComplete) {
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
        context: {
          skipAutoComplete: true,
          skipCustomerEmail: true,
        },
        data: {
          status: 'completed',
        },
        depth: 0,
        req,
      });
    } catch (error) {
      req.payload.logger.error(`Error auto-completing appointment ${doc.id}: ${error}`);
    }
  }

  return doc;
};
