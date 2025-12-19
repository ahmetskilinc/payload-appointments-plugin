'use server';

import configPromise from '@payload-config';
import moment from 'moment';
import { revalidatePath } from 'next/cache';
import { getPayload } from 'payload';

import type { TeamMember, Service } from '../../../payload-types';

import { getDashboardData } from '../../../lib/dashboardData';

export async function cancelAppointment(appointmentId: number | string) {
  const payload = await getPayload({ config: configPromise });

  try {
    const appointment = await payload.findByID({
      id: appointmentId,
      collection: 'appointments',
      depth: 0,
    });

    if (!appointment) {
      return {
        message: 'Appointment not found',
        success: false,
      };
    }

    if (appointment.status === 'cancelled') {
      return {
        message: 'Appointment is already cancelled',
        success: false,
      };
    }

    if (appointment.status === 'completed') {
      return {
        message: 'Cannot cancel a completed appointment',
        success: false,
      };
    }

    await payload.update({
      id: appointmentId,
      collection: 'appointments',
      data: {
        cancelledAt: moment().toISOString(),
        status: 'cancelled',
      },
    });

    revalidatePath(`/booking/${appointmentId}`);
    revalidatePath('/');

    return {
      message: 'Appointment cancelled successfully',
      success: true,
    };
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return {
      message: 'Failed to cancel appointment',
      success: false,
    };
  }
}

export async function cancelAppointmentByToken(token: string) {
  const payload = await getPayload({ config: configPromise });

  try {
    const appointments = await payload.find({
      collection: 'appointments',
      depth: 0,
      limit: 1,
      where: {
        cancellationToken: {
          equals: token,
        },
      },
    });

    if (appointments.docs.length === 0) {
      return {
        message: 'Invalid cancellation link',
        success: false,
      };
    }

    const appointment = appointments.docs[0];

    if (appointment.status === 'cancelled') {
      return {
        message: 'Appointment is already cancelled',
        success: false,
      };
    }

    if (appointment.status === 'completed') {
      return {
        message: 'Cannot cancel a completed appointment',
        success: false,
      };
    }

    const startTime = moment(appointment.start);
    if (startTime.isBefore(moment())) {
      return {
        message: 'Cannot cancel a past appointment',
        success: false,
      };
    }

    await payload.update({
      id: appointment.id,
      collection: 'appointments',
      data: {
        cancelledAt: moment().toISOString(),
        status: 'cancelled',
      },
    });

    revalidatePath(`/cancel/${token}`);
    revalidatePath(`/booking/${appointment.id}`);
    revalidatePath('/');

    return {
      message: 'Appointment cancelled successfully',
      success: true,
    };
  } catch (error) {
    console.error('Error cancelling appointment by token:', error);
    return {
      message: 'Failed to cancel appointment',
      success: false,
    };
  }
}

export async function getAppointmentByToken(token: string) {
  const payload = await getPayload({ config: configPromise });

  try {
    const appointments = await payload.find({
      collection: 'appointments',
      depth: 2,
      limit: 1,
      where: {
        cancellationToken: {
          equals: token,
        },
      },
    });

    if (appointments.docs.length === 0) {
      return null;
    }

    return appointments.docs[0];
  } catch (error) {
    console.error('Error getting appointment by token:', error);
    return null;
  }
}

export async function createAppointment(
  host: TeamMember,
  services: Service[],
  start: Date,
  customerNotes?: string,
) {
  const customer = await getDashboardData();

  if (!customer) {
    return {
      message: 'You must be logged in to book as a customer',
      success: false,
    };
  }

  const payload = await getPayload({ config: configPromise });

  const response = await payload.create({
    collection: 'appointments',
    data: {
      appointmentType: 'appointment',
      bookedBy: 'customer',
      customer: customer.id,
      customerNotes: customerNotes || undefined,
      host: host.id,
      services: services.map((service) => service.id),
      start: moment(start).toISOString(),
    },
  });

  if (!response.id) {
    return {
      message: 'Failed to create appointment',
      success: false,
    };
  }

  return {
    message: 'Appointment created successfully',
    success: true,
  };
}

export async function createGuestAppointment(
  host: TeamMember,
  services: Service[],
  start: Date,
  guestDetails: { email: string; firstName: string; lastName: string; phone: string },
  customerNotes?: string,
) {
  const payload = await getPayload({ config: configPromise });

  const guestCustomer = await payload.create({
    collection: 'guestCustomers',
    data: guestDetails,
  });

  const response = await payload.create({
    collection: 'appointments',
    data: {
      appointmentType: 'appointment',
      bookedBy: 'guest',
      customerNotes: customerNotes || undefined,
      guestCustomer: guestCustomer.id,
      host: host.id,
      services: services.map((service) => service.id),
      start: moment(start).toISOString(),
    },
  });

  if (!response.id) {
    return {
      message: 'Failed to create appointment',
      success: false,
    };
  }

  return {
    message: 'Appointment created successfully',
    success: true,
  };
}

