import type { GlobalConfig } from 'payload';

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

const OpeningTimes: GlobalConfig = {
  slug: 'openingTimes',
  access: { read: () => true },
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
          type: 'row' as const,
          admin: { condition: (siblingData: any) => siblingData[day]?.isOpen },
          fields: timesOfDay.map((time) => ({
            name: `${time}`,
            type: 'date' as const,
            admin: {
              condition: (siblingData: any) => siblingData[day]?.isOpen,
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
    })),
  ],
  label: 'Opening Times',
};

export default OpeningTimes;
