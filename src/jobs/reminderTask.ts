import type { TaskConfig } from 'payload';

import { RenderedEmail as AppointmentReminderRenderedEmail } from '../emails/AppointmentReminderEmail';
import { getSettings } from '../settings';
import { appointmentReminderEmail } from '../utilities/AppointmentReminderEmail';
import { findAll } from '../utilities/findAll';

import type { AppointmentEmailRenderArgs, AppointmentsEmailOverrides } from '../hooks/sendCustomerEmail';
import type { Appointment } from '../types';

/**
 * Sends reminder emails for upcoming appointments that start within the
 * configured window (`reminderHours`) and have not been reminded yet.
 * Schedule via the Jobs Queue like the other maintenance tasks.
 */
export const createReminderTask = (
  slug = 'appointmentsReminder',
  emailOverrides?: AppointmentsEmailOverrides,
): TaskConfig<{
  input: object;
  output: { reminded: number };
}> => ({
  slug,
  handler: async ({ req }) => {
    const settings = getSettings(req.payload.config);
    const { slugs } = settings;

    const now = new Date();
    const horizon = new Date(now.getTime() + settings.reminderHours * 60 * 60 * 1000);

    const due = await findAll<{ id: number | string }>({
      collection: slugs.appointments,
      payload: req.payload,
      req,
      select: { id: true },
      where: {
        and: [
          { appointmentType: { equals: 'appointment' } },
          { status: { in: ['pending', 'confirmed'] } },
          { start: { greater_than: now.toISOString(), less_than_equal: horizon.toISOString() } },
          { reminderSentAt: { exists: false } },
        ],
      },
    });

    let reminded = 0;

    if (due.length === 0) {
      return { output: { reminded } };
    }

    const openingTimes = await req.payload.findGlobal({
      slug: slugs.openingTimes,
      depth: 0,
      req,
    });
    const timezone = (openingTimes?.timezone as string) || 'UTC';

    for (const doc of due) {
      try {
        const appointment = (await req.payload.findByID({
          id: doc.id,
          collection: slugs.appointments,
          depth: 2,
          req,
        })) as unknown as Appointment;

        const emailData = appointmentReminderEmail(appointment, req.payload);
        let htmlContent = await AppointmentReminderRenderedEmail({
          cancelUrl: emailData.cancelUrl,
          doc: appointment,
          timezone,
        });

        const override = emailOverrides?.reminder;
        if (override) {
          const renderArgs: AppointmentEmailRenderArgs = {
            appointment,
            cancelUrl: emailData.cancelUrl,
            timezone,
            type: 'reminder',
          };
          if (override.subject) {
            emailData.subject =
              typeof override.subject === 'function'
                ? override.subject(renderArgs)
                : override.subject;
          }
          if (override.text) {
            emailData.text = override.text(renderArgs);
          }
          if (override.html) {
            htmlContent = await override.html(renderArgs);
          }
        }

        try {
          await req.payload.sendEmail({ ...emailData, html: htmlContent });
        } catch (emailError: unknown) {
          const errorString = String(emailError);
          const errorName = emailError instanceof Error ? emailError.name : '';
          const isNotConfigured =
            errorString.includes('NotFound') ||
            errorString.includes('Not Found') ||
            errorName === 'NotFound';

          if (isNotConfigured) {
            req.payload.logger.warn('Email adapter not configured - skipping reminder email');
          } else {
            throw emailError;
          }
        }

        try {
          await req.payload.create({
            collection: slugs.sentEmails,
            data: {
              appointment: doc.id,
              emailType: 'reminder',
              from: emailData.from,
              html: htmlContent,
              sentAt: new Date().toISOString(),
              subject: emailData.subject,
              text: emailData.text,
              to: emailData.to,
            },
            req,
          });
        } catch (logError) {
          req.payload.logger.error(`Error logging reminder email: ${logError}`);
        }

        // Mark as reminded even when the adapter is missing, so a later
        // adapter setup doesn't spam reminders for old appointments.
        await req.payload.update({
          id: doc.id,
          collection: slugs.appointments,
          context: {
            skipAutoComplete: true,
            skipCustomerEmail: true,
            skipPaymentRequest: true,
          },
          data: { reminderSentAt: new Date().toISOString() },
          depth: 0,
          req,
        });

        reminded += 1;
      } catch (error) {
        req.payload.logger.error(`Failed to send reminder for appointment ${doc.id}: ${error}`);
      }
    }

    if (reminded > 0) {
      req.payload.logger.info(`Sent ${reminded} appointment reminder(s)`);
    }

    return { output: { reminded } };
  },
});
