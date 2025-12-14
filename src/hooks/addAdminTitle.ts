import type { FieldHook } from 'payload'

export const addAdminTitle: FieldHook = async ({ req, siblingData }) => {
  if (siblingData.appointmentType === 'appointment' && siblingData.bookedBy === 'customer') {
    const customer = (
      await req.payload.find({
        collection: 'users',
        where: {
          id: {
            equals: siblingData.customer,
          },
        },
      })
    ).docs

    return `${customer[0].firstName} ${customer[0].lastName}`
  } else if (siblingData.appointmentType === 'appointment' && siblingData.bookedBy === 'guest') {
    const guest = (
      await req.payload.find({
        collection: 'guestCustomers',
        where: {
          id: {
            equals: siblingData.guestCustomer,
          },
        },
      })
    ).docs

    return `${guest[0].firstName} ${guest[0].lastName}`
  } else if (siblingData.appointmentType === 'blockout') {
    return null
  }
}
