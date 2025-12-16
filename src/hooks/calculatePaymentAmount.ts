import type { CollectionBeforeChangeHook } from 'payload';

export const calculatePaymentAmount: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create' || data.appointmentType !== 'appointment') {
    return data;
  }

  if (!data.services || !Array.isArray(data.services) || data.services.length === 0) {
    return data;
  }

  const serviceIds = data.services.map((s: string | { id: string }) =>
    typeof s === 'string' ? s : s.id,
  );

  const services = await req.payload.find({
    collection: 'services',
    depth: 0,
    limit: 100,
    where: {
      id: {
        in: serviceIds,
      },
    },
  });

  let totalPrice = 0;
  let requiresPayment = false;

  for (const service of services.docs) {
    if (service.paidService && service.price) {
      totalPrice += service.price;

      if (service.paymentRequired) {
        requiresPayment = true;
      }
    }
  }

  if (totalPrice > 0) {
    let amountDue = totalPrice;

    if (requiresPayment) {
      const firstPaidService = services.docs.find((s) => s.paidService && s.paymentRequired);

      if (firstPaidService) {
        const depositType = firstPaidService.depositType || 'full';
        const depositAmount = firstPaidService.depositAmount || 0;

        switch (depositType) {
          case 'fixed':
            amountDue = Math.min(depositAmount, totalPrice);
            break;
          case 'percentage':
            amountDue = (totalPrice * depositAmount) / 100;
            break;
          default:
            amountDue = totalPrice;
        }
      }
    }

    data.payment = {
      status: requiresPayment ? 'pending' : 'not-required',
      amountDue: totalPrice,
      amountPaid: 0,
      externalPaymentId: null,
      paidAt: null,
    };
  }

  return data;
};
