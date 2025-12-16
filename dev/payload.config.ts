import { postgresAdapter } from '@payloadcms/db-postgres';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import nodemailer from 'nodemailer';
import { appointmentsPlugin } from 'payload-appointments-plugin';
import path from 'path';
import { buildConfig } from 'payload';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

import Users from './collections/Users';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname;
}

const buildConfigWithMemoryDB = async () => {
  return buildConfig({
    admin: {
      importMap: {
        baseDir: path.resolve(dirname),
      },
    },
    collections: [Users],
    db: postgresAdapter({
      pool: {
        connectionString: process.env.DATABASE_URI || '',
      },
    }),
    editor: lexicalEditor(),
    plugins: [
      appointmentsPlugin({
        seedData: true,
      }),
    ],
    email: nodemailerAdapter({
      defaultFromAddress: 'akx9@icloud.com',
      defaultFromName: 'Booking App',
      transport: nodemailer.createTransport({
        service: 'iCloud',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }),
    }),
    secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
    sharp,
    typescript: {
      outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
  });
};

export default buildConfigWithMemoryDB();
