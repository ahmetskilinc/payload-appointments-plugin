import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { addAdminTitle } from '../hooks/addAdminTitle'
import { sendCustomerEmail } from '../hooks/sendCustomerEmail'
import { setEndDateTime } from '../hooks/setEndDateTime'
import { validateCustomerOrGuest } from '../hooks/validateCustomerOrGuest'

const Appointments: CollectionConfig = {
  slug: 'appointments',
  access: {
    create: anyone,
  },
  admin: {
    group: 'Appointments',
    useAsTitle: 'adminTitle',
  },
  fields: [
    {
      name: 'appointmentType',
      type: 'select',
      label: 'Appointment type',
      options: [
        {
          label: 'Appointment',
          value: 'appointment',
        },
        {
          label: 'Blockout',
          value: 'blockout',
        },
      ],
      required: true,
    },
    {
      name: 'host',
      type: 'relationship',
      admin: {
        condition: (siblingData) => {
          if (siblingData.appointmentType === 'appointment') {
            return true
          }
          if (siblingData.appointmentType === 'blockout') {
            return true
          }
          return false
        },
      },
      filterOptions: ({ data }) => {
        return {
          takingAppointments: {
            equals: true,
          },
        }
      },
      label: 'Host',
      relationTo: 'teamMembers',
      required: true,
    },
    {
      name: 'customer',
      type: 'relationship',
      admin: {
        condition: (siblingData) => {
          if (siblingData.appointmentType === 'appointment' && !siblingData.guestCustomer) {
            return true
          }
          return false
        },
      },
      filterOptions: ({ data }) => {
        return {
          roles: {
            equals: 'customer',
          },
        }
      },
      label: 'Customer',
      relationTo: 'users',
    },
    {
      name: 'guestCustomer',
      type: 'relationship',
      admin: {
        condition: (siblingData) => {
          if (siblingData.appointmentType === 'appointment' && !siblingData.customer) {
            return true
          }
          return false
        },
      },
      label: 'Guest Customer',
      relationTo: 'guestCustomers',
    },
    {
      name: 'bookedBy',
      type: 'select',
      admin: {
        condition: (siblingData) => siblingData.appointmentType === 'appointment',
      },
      label: 'Booked by',
      options: [
        {
          label: 'Customer',
          value: 'customer',
        },
        {
          label: 'Guest',
          value: 'guest',
        },
      ],
    },
    {
      name: 'services',
      type: 'relationship',
      admin: {
        condition: (data, siblingData) => {
          if (siblingData.appointmentType === 'appointment') {
            return true
          }
          return false
        },
      },
      hasMany: true,
      label: 'Services',
      relationTo: 'services',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        condition: (data, siblingData) => {
          if (siblingData.appointmentType === 'blockout') {
            return true
          }
          return false
        },
      },
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'start',
          type: 'date',
          admin: {
            condition: (data, siblingData) => {
              if (siblingData.appointmentType === 'appointment') {
                return true
              }
              if (siblingData.appointmentType === 'blockout') {
                return true
              }
              return false
            },
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
          defaultValue: new Date(),
          label: 'Starts at',
          required: true,
        },
        {
          name: 'end',
          type: 'date',
          admin: {
            condition: (data, siblingData) => {
              if (siblingData.appointmentType === 'appointment') {
                return true
              }
              if (siblingData.appointmentType === 'blockout') {
                return true
              }
              return false
            },
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
          defaultValue: new Date(),
          hooks: {
            beforeValidate: [setEndDateTime],
          },
          label: 'Ends at',
          required: true,
        },
      ],
    },
    {
      name: 'adminTitle',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeValidate: [addAdminTitle],
      },
    },
  ],
  hooks: {
    afterChange: [sendCustomerEmail],
    beforeValidate: [validateCustomerOrGuest],
  },
  labels: {
    plural: 'Appointments',
    singular: 'Appointment',
  },
}

export default Appointments
