export const openingTimesSeed = {
  monday: {
    isOpen: true,
    opening: '2024-01-01T09:00:00.000Z',
    closing: '2024-01-01T17:00:00.000Z',
  },
  tuesday: {
    isOpen: true,
    opening: '2024-01-01T09:00:00.000Z',
    closing: '2024-01-01T17:00:00.000Z',
  },
  wednesday: {
    isOpen: true,
    opening: '2024-01-01T09:00:00.000Z',
    closing: '2024-01-01T17:00:00.000Z',
  },
  thursday: {
    isOpen: true,
    opening: '2024-01-01T09:00:00.000Z',
    closing: '2024-01-01T17:00:00.000Z',
  },
  friday: {
    isOpen: true,
    opening: '2024-01-01T09:00:00.000Z',
    closing: '2024-01-01T17:00:00.000Z',
  },
  saturday: {
    isOpen: true,
    opening: '2024-01-01T10:00:00.000Z',
    closing: '2024-01-01T16:00:00.000Z',
  },
  sunday: {
    isOpen: false,
    opening: null,
    closing: null,
  },
};

export const servicesSeed = [
  {
    title: 'Consultation',
    description: 'Initial consultation to discuss your needs and requirements.',
    duration: 30,
    bufferTime: 0,
    paidService: false,
    price: 0,
  },
  {
    title: 'Standard Appointment',
    description: 'A standard appointment session.',
    duration: 60,
    bufferTime: 15,
    paidService: true,
    price: 50,
  },
  {
    title: 'Extended Session',
    description: 'An extended session for more complex needs.',
    duration: 90,
    bufferTime: 15,
    paidService: true,
    price: 75,
  },
  {
    title: 'Follow-up',
    description: 'A follow-up appointment to review progress.',
    duration: 30,
    bufferTime: 10,
    paidService: true,
    price: 30,
  },
];

export const teamMembersSeed = [
  {
    firstName: 'John',
    lastName: 'Smith',
    preferredNameAppointments: 'John Smith',
    takingAppointments: true,
  },
  {
    firstName: 'Jane',
    lastName: 'Doe',
    preferredNameAppointments: 'Jane Doe',
    takingAppointments: true,
  },
  {
    firstName: 'Alex',
    lastName: 'Johnson',
    preferredNameAppointments: 'Alex Johnson',
    takingAppointments: false,
  },
];
