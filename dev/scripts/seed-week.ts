/**
 * Seeds the dev database with appointments across the current week (Mon–Sat)
 * plus the previous 30 days, all within opening hours. Idempotent-ish: skips
 * seeding if any appointment already exists in the range.
 *
 * Usage: npx payload run scripts/seed-week.ts
 */
import moment from 'moment';
import { getPayload } from 'payload';

import config from '../payload.config';

const payload = await getPayload({ config: await config });

const monday = moment().startOf('isoWeek');
const rangeStart = monday.clone().subtract(30, 'days');

const existing = await payload.count({
  collection: 'appointments',
  where: {
    start: {
      greater_than_equal: rangeStart.toISOString(),
      less_than: monday.clone().add(7, 'days').toISOString(),
    },
  },
});

if (existing.totalDocs > 0) {
  payload.logger.info(`Found ${existing.totalDocs} appointment(s) in the range already — skipping.`);
  process.exit(0);
}

const [services, teamMembers, guests, users] = await Promise.all([
  payload.find({ collection: 'services', depth: 0, limit: 10, sort: 'id' }),
  payload.find({
    collection: 'teamMembers',
    depth: 0,
    limit: 10,
    where: { takingAppointments: { equals: true } },
  }),
  payload.find({ collection: 'guestCustomers', depth: 0, limit: 10, sort: 'id' }),
  payload.find({ collection: 'users', depth: 0, limit: 10 }),
]);

const svc = services.docs;
const [john, jane] = teamMembers.docs;
const guest = guests.docs;
const user = users.docs[0];

if (!john || !jane || svc.length < 4 || !user) {
  payload.logger.error('Expected seeded services/team members/users — run with seedData first.');
  process.exit(1);
}

type Row = {
  day: number; // 0 = Monday
  hour: number;
  minute?: number;
  host: number | string;
  services: (number | string)[];
  customer?: number | string;
  guestCustomer?: number | string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  notes?: string;
};

const rows: Row[] = [
  // Monday
  { day: 0, hour: 9, minute: 30, host: john.id, services: [svc[1].id], guestCustomer: guest[0]?.id, status: 'completed' },
  { day: 0, hour: 10, host: jane.id, services: [svc[2].id], customer: user.id, status: 'completed' },
  // Tuesday
  { day: 1, hour: 11, host: john.id, services: [svc[0].id], guestCustomer: guest[2]?.id, status: 'completed', notes: 'First visit' },
  { day: 1, hour: 14, host: jane.id, services: [svc[1].id], guestCustomer: guest[1]?.id, status: 'no-show' },
  // Wednesday
  { day: 2, hour: 13, host: john.id, services: [svc[2].id], customer: user.id, status: 'completed' },
  { day: 2, hour: 9, host: jane.id, services: [svc[3].id], guestCustomer: guest[0]?.id, status: 'completed' },
  { day: 2, hour: 16, host: john.id, services: [svc[3].id], guestCustomer: guest[2]?.id, status: 'cancelled' },
  // Thursday
  { day: 3, hour: 10, host: john.id, services: [svc[1].id], guestCustomer: guest[1]?.id, status: 'completed' },
  { day: 3, hour: 15, host: jane.id, services: [svc[0].id], customer: user.id, status: 'completed', notes: 'Quick check-in' },
  // Friday
  { day: 4, hour: 9, host: john.id, services: [svc[3].id], guestCustomer: guest[0]?.id, status: 'completed' },
  { day: 4, hour: 15, host: john.id, services: [svc[1].id], customer: user.id, status: 'confirmed' },
  { day: 4, hour: 16, host: jane.id, services: [svc[0].id], guestCustomer: guest[2]?.id, status: 'confirmed' },
  // Saturday
  { day: 5, hour: 10, host: john.id, services: [svc[2].id], guestCustomer: guest[1]?.id, status: 'confirmed' },
  { day: 5, hour: 11, host: jane.id, services: [svc[1].id], customer: user.id, status: 'confirmed', notes: 'Prefers window seat' },
  { day: 5, hour: 14, host: jane.id, services: [svc[3].id], guestCustomer: guest[0]?.id, status: 'pending' },
];

// Previous 30 days: a deterministic spread of 1–3 appointments per weekday.
// Statuses skew toward completed, with the occasional cancellation/no-show.
const HOURS = [9, 10, 11, 13, 14, 15, 16];
const PAST_STATUSES: Row['status'][] = [
  'completed', 'completed', 'completed', 'completed',
  'completed', 'cancelled', 'completed', 'no-show',
];

for (let dayOffset = -30; dayOffset < 0; dayOffset += 1) {
  const date = monday.clone().add(dayOffset, 'days');
  const dow = date.isoWeekday(); // 1 = Mon … 7 = Sun
  if (dow === 7) continue; // closed Sundays

  const seedNum = Math.abs(dayOffset);
  const perDay = (seedNum % 3) + 1;

  for (let i = 0; i < perDay; i += 1) {
    const hour = HOURS[(seedNum * 3 + i * 2) % HOURS.length];
    const host = (seedNum + i) % 2 === 0 ? john.id : jane.id;
    const service = svc[(seedNum + i) % 4];
    const asCustomer = (seedNum + i) % 4 === 0;

    rows.push({
      day: dayOffset,
      hour,
      host,
      services: [service.id],
      ...(asCustomer
        ? { customer: user.id }
        : { guestCustomer: guest[(seedNum + i) % guest.length]?.id }),
      status: PAST_STATUSES[(seedNum + i) % PAST_STATUSES.length],
    });
  }
}

let created = 0;

for (const row of rows) {
  const start = monday
    .clone()
    .add(row.day, 'days')
    .set({ hour: row.hour, minute: row.minute ?? 0, second: 0, millisecond: 0 });

  try {
    await payload.create({
      collection: 'appointments',
      // Seeding: no confirmation emails, no auto-complete churn.
      context: {
        skipAutoComplete: true,
        skipCustomerEmail: true,
      },
      data: {
        appointmentType: 'appointment',
        bookedBy: row.customer ? 'customer' : 'guest',
        cancelledAt: row.status === 'cancelled' ? start.clone().subtract(1, 'day').toISOString() : undefined,
        customer: row.customer,
        customerNotes: row.notes,
        guestCustomer: row.guestCustomer,
        host: row.host,
        services: row.services,
        start: start.toISOString(),
        // `end` is recomputed by the setEndDateTime hook from service durations.
        end: start.toISOString(),
        status: row.status,
      },
    });
    created += 1;
  } catch (error) {
    payload.logger.error(`Failed to create appointment on day ${row.day} ${row.hour}:00 — ${error}`);
  }
}

payload.logger.info(
  `Seeded ${created}/${rows.length} appointments (${rangeStart.format('YYYY-MM-DD')} → ${monday.clone().add(5, 'days').format('YYYY-MM-DD')}).`,
);
process.exit(0);
