import type { GlobalConfig } from 'payload'

const timesOfDay = ['opening', 'closing']
const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const OpeningTimes: GlobalConfig = {
  slug: 'openingTimes',
  access: { read: () => true },
  admin: { group: 'Appointments' },
  fields: daysOfWeek.map((day) => ({
    name: day,
    type: 'group',
    fields: [
      {
        name: 'isOpen',
        type: 'checkbox',
        defaultValue: false,
        label: `Open on ${day.charAt(0).toUpperCase() + day.slice(1)}`,
      },
      {
        type: 'row',
        admin: { condition: (siblingData) => siblingData[day].isOpen },
        fields: timesOfDay.map((time) => ({
          name: `${time}`,
          type: 'date',
          admin: {
            condition: (siblingData) => siblingData[day].isOpen,
            date: {
              displayFormat: 'h:mm a',
              pickerAppearance: 'timeOnly',
            },
            width: '50%',
          },
          label: `${time.charAt(0).toUpperCase() + time.slice(1)}`,
          required: true,
        })),
      },
    ],
  })),
  label: 'Opening Times',
}

export default OpeningTimes
