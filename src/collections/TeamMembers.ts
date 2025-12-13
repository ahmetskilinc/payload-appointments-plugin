import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

const TeamMembers: CollectionConfig = {
  slug: 'teamMembers',
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['firstName', 'lastName', 'takingAppointments', 'preferredNameAppointments'],
    description: 'Manage team members who can take appointments',
    group: 'Appointments',
    useAsTitle: 'preferredNameAppointments',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'firstName',
          type: 'text',
          admin: {
            description: "Team member's first name",
          },
          label: 'First Name',
          required: true,
        },
        {
          name: 'lastName',
          type: 'text',
          admin: {
            description: "Team member's last name",
          },
          label: 'Last Name',
          required: true,
        },
      ],
    },
    {
      name: 'preferredNameAppointments',
      type: 'text',
      admin: {
        description: 'Name to display in appointment schedule and booking system',
      },
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            if (!value && data?.firstName && data?.lastName) {
              return `${data.firstName} ${data.lastName}`
            }
            return value
          },
        ],
      },
      label: 'Display Name',
      required: true,
      unique: true,
    },
    {
      name: 'takingAppointments',
      type: 'checkbox',
      admin: {
        description: 'Enable to allow this team member to take appointments',
        position: 'sidebar',
      },
      defaultValue: false,
      label: 'Available for Appointments',
    },
    // {
    //   name: "maxAppointmentsPerDay",
    //   type: "number",
    //   label: "Max Daily Appointments",
    //   defaultValue: 8,
    //   required: true,
    //   min: 1,
    //   max: 50,
    //   admin: {
    //     description: "Maximum number of appointments this team member can take per day",
    //     condition: (data) => data.takingAppointments === true,
    //   },
    // },
  ],
  timestamps: true,
}

export default TeamMembers
