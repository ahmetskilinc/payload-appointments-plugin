import type { GlobalConfig } from 'payload';

import type { AppointmentsPluginSlugs } from '../slugs';

import { authenticated } from '../access/authenticated';

const timesOfDay = ['opening', 'closing'];
const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const commonTimezones = [
  { label: 'UTC', value: 'UTC' },
  { label: 'London (GMT/BST)', value: 'Europe/London' },
  { label: 'Paris (CET/CEST)', value: 'Europe/Paris' },
  { label: 'Berlin (CET/CEST)', value: 'Europe/Berlin' },
  { label: 'Moscow (MSK)', value: 'Europe/Moscow' },
  { label: 'Dubai (GST)', value: 'Asia/Dubai' },
  { label: 'Mumbai (IST)', value: 'Asia/Kolkata' },
  { label: 'Singapore (SGT)', value: 'Asia/Singapore' },
  { label: 'Hong Kong (HKT)', value: 'Asia/Hong_Kong' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Sydney (AEST/AEDT)', value: 'Australia/Sydney' },
  { label: 'Auckland (NZST/NZDT)', value: 'Pacific/Auckland' },
  { label: 'New York (EST/EDT)', value: 'America/New_York' },
  { label: 'Chicago (CST/CDT)', value: 'America/Chicago' },
  { label: 'Denver (MST/MDT)', value: 'America/Denver' },
  { label: 'Los Angeles (PST/PDT)', value: 'America/Los_Angeles' },
  { label: 'Toronto (EST/EDT)', value: 'America/Toronto' },
  { label: 'São Paulo (BRT)', value: 'America/Sao_Paulo' },
];

const createOpeningTimesGlobal = (slugs: AppointmentsPluginSlugs): GlobalConfig => ({
  slug: slugs.openingTimes,
  access: {
    read: () => true,
    update: authenticated,
  },
  admin: { group: 'Appointments' },
  fields: [
    {
      name: 'timezone',
      type: 'select',
      admin: {
        description: 'Business timezone - all appointment times will be displayed in this timezone',
      },
      defaultValue: 'UTC',
      label: 'Business Timezone',
      options: commonTimezones,
      required: true,
    },
    ...daysOfWeek.map((day) => ({
      name: day,
      type: 'group' as const,
      fields: [
        {
          name: 'isOpen',
          type: 'checkbox' as const,
          defaultValue: false,
          label: `Open on ${day.charAt(0).toUpperCase() + day.slice(1)}`,
        },
        {
          name: 'intervals',
          type: 'array' as const,
          admin: {
            condition: (_: unknown, siblingData?: { isOpen?: boolean }) =>
              Boolean(siblingData?.isOpen),
            description: 'Bookable time ranges for this day (e.g. morning and afternoon)',
          },
          fields: [
            {
              type: 'row' as const,
              fields: timesOfDay.map((time) => ({
                name: `${time}`,
                type: 'date' as const,
                admin: {
                  date: {
                    displayFormat: 'h:mm a',
                    pickerAppearance: 'timeOnly' as const,
                  },
                  width: '50%',
                },
                label: `${time.charAt(0).toUpperCase() + time.slice(1)}`,
                required: true,
              })),
            },
          ],
          label: 'Open intervals',
          labels: {
            plural: 'Intervals',
            singular: 'Interval',
          },
          // Only required when the day is marked open — a hard `minRows` would
          // make the global unsaveable for closed days.
          validate: (value: unknown, { siblingData }: { siblingData?: { isOpen?: boolean } }) => {
            if (siblingData?.isOpen && (!Array.isArray(value) || value.length === 0)) {
              return 'At least one interval is required when open';
            }
            return true;
          },
        },
      ],
    })),
    {
      name: 'holidays',
      type: 'array' as const,
      admin: {
        description: 'Dates the business is closed — no slots are offered on these days',
      },
      fields: [
        {
          type: 'row' as const,
          fields: [
            {
              name: 'date',
              type: 'date' as const,
              admin: {
                date: { pickerAppearance: 'dayOnly' as const },
                width: '50%',
              },
              required: true,
            },
            {
              name: 'name',
              type: 'text' as const,
              admin: { width: '50%' },
              label: 'Name',
            },
          ],
        },
      ],
      label: 'Holidays',
      labels: {
        plural: 'Holidays',
        singular: 'Holiday',
      },
    },
  ],
  label: 'Opening Times',
});

export default createOpeningTimesGlobal;
