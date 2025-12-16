import type { CollectionConfig } from 'payload';

import { anyone } from '../access/anyone';
import { addAdminTitle } from '../hooks/addAdminTitle';
import { autoCompleteAppointments } from '../hooks/autoCompleteAppointments';
import { calculatePaymentAmount } from '../hooks/calculatePaymentAmount';
import { generateCancellationToken } from '../hooks/generateCancellationToken';
import { generateRecurringAppointments } from '../hooks/generateRecurringAppointments';
import { notifyWaitlist } from '../hooks/notifyWaitlist';
import { sendCustomerEmail } from '../hooks/sendCustomerEmail';
import { setEndDateTime } from '../hooks/setEndDateTime';
import { validateCustomerOrGuest } from '../hooks/validateCustomerOrGuest';
import { validateNoOverlap } from '../hooks/validateNoOverlap';

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
      name: 'status',
      type: 'select',
      admin: {
        condition: (data, siblingData) => siblingData.appointmentType === 'appointment',
        position: 'sidebar',
      },
      defaultValue: 'confirmed',
      label: 'Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Completed', value: 'completed' },
        { label: 'No Show', value: 'no-show' },
      ],
    },
    {
      name: 'cancelledAt',
      type: 'date',
      admin: {
        condition: (data, siblingData) => siblingData.status === 'cancelled',
        position: 'sidebar',
        readOnly: true,
      },
      label: 'Cancelled At',
    },
    {
      name: 'host',
      type: 'relationship',
      admin: {
        condition: (siblingData) => {
          if (siblingData.appointmentType === 'appointment') {
            return true;
          }
          if (siblingData.appointmentType === 'blockout') {
            return true;
          }
          return false;
        },
      },
      filterOptions: ({ data }) => {
        return {
          takingAppointments: {
            equals: true,
          },
        };
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
            return true;
          }
          return false;
        },
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
            return true;
          }
          return false;
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
            return true;
          }
          return false;
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
            return true;
          }
          return false;
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
                return true;
              }
              if (siblingData.appointmentType === 'blockout') {
                return true;
              }
              return false;
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
                return true;
              }
              if (siblingData.appointmentType === 'blockout') {
                return true;
              }
              return false;
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
      name: 'customerNotes',
      type: 'textarea',
      admin: {
        condition: (data, siblingData) => siblingData.appointmentType === 'appointment',
        description: 'Special requests or notes from the customer',
      },
      label: 'Customer Notes',
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: {
        condition: (data, siblingData) => siblingData.appointmentType === 'appointment',
        description: 'Internal notes visible only to staff',
      },
      label: 'Internal Notes',
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
    {
      name: 'cancellationToken',
      type: 'text',
      admin: {
        condition: (data, siblingData) => siblingData.appointmentType === 'appointment',
        position: 'sidebar',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [generateCancellationToken],
      },
      index: true,
      label: 'Cancellation Token',
      unique: true,
    },
    {
      name: 'payment',
      type: 'group',
      admin: {
        condition: (data, siblingData) => siblingData.appointmentType === 'appointment',
      },
      fields: [
        {
          name: 'status',
          type: 'select',
          defaultValue: 'not-required',
          label: 'Payment Status',
          options: [
            { label: 'Not Required', value: 'not-required' },
            { label: 'Pending', value: 'pending' },
            { label: 'Deposit Paid', value: 'deposit-paid' },
            { label: 'Fully Paid', value: 'paid' },
            { label: 'Refunded', value: 'refunded' },
            { label: 'Partially Refunded', value: 'partial-refund' },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'amountDue',
              type: 'number',
              admin: {
                readOnly: true,
              },
              label: 'Amount Due',
              min: 0,
            },
            {
              name: 'amountPaid',
              type: 'number',
              defaultValue: 0,
              label: 'Amount Paid',
              min: 0,
            },
          ],
        },
        {
          name: 'externalPaymentId',
          type: 'text',
          admin: {
            description: 'Payment ID from external provider (Stripe, etc.)',
          },
          label: 'External Payment ID',
        },
        {
          name: 'paidAt',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
            readOnly: true,
          },
          label: 'Paid At',
        },
      ],
      label: 'Payment',
    },
    {
      name: 'recurrence',
      type: 'group',
      admin: {
        condition: (data, siblingData) => siblingData.appointmentType === 'appointment',
      },
      fields: [
        {
          name: 'isRecurring',
          type: 'checkbox',
          defaultValue: false,
          label: 'Recurring Appointment',
        },
        {
          name: 'pattern',
          type: 'select',
          admin: {
            condition: (data, siblingData) => siblingData?.isRecurring === true,
          },
          label: 'Recurrence Pattern',
          options: [
            { label: 'Weekly', value: 'weekly' },
            { label: 'Bi-weekly', value: 'biweekly' },
            { label: 'Monthly', value: 'monthly' },
          ],
        },
        {
          name: 'endType',
          type: 'select',
          admin: {
            condition: (data, siblingData) => siblingData?.isRecurring === true,
          },
          defaultValue: 'occurrences',
          label: 'End After',
          options: [
            { label: 'Number of occurrences', value: 'occurrences' },
            { label: 'End date', value: 'endDate' },
          ],
        },
        {
          name: 'occurrences',
          type: 'number',
          admin: {
            condition: (data, siblingData) =>
              siblingData?.isRecurring === true && siblingData?.endType === 'occurrences',
            description: 'Number of total occurrences (including this one)',
          },
          defaultValue: 4,
          label: 'Occurrences',
          max: 52,
          min: 2,
        },
        {
          name: 'endDate',
          type: 'date',
          admin: {
            condition: (data, siblingData) =>
              siblingData?.isRecurring === true && siblingData?.endType === 'endDate',
            description: 'Recurring appointments will be created until this date',
          },
          label: 'End Date',
        },
        {
          name: 'seriesId',
          type: 'text',
          admin: {
            hidden: true,
            readOnly: true,
          },
          index: true,
          label: 'Series ID',
        },
      ],
      label: 'Recurrence',
    },
  ],
  hooks: {
    afterChange: [
      sendCustomerEmail,
      autoCompleteAppointments,
      generateRecurringAppointments,
      notifyWaitlist,
    ],
    beforeChange: [calculatePaymentAmount],
    beforeValidate: [validateCustomerOrGuest, validateNoOverlap],
  },
  labels: {
    plural: 'Appointments',
    singular: 'Appointment',
  },
};

export default Appointments;
