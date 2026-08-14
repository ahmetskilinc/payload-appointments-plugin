import type { Payload } from 'payload';

import { getPublicServerUrl } from '../lib/utils';
import { defaultSettings, getSettings } from '../settings';
import type { Appointment } from '../types';

import { getEmailFromAddress } from './emailFrom';
import { formatAppointmentDate } from './formatDate';

export const appointmentCreatedEmail = (appointment: Appointment, payload?: Payload) => {
  const customerEmail = appointment.customer?.email || appointment.guestCustomer?.email;

  if (!customerEmail) {
    throw new Error('Customer email is required for sending appointment confirmation');
  }

  const formattedDate = formatAppointmentDate(appointment.start);
  const serviceNames = (appointment.services || []).map((service) => service?.title).join(', ');
  const baseUrl = getPublicServerUrl(payload?.config?.serverURL);
  const cancelPagePath = payload
    ? getSettings(payload.config).cancelPagePath
    : defaultSettings.cancelPagePath;
  const cancelUrl = appointment.cancellationToken
    ? `${baseUrl}${cancelPagePath}/${appointment.cancellationToken}`
    : '';

  return {
    cancelUrl,
    from: getEmailFromAddress(payload),
    subject: `Appointment Confirmation - ${formattedDate}`,
    text: `Your appointment for ${serviceNames} has been confirmed for ${formattedDate}.${cancelUrl ? ` To cancel, visit: ${cancelUrl}` : ''}`,
    to: customerEmail,
  };
};
