'use client';

import React from 'react';
import moment from 'moment';
import { useDocumentDrawer } from '@payloadcms/ui';

import type { BigCalendarAppointment } from '../../types';

import './eventStyles.scss';

const statusClasses: Record<string, string> = {
  pending: 'appointment--pending',
  confirmed: 'appointment--confirmed',
  cancelled: 'appointment--cancelled',
  completed: 'appointment--completed',
  'no-show': 'appointment--no-show',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  'no-show': 'No Show',
};

const Appointment = ({ event }: { event: BigCalendarAppointment }) => {
  const [DocumentDrawer, DocumentDrawerToggler] = useDocumentDrawer({
    id: Number(event.id),
    collectionSlug: 'appointments',
  });

  const statusClass = event.status ? statusClasses[event.status] : 'appointment--confirmed';

  const customerName =
    event.bookedBy === 'customer'
      ? `${event.customer?.firstName || ''} ${event.customer?.lastName || ''}`.trim()
      : `${event.guestCustomer?.firstName || ''} ${event.guestCustomer?.lastName || ''}`.trim();

  const customerEmail =
    event.bookedBy === 'customer' ? event.customer?.email : event.guestCustomer?.email;

  const customerPhone = event.guestCustomer?.phone;

  const servicesText = event.services.map((service) => service.title).join(', ');
  const duration = moment(event.end).diff(moment(event.start), 'minutes');

  const tooltipContent = [
    customerName,
    customerEmail,
    customerPhone,
    `${servicesText} (${duration} min)`,
    event.status ? statusLabels[event.status] : 'Confirmed',
    event.customerNotes ? `Notes: ${event.customerNotes}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <>
      <DocumentDrawerToggler className="event">
        <div className={`appointment ${statusClass}`} title={tooltipContent}>
          <p className="event__label">{customerName || 'Unknown Customer'}</p>
          <p className="event__start-end">
            {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')} -{' '}
            {servicesText}
          </p>
          {event.status && event.status !== 'confirmed' && (
            <span className="event__status">{statusLabels[event.status]}</span>
          )}
        </div>
      </DocumentDrawerToggler>
      <DocumentDrawer />
    </>
  );
};

export default Appointment;
