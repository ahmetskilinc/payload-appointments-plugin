export type PriceableService = {
  duration?: number | null;
  paidService?: boolean | null;
  price?: number | null;
  pricingType?: string | null;
};

/**
 * Effective price of one booked service. `price` is a flat amount for
 * `pricingType: 'fixed'` (the default) and a per-hour rate for `'hourly'`,
 * where the charge is prorated over the service duration.
 */
export const getServicePrice = (service: PriceableService): number => {
  if (!service.paidService || !service.price) {
    return 0;
  }

  if (service.pricingType === 'hourly') {
    const minutes = service.duration || 0;
    return Math.round(service.price * (minutes / 60) * 100) / 100;
  }

  return service.price;
};
