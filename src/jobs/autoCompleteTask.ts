import type { TaskConfig } from 'payload';

import { getSlugs } from '../slugs';
import { findAll } from '../utilities/findAll';

/**
 * Marks past appointments as completed. Schedule via the Jobs Queue
 * (autorun or a cron trigger) — see the README.
 */
export const autoCompleteTask: TaskConfig<{
  input: object;
  output: { completed: number };
}> = {
  slug: 'appointmentsAutoComplete',
  handler: async ({ req }) => {
    const now = new Date().toISOString();
    const appointmentsSlug = getSlugs(req.payload.config).appointments;

    const pastAppointments = await findAll<{ id: number | string }>({
      collection: appointmentsSlug,
      payload: req.payload,
      req,
      select: { id: true },
      where: {
        and: [
          { appointmentType: { equals: 'appointment' } },
          { end: { less_than: now } },
          { status: { in: ['pending', 'confirmed'] } },
        ],
      },
    });

    let completed = 0;

    for (const appointment of pastAppointments) {
      try {
        await req.payload.update({
          collection: appointmentsSlug,
          id: appointment.id,
          context: {
            skipAutoComplete: true,
            skipCustomerEmail: true,
          },
          data: {
            status: 'completed',
          },
          depth: 0,
          req,
        });
        completed += 1;
      } catch (error) {
        req.payload.logger.error(`Failed to auto-complete appointment ${appointment.id}: ${error}`);
      }
    }

    if (completed > 0) {
      req.payload.logger.info(`Auto-completed ${completed} past appointment(s)`);
    }

    return {
      output: { completed },
    };
  },
};
