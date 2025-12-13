import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { addAdminTitle } from '../hooks/addAdminTitle'
import { sendCustomerEmail } from '../hooks/sendCustomerEmail'
import { setEndDateTime } from '../hooks/setEndDateTime'

const Appointments: CollectionConfig = {
  slug: 'appointments',
  access: {
    create: authenticated,
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
          if (siblingData.appointmentType === 'appointment') {
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
      required: true,
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
  },
  labels: {
    plural: 'Appointments',
    singular: 'Appointment',
  },
}

export default Appointments
