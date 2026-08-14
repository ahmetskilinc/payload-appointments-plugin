import type { EmailAdapter } from 'payload';

/**
 * Fake email server for development: instead of sending anything, every email
 * is pretty-printed to the server console. No SMTP credentials needed.
 */
export const consoleEmailAdapter: EmailAdapter<void> =
  ({ payload }) => ({
    name: 'console',
    defaultFromAddress: process.env.APPOINTMENT_EMAIL_FROM || 'dev@localhost',
    defaultFromName: 'Booking App (dev)',
    sendEmail: async (message) => {
      const to = Array.isArray(message.to) ? message.to.join(', ') : message.to;
      const text =
        typeof message.text === 'string'
          ? message.text
          : message.html
            ? '(html only — see html field)'
            : '(empty body)';

      payload.logger.info(
        [
          '',
          '┌─────────────────────── 📧 EMAIL (console adapter) ───────────────────────',
          `│ From:    ${message.from || 'dev@localhost'}`,
          `│ To:      ${to}`,
          `│ Subject: ${message.subject || '(no subject)'}`,
          '├───────────────────────────────────────────────────────────────────────────',
          ...String(text)
            .split('\n')
            .map((line) => `│ ${line}`),
          '└───────────────────────────────────────────────────────────────────────────',
        ].join('\n'),
      );
    },
  });
