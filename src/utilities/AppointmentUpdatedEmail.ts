import type { Payload } from 'payload';

import { getPublicServerUrl } from '../lib/utils';
import type { Appointment } from '../types';

import { getEmailFromAddress } from './emailFrom';
import { formatAppointmentDate } from './formatDate';

export const appointmentUpdatedEmail = (appointment: Appointment, payload?: Payload) => {
  const customerEmail = appointment.customer?.email || appointment.guestCustomer?.email;

  if (!customerEmail) {
    throw new Error('Customer email is required for sending appointment update');
  }

  const formattedDate = formatAppointmentDate(appointment.start);
  const serviceNames = (appointment.services || []).map((service) => service?.title).join(', ');
  const baseUrl = getPublicServerUrl(payload?.config?.serverURL);
  const cancelUrl = appointment.cancellationToken
    ? `${baseUrl}/cancel/${appointment.cancellationToken}`
    : '';

  return {
    cancelUrl,
    from: getEmailFromAddress(payload),
    subject: `Appointment Update - ${formattedDate}`,
    text: `Your appointment for ${serviceNames} has been updated to ${formattedDate}.${cancelUrl ? ` To cancel, visit: ${cancelUrl}` : ''}`,
    to: customerEmail,
  };
};
