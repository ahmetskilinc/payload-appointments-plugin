import type { FieldHook } from 'payload';

import { getSlugs } from '../slugs';

const toId = (value: unknown): number | string | undefined =>
  value && typeof value === 'object'
    ? (value as { id: number | string }).id
    : (value as number | string | undefined);

export const addAdminTitle: FieldHook = async ({ req, siblingData, value }) => {
  if (siblingData.appointmentType === 'blockout') {
    return null;
  }

  if (siblingData.appointmentType !== 'appointment') {
    return value;
  }

  const slugs = getSlugs(req.payload.config);

  try {
    if (siblingData.bookedBy === 'customer' && siblingData.customer) {
      const customer = await req.payload.findByID({
        id: toId(siblingData.customer) as number | string,
        collection: slugs.users,
        depth: 0,
        disableErrors: true,
        req,
      });

      if (customer) {
        return `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || value;
      }
    } else if (siblingData.bookedBy === 'guest' && siblingData.guestCustomer) {
      const guest = await req.payload.findByID({
        id: toId(siblingData.guestCustomer) as number | string,
        collection: slugs.guestCustomers,
        depth: 0,
        disableErrors: true,
        req,
      });

      if (guest) {
        return `${guest.firstName || ''} ${guest.lastName || ''}`.trim() || value;
      }
    }
  } catch (error) {
    req.payload.logger.error(`Error building admin title: ${error}`);
  }

  return value;
};
