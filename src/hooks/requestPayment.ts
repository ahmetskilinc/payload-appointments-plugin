import type { CollectionAfterChangeHook } from 'payload';

import type { Appointment, PaymentHooks } from '../types';

import { getSlugs } from '../slugs';

/**
 * Calls the consumer's `onPaymentRequired` hook when a new appointment is
 * created that needs payment, and stores the returned provider payment id.
 */
export const createRequestPaymentHook =
  (paymentHooks?: PaymentHooks): CollectionAfterChangeHook =>
  async ({ context, doc, operation, req }) => {
    if (!paymentHooks?.onPaymentRequired) {
      return doc;
    }

    if (operation !== 'create' || doc.appointmentType !== 'appointment') {
      return doc;
    }

    if (context?.skipPaymentRequest) {
      return doc;
    }

    if (doc.payment?.status !== 'pending') {
      return doc;
    }

    try {
      const { paymentId } = await paymentHooks.onPaymentRequired(doc as unknown as Appointment);

      if (paymentId) {
        await req.payload.update({
          collection: getSlugs(req.payload.config).appointments,
          id: doc.id,
          context: {
            skipAutoComplete: true,
            skipCustomerEmail: true,
            skipPaymentRequest: true,
          },
          data: {
            payment: {
              ...doc.payment,
              externalPaymentId: paymentId,
            },
          },
          depth: 0,
          req,
        });
      }
    } catch (error) {
      req.payload.logger.error(
        `onPaymentRequired hook failed for appointment ${doc.id}: ${error}`,
      );
    }

    return doc;
  };
