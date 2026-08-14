import type { EmailAdapter } from 'payload';

/**
 * Fake email server for development: instead of sending anything, every email
 * is pretty-printed to the server console. No SMTP credentials needed.
 */

/** Rough HTML → text rendering, good enough for reading emails in a terminal. */
const htmlToText = (html: string): string =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|h[1-6]|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/** Every href in the HTML — reset-password / cancellation links live here. */
const extractLinks = (html: string): string[] => {
  const links = [...html.matchAll(/href="([^"]+)"/gi)].map((m) => m[1]);
  return [...new Set(links)].filter((l) => !l.startsWith('mailto:'));
};

export const consoleEmailAdapter: EmailAdapter<void> = () => ({
  name: 'console',
  defaultFromAddress: process.env.APPOINTMENT_EMAIL_FROM || 'dev@localhost',
  defaultFromName: 'Booking App (dev)',
  sendEmail: async (message) => {
    const to = Array.isArray(message.to) ? message.to.join(', ') : message.to;
    const html = typeof message.html === 'string' ? message.html : undefined;
    const text =
      typeof message.text === 'string' && message.text.trim()
        ? message.text
        : html
          ? htmlToText(html)
          : '(empty body)';
    const links = html ? extractLinks(html) : [];

    const lines = [
      '',
      '┌─────────────────────── 📧 EMAIL (console adapter) ───────────────────────',
      `│ From:    ${message.from || 'dev@localhost'}`,
      `│ To:      ${to}`,
      `│ Subject: ${message.subject || '(no subject)'}`,
      '├───────────────────────────────────────────────────────────────────────────',
      ...text.split('\n').map((line) => `│ ${line}`),
      ...(links.length
        ? [
            '├──────────────────────────────── links ────────────────────────────────────',
            ...links.map((l) => `│ 🔗 ${l}`),
          ]
        : []),
      '└───────────────────────────────────────────────────────────────────────────',
      '',
    ];

    // console.log, not payload.logger — pino mangles multi-line messages.
    // eslint-disable-next-line no-console
    console.log(lines.join('\n'));
  },
});
