'use server'

import configPromise from '@payload-config'
import moment from 'moment'
import { getPayload } from 'payload'

import type { TeamMember, Service } from '../../../payload-types'

import { getDashboardData } from '../../../lib/dashboardData'

export async function createAppointment(host: TeamMember, services: Service[], start: Date) {
  const customer = await getDashboardData()

  console.log('customer', customer)

  if (!customer) {
    return {
      message: 'You must be logged in to book as a customer',
      success: false,
    }
  }

  const payload = await getPayload({ config: configPromise })

  const response = await payload.create({
    collection: 'appointments',
    data: {
      appointmentType: 'appointment',
      bookedBy: 'customer',
      customer: customer.id,
      host: host.id,
      services: services.map((service) => service.id),
      start: moment(start).toISOString(),
    },
  })

  if (!response.id) {
    return {
      message: 'Failed to create appointment',
      success: false,
    }
  }

  return {
    message: 'Appointment created successfully',
    success: true,
  }
}

export async function createGuestAppointment(
  host: TeamMember,
  services: Service[],
  start: Date,
  guestDetails: { email: string; firstName: string; lastName: string; phone: string },
) {
  const payload = await getPayload({ config: configPromise })

  const guestCustomer = await payload.create({
    collection: 'guestCustomers',
    data: guestDetails,
  })

  const response = await payload.create({
    collection: 'appointments',
    data: {
      appointmentType: 'appointment',
      bookedBy: 'guest',
      guestCustomer: guestCustomer.id,
      host: host.id,
      services: services.map((service) => service.id),
      start: moment(start).toISOString(),
    },
  })

  if (!response.id) {
    return {
      message: 'Failed to create appointment',
      success: false,
    }
  }

  return {
    message: 'Appointment created successfully',
    success: true,
  }
}
