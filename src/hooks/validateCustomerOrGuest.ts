import { type CollectionBeforeValidateHook, ValidationError } from 'payload';

export const validateCustomerOrGuest: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
}) => {
  // Partial updates may omit these fields — merge with the stored doc so a
  // PATCH that only changes `status` can't bypass (or falsely fail) validation.
  const appointmentType = data?.appointmentType ?? originalDoc?.appointmentType;

  if (appointmentType !== 'appointment') {
    return data;
  }

  const customer = data && 'customer' in data ? data.customer : originalDoc?.customer;
  const guestCustomer =
    data && 'guestCustomer' in data ? data.guestCustomer : originalDoc?.guestCustomer;

  const hasCustomer = Boolean(customer);
  const hasGuestCustomer = Boolean(guestCustomer);

  if (!hasCustomer && !hasGuestCustomer) {
    throw new ValidationError({
      errors: [
        {
          message: 'Either a customer or guest customer is required for appointments',
          path: 'customer',
        },
      ],
    });
  }

  if (hasCustomer && hasGuestCustomer) {
    throw new ValidationError({
      errors: [
        {
          message: 'An appointment cannot have both a customer and guest customer',
          path: 'customer',
        },
      ],
    });
  }

  return data;
};
