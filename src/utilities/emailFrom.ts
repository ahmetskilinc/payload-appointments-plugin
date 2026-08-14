import type { Payload } from 'payload';

/**
 * Resolves the "from" address for plugin emails: the app's configured email
 * adapter default first, then the APPOINTMENT_EMAIL_FROM env var. Logs a
 * warning when neither is set instead of silently sending from a placeholder.
 */
export const getEmailFromAddress = (payload?: Payload): string => {
  const adapterDefault = payload?.email?.defaultFromAddress;
  if (adapterDefault) {
    return adapterDefault;
  }

  if (process.env.APPOINTMENT_EMAIL_FROM) {
    return process.env.APPOINTMENT_EMAIL_FROM;
  }

  payload?.logger?.warn(
    'No email "from" address configured — set an email adapter default or APPOINTMENT_EMAIL_FROM',
  );
  return 'noreply@yourdomain.com';
};
