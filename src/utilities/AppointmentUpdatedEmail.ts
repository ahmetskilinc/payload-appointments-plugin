import type { Appointment } from '../types'

import { formatAppointmentDate } from './formatDate'

export const appointmentUpdatedEmail = (appointment: Appointment) => {
  const customerEmail = appointment.customer?.email || appointment.guestCustomer?.email

  if (!customerEmail) {
    throw new Error('Customer email is required for sending appointment update')
  }

  const formattedDate = formatAppointmentDate(appointment.start)
  const serviceNames = appointment.services.map((service) => service.title).join(', ')

  return {
    from: process.env.APPOINTMENT_EMAIL_FROM || 'noreply@yourdomain.com',
    subject: `Appointment Update - ${formattedDate}`,
    text: `Your appointment for ${serviceNames} has been updated to ${formattedDate}.`,
    to: customerEmail,
  }
}
