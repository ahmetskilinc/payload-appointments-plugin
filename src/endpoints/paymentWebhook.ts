import type { PayloadHandler, PayloadRequest } from 'payload';

import type { Appointment, PaymentHooks } from '../types';

import { getSlugs } from '../slugs';
import { resolvePaymentStatus } from '../utilities/deposit';
import {
  verifyWebhookSignature,
  WEBHOOK_SIGNATURE_HEADER,
} from '../utilities/webhookSignature';

export type PaymentWebhookPayload = {
  appointmentId: string;
  paymentId: string;
  status: 'success' | 'failed' | 'refunded' | 'partial-refund';
  amountPaid: number;
  refundAmount?: number;
};

export type PaymentWebhookOptions = {
  paymentHooks?: PaymentHooks;
  webhookSecret?: string;
};

export const createPaymentWebhook =
  ({ paymentHooks, webhookSecret }: PaymentWebhookOptions): PayloadHandler =>
  async (req: PayloadRequest) => {
    try {
      if (!webhookSecret) {
        req.payload.logger.error(
          'Payment webhook called but no webhookSecret is configured on the appointments plugin',
        );
        return Response.json({ error: 'Webhook not configured' }, { status: 503 });
      }

      const rawBody = await req.text?.();

      if (!rawBody) {
        return Response.json({ error: 'Missing request body' }, { status: 400 });
      }

      const signature = req.headers.get(WEBHOOK_SIGNATURE_HEADER);

      if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
        return Response.json({ error: 'Invalid signature' }, { status: 401 });
      }

      let body: PaymentWebhookPayload;
      try {
        body = JSON.parse(rawBody) as PaymentWebhookPayload;
      } catch {
        return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
      }

      if (!body || !body.appointmentId || !body.paymentId || !body.status) {
        return Response.json(
          { error: 'Missing required fields: appointmentId, paymentId, status' },
          { status: 400 },
        );
      }

      const { appointmentId, paymentId, status, amountPaid, refundAmount } = body;

      const appointmentsSlug = getSlugs(req.payload.config).appointments;

      const appointment = await req.payload.findByID({
        collection: appointmentsSlug,
        id: appointmentId,
        depth: 0,
        disableErrors: true,
      });

      if (!appointment) {
        return Response.json({ error: 'Appointment not found' }, { status: 404 });
      }

      const currentPayment = (appointment.payment || {}) as {
        amountDue?: number;
        amountPaid?: number;
        externalPaymentId?: string;
        paidAt?: string;
        status?: string;
        totalPrice?: number;
      };

      // Idempotency: a success event for a payment we've already recorded is a replay.
      if (
        status === 'success' &&
        currentPayment.externalPaymentId === paymentId &&
        (currentPayment.status === 'paid' || currentPayment.status === 'deposit-paid')
      ) {
        return Response.json({
          success: true,
          appointmentId,
          duplicate: true,
          paymentStatus: currentPayment.status,
          amountPaid: currentPayment.amountPaid || 0,
        });
      }

      // Older appointments predate the totalPrice field; fall back to amountDue.
      const totalPrice = currentPayment.totalPrice ?? currentPayment.amountDue ?? 0;
      const amountDue = currentPayment.amountDue ?? totalPrice;

      let newPaymentStatus:
        | 'pending'
        | 'not-required'
        | 'deposit-paid'
        | 'paid'
        | 'refunded'
        | 'partial-refund';
      let newAmountPaid = currentPayment.amountPaid || 0;

      switch (status) {
        case 'success': {
          newAmountPaid += amountPaid || 0;
          newPaymentStatus = resolvePaymentStatus(newAmountPaid, amountDue, totalPrice);
          break;
        }
        case 'failed': {
          newPaymentStatus = 'pending';
          break;
        }
        case 'refunded': {
          newPaymentStatus = 'refunded';
          newAmountPaid = 0;
          break;
        }
        case 'partial-refund': {
          newAmountPaid = Math.max(0, newAmountPaid - (refundAmount || 0));
          newPaymentStatus = newAmountPaid > 0 ? 'partial-refund' : 'refunded';
          break;
        }
        default: {
          return Response.json({ error: 'Invalid status' }, { status: 400 });
        }
      }

      const updated = await req.payload.update({
        collection: appointmentsSlug,
        id: appointmentId,
        data: {
          payment: {
            ...currentPayment,
            status: newPaymentStatus,
            amountPaid: newAmountPaid,
            externalPaymentId: paymentId,
            paidAt: status === 'success' ? new Date().toISOString() : currentPayment.paidAt,
          },
        },
        depth: 1,
        req,
      });

      try {
        if (status === 'success') {
          await paymentHooks?.onPaymentReceived?.(updated as unknown as Appointment, body);
        } else if (status === 'refunded' || status === 'partial-refund') {
          await paymentHooks?.onRefundRequested?.(updated as unknown as Appointment);
        }
      } catch (hookError) {
        req.payload.logger.error(`Payment hook error for appointment ${appointmentId}: ${hookError}`);
      }

      return Response.json({
        success: true,
        appointmentId,
        paymentStatus: newPaymentStatus,
        amountPaid: newAmountPaid,
      });
    } catch (error) {
      req.payload.logger.error(`Payment webhook error: ${error}`);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
