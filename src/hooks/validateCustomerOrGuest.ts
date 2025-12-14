import type { CollectionBeforeValidateHook } from 'payload'

export const validateCustomerOrGuest: CollectionBeforeValidateHook = async ({ data }) => {
  if (data?.appointmentType === 'blockout') {
    return data
  }

  if (data?.appointmentType === 'appointment') {
    const hasCustomer = !!data?.customer
    const hasGuestCustomer = !!data?.guestCustomer

    if (!hasCustomer && !hasGuestCustomer) {
      throw new Error('Either a customer or guest customer is required for appointments')
    }

    if (hasCustomer && hasGuestCustomer) {
      throw new Error('An appointment cannot have both a customer and guest customer')
    }
  }

  return data
}
