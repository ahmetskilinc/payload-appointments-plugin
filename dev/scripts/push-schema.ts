/**
 * Boots Payload in dev mode against DATABASE_URI so the Postgres adapter
 * pushes the current schema (same mechanism as `next dev`).
 *
 * Usage: DATABASE_URI=postgres://... npx payload run scripts/push-schema.ts
 */
import { getPayload } from 'payload';

import config from '../payload.config';

// Dev-mode push requires NODE_ENV=development (types mark it readonly).
(process.env as Record<string, string>).NODE_ENV = 'development';

const payload = await getPayload({ config: await config });
payload.logger.info('Schema push complete.');
process.exit(0);
