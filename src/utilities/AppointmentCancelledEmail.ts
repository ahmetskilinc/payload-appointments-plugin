import type { Appointment } from '../types';

import { formatAppointmentDate } from './formatDate';

export const appointmentCancelledEmail = (appointment: Appointment) => {
  const customerEmail = appointment.customer?.email || appointment.guestCustomer?.email;

  if (!customerEmail) {
    throw new Error('Customer email is required for sending cancellation notification');
  }

  const formattedDate = formatAppointmentDate(appointment.start);
  const serviceNames = appointment.services.map((service) => service.title).join(', ');

  return {
    from: process.env.APPOINTMENT_EMAIL_FROM || 'noreply@yourdomain.com',
    subject: `Appointment Cancelled - ${formattedDate}`,
    text: `Your appointment for ${serviceNames} on ${formattedDate} has been cancelled.`,
    to: customerEmail,
  };
};

