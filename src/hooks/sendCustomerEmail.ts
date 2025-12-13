import type { CollectionAfterChangeHook } from 'payload'

import type { Appointment } from '../types'

import { appointmentCreatedEmail } from '../utilities/AppointmentCreatedEmail'
import { appointmentUpdatedEmail } from '../utilities/AppointmentUpdatedEmail'

export const sendCustomerEmail: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (doc.appointmentType !== 'appointment') {
    return
  }

  try {
    const appointment = (await req.payload.findByID({
      id: doc.id,
      collection: 'appointments',
      depth: 2,
    })) as unknown as Appointment

    const emailTemplate =
      operation === 'create'
        ? await appointmentCreatedEmail(appointment)
        : operation === 'update'
          ? await appointmentUpdatedEmail(appointment)
          : null

    if (emailTemplate) {
      await req.payload.sendEmail(emailTemplate)
    }
  } catch (error) {
    req.payload.logger.error(`Error sending ${operation} email: ${error}`)
  }
}