export async function joinWaitlist(
  serviceId: string | number,
  hostId?: string | number,
  preferredDates?: string[],
  preferredTimeRange?: { start?: string; end?: string },
  notes?: string,
) {
  const customer = await getDashboardData();
  const payload = await getPayload({ config: configPromise });

  try {
    const existingEntry = await payload.find({
      collection: 'waitlist',
      depth: 0,
      limit: 1,
      where: {
        and: [
          { service: { equals: serviceId } },
          { status: { in: ['waiting', 'notified'] } },
          customer ? { customer: { equals: customer.id } } : { id: { exists: false } },
        ],
      },
    });

    if (existingEntry.totalDocs > 0) {
      return {
        id: existingEntry.docs[0].id,
        message: 'You are already on the waitlist for this service',
        success: false,
      };
    }

    const entry = await payload.create({
      collection: 'waitlist',
      data: {
        service: Number(serviceId),
        host: hostId ? Number(hostId) : undefined,
        customer: customer?.id,
        preferredDates: preferredDates?.map((date) => ({ date })) || [],
        preferredTimeRange: preferredTimeRange || undefined,
        notes: notes || undefined,
        status: 'waiting',
      },
    });

    revalidatePath('/');

    return {
      id: entry.id,
      message: 'Successfully joined the waitlist',
      success: true,
    };
  } catch (error) {
    console.error('Error joining waitlist:', error);
    return {
      message: 'Failed to join waitlist',
      success: false,
    };
  }
}

export async function joinWaitlistAsGuest(
  serviceId: string | number,
  guestDetails: { email: string; firstName: string; lastName: string; phone: string },
  hostId?: string | number,
  preferredDates?: string[],
  preferredTimeRange?: { start?: string; end?: string },
  notes?: string,
) {
  const payload = await getPayload({ config: configPromise });

  try {
    const guestCustomer = await payload.create({
      collection: 'guestCustomers',
      data: guestDetails,
    });

    const entry = await payload.create({
      collection: 'waitlist',
      data: {
        service: Number(serviceId),
        host: hostId ? Number(hostId) : undefined,
        guestCustomer: guestCustomer.id,
        preferredDates: preferredDates?.map((date) => ({ date })) || [],
        preferredTimeRange: preferredTimeRange || undefined,
        notes: notes || undefined,
        status: 'waiting',
      },
    });

    revalidatePath('/');

    return {
      id: entry.id,
      message: 'Successfully joined the waitlist',
      success: true,
    };
  } catch (error) {
    console.error('Error joining waitlist as guest:', error);
    return {
      message: 'Failed to join waitlist',
      success: false,
    };
  }
}

export async function leaveWaitlist(waitlistId: string | number) {
  const payload = await getPayload({ config: configPromise });

  try {
    const entry = await payload.findByID({
      id: waitlistId,
      collection: 'waitlist',
      depth: 0,
    });

    if (!entry) {
      return {
        message: 'Waitlist entry not found',
        success: false,
      };
    }

    if (entry.status === 'booked') {
      return {
        message: 'Cannot leave waitlist - you have already been booked',
        success: false,
      };
    }

    await payload.update({
      id: waitlistId,
      collection: 'waitlist',
      data: {
        status: 'cancelled',
      },
    });

    revalidatePath('/');

    return {
      message: 'Successfully left the waitlist',
      success: true,
    };
  } catch (error) {
    console.error('Error leaving waitlist:', error);
    return {
      message: 'Failed to leave waitlist',
      success: false,
    };
  }
}

export async function getWaitlistPosition(waitlistId: string | number) {
  const payload = await getPayload({ config: configPromise });

  try {
    const entry = await payload.findByID({
      id: waitlistId,
      collection: 'waitlist',
      depth: 1,
    });

    if (!entry) {
      return {
        message: 'Waitlist entry not found',
        success: false,
      };
    }

    const serviceId = typeof entry.service === 'object' ? entry.service?.id : entry.service;
    const hostId = typeof entry.host === 'object' ? entry.host?.id : entry.host;

    const whereClause: any = {
      and: [
        { service: { equals: serviceId } },
        { status: { equals: 'waiting' } },
        { createdAt: { less_than: entry.createdAt } },
      ],
    };

    if (hostId) {
      whereClause.and.push({
        or: [{ host: { equals: hostId } }, { host: { exists: false } }],
      });
    }

    const aheadCount = await payload.count({
      collection: 'waitlist',
      where: whereClause,
    });

    return {
      position: aheadCount.totalDocs + 1,
      status: entry.status,
      notifiedAt: entry.notifiedAt,
      expiresAt: entry.expiresAt,
      success: true,
    };
  } catch (error) {
    console.error('Error getting waitlist position:', error);
    return {
      message: 'Failed to get waitlist position',
      success: false,
    };
  }
}
