import type { PayloadHandler, PayloadRequest } from 'payload';

export type PaymentWebhookPayload = {
  appointmentId: string;
  paymentId: string;
  status: 'success' | 'failed' | 'refunded' | 'partial-refund';
  amountPaid: number;
  refundAmount?: number;
};

export const paymentWebhook: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const body = (await req.json?.()) as PaymentWebhookPayload | undefined;

    if (!body || !body.appointmentId || !body.paymentId || !body.status) {
      return Response.json(
        { error: 'Missing required fields: appointmentId, paymentId, status' },
        { status: 400 },
      );
    }

    const { appointmentId, paymentId, status, amountPaid, refundAmount } = body;

    const appointment = await req.payload.findByID({
      collection: 'appointments',
      id: appointmentId,
      depth: 0,
    });

    if (!appointment) {
      return Response.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const currentPayment = (appointment.payment || {}) as {
      status?: string;
      amountDue?: number;
      amountPaid?: number;
      externalPaymentId?: string;
      paidAt?: string;
    };

    let newPaymentStatus:
      | 'pending'
      | 'not-required'
      | 'deposit-paid'
      | 'paid'
      | 'refunded'
      | 'partial-refund';
    let newAmountPaid = currentPayment.amountPaid || 0;

    switch (status) {
      case 'success':
        newAmountPaid += amountPaid || 0;
        const amountDue = currentPayment.amountDue || 0;
        newPaymentStatus = newAmountPaid >= amountDue ? 'paid' : 'deposit-paid';
        break;
      case 'failed':
        newPaymentStatus = 'pending';
        break;
      case 'refunded':
        newPaymentStatus = 'refunded';
        newAmountPaid = 0;
        break;
      case 'partial-refund':
        newAmountPaid = Math.max(0, newAmountPaid - (refundAmount || 0));
        newPaymentStatus = newAmountPaid > 0 ? 'partial-refund' : 'refunded';
        break;
      default:
        return Response.json({ error: 'Invalid status' }, { status: 400 });
    }

    await req.payload.update({
      collection: 'appointments',
      id: appointmentId,
      data: {
        payment: {
          status: newPaymentStatus,
          amountDue: currentPayment.amountDue,
          amountPaid: newAmountPaid,
          externalPaymentId: paymentId,
          paidAt: status === 'success' ? new Date().toISOString() : currentPayment.paidAt,
        },
      },
    });

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
