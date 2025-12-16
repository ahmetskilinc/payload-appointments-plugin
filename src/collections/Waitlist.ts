import type { CollectionConfig } from 'payload';

import { anyone } from '../access/anyone';

const Waitlist: CollectionConfig = {
  slug: 'waitlist',
  access: {
    create: anyone,
    read: anyone,
  },
  admin: {
    defaultColumns: ['service', 'customer', 'status', 'createdAt'],
    description: 'Manage waitlist entries for fully booked services',
    group: 'Appointments',
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'service',
      type: 'relationship',
      label: 'Service',
      relationTo: 'services',
      required: true,
    },
    {
      name: 'host',
      type: 'relationship',
      admin: {
        description: 'Preferred team member (optional)',
      },
      label: 'Preferred Host',
      relationTo: 'teamMembers',
    },
    {
      name: 'customer',
      type: 'relationship',
      label: 'Customer',
      relationTo: 'users',
    },
    {
      name: 'guestCustomer',
      type: 'relationship',
      admin: {
        condition: (siblingData) => !siblingData.customer,
      },
      label: 'Guest Customer',
      relationTo: 'guestCustomers',
    },
    {
      name: 'preferredDates',
      type: 'array',
      admin: {
        description: 'Preferred dates for appointment (optional)',
      },
      fields: [
        {
          name: 'date',
          type: 'date',
          label: 'Date',
          required: true,
        },
      ],
      label: 'Preferred Dates',
    },
    {
      name: 'preferredTimeRange',
      type: 'group',
      admin: {
        description: 'Preferred time range (optional)',
      },
      fields: [
        {
          name: 'start',
          type: 'text',
          admin: {
            description: 'Start time (e.g., "09:00")',
          },
          label: 'Earliest Time',
        },
        {
          name: 'end',
          type: 'text',
          admin: {
            description: 'End time (e.g., "17:00")',
          },
          label: 'Latest Time',
        },
      ],
      label: 'Preferred Time Range',
    },
    {
      name: 'status',
      type: 'select',
      admin: {
        position: 'sidebar',
      },
      defaultValue: 'waiting',
      label: 'Status',
      options: [
        { label: 'Waiting', value: 'waiting' },
        { label: 'Notified', value: 'notified' },
        { label: 'Booked', value: 'booked' },
        { label: 'Expired', value: 'expired' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'notifiedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
        readOnly: true,
      },
      label: 'Notified At',
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the waitlist notification expires',
        position: 'sidebar',
      },
      label: 'Expires At',
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Additional notes from the customer',
      },
      label: 'Notes',
    },
  ],
  labels: {
    plural: 'Waitlist',
    singular: 'Waitlist Entry',
  },
  timestamps: true,
};

export default Waitlist;
