import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

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
              return `${data.firstName} ${data.lastName}`;
            }
            return value;
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
    {
      name: 'useCustomHours',
      type: 'checkbox',
      admin: {
        condition: (data) => data.takingAppointments === true,
        description: 'Override global opening times with custom hours for this team member',
      },
      defaultValue: false,
      label: 'Use Custom Working Hours',
    },
    {
      name: 'customHours',
      type: 'group',
      admin: {
        condition: (data) => data.takingAppointments === true && data.useCustomHours === true,
      },
      fields: daysOfWeek.map((day) => ({
        name: day,
        type: 'group',
        fields: [
          {
            name: 'isWorking',
            type: 'checkbox',
            defaultValue: false,
            label: `Working on ${day.charAt(0).toUpperCase() + day.slice(1)}`,
          },
          {
            type: 'row',
            admin: { condition: (_: any, siblingData: any) => siblingData?.isWorking },
            fields: [
              {
                name: 'start',
                type: 'date',
                admin: {
                  condition: (_: any, siblingData: any) => siblingData?.isWorking,
                  date: {
                    displayFormat: 'h:mm a',
                    pickerAppearance: 'timeOnly',
                  },
                  width: '50%',
                },
                label: 'Start Time',
              },
              {
                name: 'end',
                type: 'date',
                admin: {
                  condition: (_: any, siblingData: any) => siblingData?.isWorking,
                  date: {
                    displayFormat: 'h:mm a',
                    pickerAppearance: 'timeOnly',
                  },
                  width: '50%',
                },
                label: 'End Time',
              },
            ],
          },
        ],
      })),
      label: 'Custom Working Hours',
    },
    {
      name: 'maxAppointmentsPerDay',
      type: 'number',
      admin: {
        condition: (data) => data.takingAppointments === true,
        description:
          'Maximum number of appointments this team member can take per day (0 = unlimited)',
      },
      defaultValue: 0,
      label: 'Max Daily Appointments',
      max: 50,
      min: 0,
    },
    {
      name: 'icalToken',
      type: 'text',
      admin: {
        condition: (data) => data.takingAppointments === true,
        description: 'Token for subscribing to iCal feed (auto-generated)',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          async ({ value, operation }) => {
            if (operation === 'create' || !value) {
              const crypto = await import('crypto');
              return crypto.randomBytes(32).toString('hex');
            }
            return value;
          },
        ],
      },
      index: true,
      label: 'iCal Feed Token',
      unique: true,
    },
  ],
  timestamps: true,
};

export default TeamMembers;
