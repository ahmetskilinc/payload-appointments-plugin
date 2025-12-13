import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

const Services: CollectionConfig = {
  slug: 'services',
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'duration', 'paidService', 'price'],
    group: 'Appointments',
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      index: true,
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
    },
    {
      name: 'duration',
      type: 'number',
      admin: {
        description: 'Duration of the service in minutes',
      },
      label: 'Duration (minutes)',
      max: 480, // 8 hours max
      min: 1,
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'paidService',
          type: 'checkbox',
          defaultValue: false,
          label: 'Paid Service',
        },
        {
          name: 'price',
          type: 'number',
          admin: {
            condition: (data) => data.paidService === true,
            description: 'Price in your local currency',
          },
          label: 'Price',
          min: 0,
          required: true,
          // step: 0.01,
        },
      ],
    },
  ],
  labels: {
    plural: 'Services',
    singular: 'Service',
  },
  timestamps: true,
}

export default Services
