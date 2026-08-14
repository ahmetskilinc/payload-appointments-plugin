import type { CollectionConfig } from 'payload'

import type { AppointmentsPluginSlugs } from '../slugs'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

const createGuestCustomersCollection = (slugs: AppointmentsPluginSlugs): CollectionConfig => ({
  slug: slugs.guestCustomers,
  access: {
    create: anyone,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    group: 'Appointments',
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      required: true,
    },
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone',
    },

    {
      name: 'appointments',
      type: 'join',
      collection: slugs.appointments,
      defaultLimit: 25,
      maxDepth: 2,
      on: 'guestCustomer',
    },
  ],
  labels: {
    plural: 'Guest Customers',
    singular: 'Guest Customer',
  },
})

export default createGuestCustomersCollection
