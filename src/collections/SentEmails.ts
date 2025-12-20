import type { CollectionConfig } from 'payload';

const SentEmails: CollectionConfig = {
  slug: 'sentEmails',
  access: {
    create: () => false,
    delete: () => false,
    update: () => false,
  },
  admin: {
    group: 'Appointments',
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'to', 'emailType', 'sentAt'],
  },
  fields: [
    {
      name: 'emailType',
      type: 'select',
      admin: {
        position: 'sidebar',
      },
      options: [
        { label: 'Appointment Created', value: 'created' },
        { label: 'Appointment Updated', value: 'updated' },
        { label: 'Appointment Cancelled', value: 'cancelled' },
      ],
      required: true,
    },
    {
      name: 'sentAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
        readOnly: true,
      },
      required: true,
    },
    {
      name: 'appointment',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      relationTo: 'appointments',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'from',
          type: 'email',
          required: true,
        },
        {
          name: 'to',
          type: 'email',
          required: true,
        },
      ],
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
    },
    {
      name: 'text',
      type: 'textarea',
      admin: {
        description: 'Plain text version of the email',
      },
    },
    {
      name: 'html',
      type: 'textarea',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'htmlPreview',
      type: 'ui',
      admin: {
        components: {
          Field: 'payload-appointments-plugin/EmailHtmlPreview',
        },
      },
    },
  ],
  labels: {
    plural: 'Sent Emails',
    singular: 'Sent Email',
  },
};

export default SentEmails;
