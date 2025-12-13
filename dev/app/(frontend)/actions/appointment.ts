'use server'

import configPromise from '@payload-config'
import moment from 'moment'
import { getPayload } from 'payload'

import type { TeamMember, Service } from '../../../payload-types'

import { getDashboardData } from '../../../lib/dashboardData'

export async function createAppointment(host: TeamMember, services: Service[], start: Date) {
  const customer = await getDashboardData()
  const payload = await getPayload({ config: configPromise })

  const response = await payload.create({
    collection: 'appointments',
    data: {
      appointmentType: 'appointment',
      customer,
      host: host.id,
      services: services.map((service) => service.id),
      start: moment(start).toISOString(),
    },
    overrideAccess: false,
    user: customer.id,
  })

  if (!response.id) {
    throw new Error('Login failed')
  }

  return {
    message: 'Appointment created successfully',
    success: true,
  }
}
