import type { CollectionAfterChangeHook } from 'payload';

import type { Appointment } from '../types';

import { RenderedEmail as AppointmentCancelledRenderedEmail } from '../emails/AppointmentCancelledEmail';
import { RenderedEmail as AppointmentCreatedRenderedEmail } from '../emails/AppointmentCreatedEmail';
import { RenderedEmail as AppointmentUpdatedRenderedEmail } from '../emails/AppointmentUpdatedEmail';
import { appointmentCancelledEmail } from '../utilities/AppointmentCancelledEmail';
import { appointmentCreatedEmail } from '../utilities/AppointmentCreatedEmail';
import { appointmentUpdatedEmail } from '../utilities/AppointmentUpdatedEmail';

type EmailType = 'created' | 'updated' | 'cancelled';

export const sendCustomerEmail: CollectionAfterChangeHook = async ({
  context,
  doc,
  operation,
  previousDoc,
  req,
}) => {
  if (doc.appointmentType !== 'appointment') {
    return;
  }

  // Bulk operations (recurring series generation, scheduled jobs) suppress
  // per-document emails via context.
  if (context?.skipCustomerEmail) {
    return;
  }

  try {
    const appointment = (await req.payload.findByID({
      id: doc.id,
      collection: 'appointments',
      depth: 2,
      req,
    })) as unknown as Appointment;

    const openingTimes = await req.payload.findGlobal({
      slug: 'openingTimes',
      depth: 0,
      req,
    });
    const timezone = (openingTimes?.timezone as string) || 'UTC';

    let emailData = null;
    let htmlContent = null;
    let emailType: EmailType | null = null;

    if (operation === 'create') {
      emailData = appointmentCreatedEmail(appointment, req.payload);
      htmlContent = await AppointmentCreatedRenderedEmail({
        cancelUrl: emailData.cancelUrl,
        doc: appointment,
        timezone,
      });
      emailType = 'created';
    } else if (operation === 'update') {
      const wasCancelled = previousDoc?.status !== 'cancelled' && doc.status === 'cancelled';
      if (wasCancelled) {
        emailData = appointmentCancelledEmail(appointment, req.payload);
        htmlContent = await AppointmentCancelledRenderedEmail({ doc: appointment, timezone });
        emailType = 'cancelled';
      } else if (doc.status !== 'cancelled') {
        emailData = appointmentUpdatedEmail(appointment, req.payload);
        htmlContent = await AppointmentUpdatedRenderedEmail({
          cancelUrl: emailData.cancelUrl,
          doc: appointment,
          timezone,
        });
        emailType = 'updated';
      }
    }

    if (emailData && htmlContent && emailType) {
      let emailSent = false;

      try {
        await req.payload.sendEmail({
          ...emailData,
          html: htmlContent,
        });
        emailSent = true;
      } catch (emailError: unknown) {
        const errorString = String(emailError);
        const errorName = emailError instanceof Error ? emailError.name : '';
        const isNotConfigured =
          errorString.includes('NotFound') ||
          errorString.includes('Not Found') ||
          errorName === 'NotFound';

        if (isNotConfigured) {
          req.payload.logger.warn(
            `Email adapter not configured - skipping ${operation} email notification`,
          );
          emailSent = true;
        } else {
          throw emailError;
        }
      }

      if (emailSent) {
        try {
          await req.payload.create({
            collection: 'sentEmails',
            data: {
              appointment: doc.id,
              emailType,
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
          req.payload.logger.error(`Error logging sent email: ${logError}`);
        }
      }
    }
  } catch (error) {
    req.payload.logger.error(`Error sending ${operation} email: ${error}`);
  }
};
