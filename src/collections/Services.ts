import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';

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
      max: 480,
      min: 1,
      required: true,
    },
    {
      name: 'bufferTime',
      type: 'number',
      admin: {
        description: 'Buffer time after this service before next appointment (minutes)',
      },
      defaultValue: 0,
      label: 'Buffer Time (minutes)',
      max: 120,
      min: 0,
    },
    {
      name: 'minLeadTime',
      type: 'number',
      admin: {
        description:
          'Minimum hours before appointment that booking is allowed (e.g., 2 = must book at least 2 hours ahead)',
      },
      defaultValue: 0,
      label: 'Minimum Lead Time (hours)',
      max: 168,
      min: 0,
    },
    {
      name: 'maxAdvanceBooking',
      type: 'number',
      admin: {
        description:
          'Maximum days in advance that booking is allowed (e.g., 30 = can only book up to 30 days ahead, 0 = unlimited)',
      },
      defaultValue: 0,
      label: 'Max Advance Booking (days)',
      max: 365,
      min: 0,
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
        },
      ],
    },
    {
      name: 'paymentRequired',
      type: 'checkbox',
      admin: {
        condition: (data) => data.paidService === true,
        description: 'Require payment at time of booking',
      },
      defaultValue: false,
      label: 'Require Payment to Book',
    },
    {
      type: 'row',
      admin: {
        condition: (data) => data.paidService === true && data.paymentRequired === true,
      },
      fields: [
        {
          name: 'depositType',
          type: 'select',
          admin: {
            description: 'Full payment or partial deposit',
          },
          defaultValue: 'full',
          label: 'Payment Type',
          options: [
            { label: 'Full Payment', value: 'full' },
            { label: 'Fixed Deposit', value: 'fixed' },
            { label: 'Percentage Deposit', value: 'percentage' },
          ],
        },
        {
          name: 'depositAmount',
          type: 'number',
          admin: {
            condition: (data) => data.depositType !== 'full',
            description: 'Amount or percentage required as deposit',
          },
          label: 'Deposit Amount',
          min: 0,
        },
      ],
    },
  ],
  labels: {
    plural: 'Services',
    singular: 'Service',
  },
  timestamps: true,
};

export default Services;
