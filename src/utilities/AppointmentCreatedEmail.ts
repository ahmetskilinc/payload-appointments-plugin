import { getPublicServerUrl } from 'src/lib/utils';
import type { Appointment } from '../types';

import { formatAppointmentDate } from './formatDate';

export const appointmentCreatedEmail = (appointment: Appointment) => {
  const customerEmail = appointment.customer?.email || appointment.guestCustomer?.email;

  if (!customerEmail) {
    throw new Error('Customer email is required for sending appointment confirmation');
  }

  const formattedDate = formatAppointmentDate(appointment.start);
  const serviceNames = appointment.services.map((service) => service.title).join(', ');
  const baseUrl = getPublicServerUrl();
  const cancelUrl = appointment.cancellationToken
    ? `${baseUrl}/cancel/${appointment.cancellationToken}`
    : '';

  return {
    cancelUrl,
    from: process.env.APPOINTMENT_EMAIL_FROM || 'noreply@yourdomain.com',
    subject: `Appointment Confirmation - ${formattedDate}`,
    text: `Your appointment for ${serviceNames} has been confirmed for ${formattedDate}.${cancelUrl ? ` To cancel, visit: ${cancelUrl}` : ''}`,
    to: customerEmail,
  };
};
