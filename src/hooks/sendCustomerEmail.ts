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
  doc,
  operation,
  previousDoc,
  req,
}) => {
  req.payload.logger.info('1');
  if (doc.appointmentType !== 'appointment') {
    return;
  }

  try {
    req.payload.logger.info('2');
    const appointment = (await req.payload.findByID({
      id: doc.id,
      collection: 'appointments',
      depth: 2,
      req,
    })) as unknown as Appointment;

    req.payload.logger.info('3');
    const openingTimes = await req.payload.findGlobal({
      slug: 'openingTimes',
      depth: 0,
      req,
    });
    req.payload.logger.info('4');
    const timezone = (openingTimes?.timezone as string) || 'UTC';

    let emailData = null;
    let htmlContent = null;
    let emailType: EmailType | null = null;

    req.payload.logger.info('5');
    if (operation === 'create') {
      emailData = appointmentCreatedEmail(appointment);
      req.payload.logger.info('6');
      htmlContent = await AppointmentCreatedRenderedEmail({
        cancelUrl: emailData.cancelUrl,
        doc: appointment,
        timezone,
      });
      req.payload.logger.info('7');
      emailType = 'created';
    } else if (operation === 'update') {
      req.payload.logger.info('8');
      const wasCancelled = previousDoc?.status !== 'cancelled' && doc.status === 'cancelled';
      req.payload.logger.info('9');
      if (wasCancelled) {
        emailData = appointmentCancelledEmail(appointment);
        req.payload.logger.info('10');
        htmlContent = await AppointmentCancelledRenderedEmail({ doc: appointment, timezone });
        emailType = 'cancelled';
      } else if (doc.status !== 'cancelled') {
        req.payload.logger.info('11');
        emailData = appointmentUpdatedEmail(appointment);
        req.payload.logger.info('12');
        htmlContent = await AppointmentUpdatedRenderedEmail({
          cancelUrl: emailData.cancelUrl,
          doc: appointment,
          timezone,
        });
        req.payload.logger.info('13');
        emailType = 'updated';
      }
    }

    req.payload.logger.info('14');
    if (emailData && htmlContent && emailType) {
      let emailSent = false;

      try {
        req.payload.logger.info('15');
        await req.payload.sendEmail({
          ...emailData,
          html: htmlContent,
        });
        req.payload.logger.info('16');
        emailSent = true;
      } catch (emailError: unknown) {
        req.payload.logger.info('17');
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
          req.payload.logger.info('18');
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
          req.payload.logger.info('19');
        } catch (logError) {
          req.payload.logger.info('20');
          req.payload.logger.error(`Error logging sent email: ${logError}`);
        }
      }
    }
  } catch (error) {
    req.payload.logger.error(`Error sending ${operation} email: ${error}`);
  }
};
