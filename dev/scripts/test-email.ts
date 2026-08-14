/**
 * Sends a fake HTML-only email through the configured adapter to verify
 * console output. Usage: npx payload run scripts/test-email.ts
 */
import { getPayload } from 'payload';

import config from '../payload.config';

const payload = await getPayload({ config: await config });

await payload.sendEmail({
  to: 'akx9@icloud.com',
  subject: 'Reset Your Password',
  html: `<p>Hi there,</p><p>You (or someone else) requested a password reset.</p><p><a href="http://localhost:3000/admin/reset/abc123token">Click here to reset your password</a></p><p>If you did not request this, ignore this email.</p>`,
});

process.exit(0);
