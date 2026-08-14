import type { Payload } from 'payload';

import type { Appointment } from '../types';

import { getEmailFromAddress } from './emailFrom';
import { formatAppointmentDate } from './formatDate';

export const appointmentCancelledEmail = (appointment: Appointment, payload?: Payload) => {
  const customerEmail = appointment.customer?.email || appointment.guestCustomer?.email;

  if (!customerEmail) {
    throw new Error('Customer email is required for sending cancellation notification');
  }

  const formattedDate = formatAppointmentDate(appointment.start);
  const serviceNames = (appointment.services || []).map((service) => service?.title).join(', ');

  return {
    from: getEmailFromAddress(payload),
    subject: `Appointment Cancelled - ${formattedDate}`,
    text: `Your appointment for ${serviceNames} on ${formattedDate} has been cancelled.`,
    to: customerEmail,
  };
};
