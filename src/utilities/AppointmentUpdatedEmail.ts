import type { Appointment } from '../types'

// import { RenderedEmail } from '../emails/AppointmentUpdatedEmail'
import { formatAppointmentDate } from './formatDate'

export const appointmentUpdatedEmail = (appointment: Appointment) => {
  if (!appointment?.customer?.email) {
    throw new Error('Customer email is required for sending appointment update')
  }

  const formattedDate = formatAppointmentDate(appointment.start)
  const serviceNames = appointment.services.map((service) => service.title).join(', ')

  return {
    from: process.env.APPOINTMENT_EMAIL_FROM || 'noreply@yourdomain.com',
    // html: await RenderedEmail({ doc: appointment }),
    subject: `Appointment Update - ${formattedDate}`,
    text: `Your appointment for ${serviceNames} has been updated to ${formattedDate}.`,
    to: appointment.customer.email,
  }
}
