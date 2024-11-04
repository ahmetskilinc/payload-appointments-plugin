import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import nodemailer from "nodemailer";
import path from "path";
import { buildConfig } from "payload";
import appointments from "payload-appointments-plugin";
import { fileURLToPath } from "url";
import Users from "./collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  secret: "XFBDRS45yw45rfgdsrn5trstnnr4",
  editor: lexicalEditor({}),
  collections: [Users],
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  email: nodemailerAdapter({
    defaultFromAddress: "hello@ahmetk.dev",
    defaultFromName: "Payload Appointments",
    transport: nodemailer.createTransport({
      service: "icloud",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }),
  }),
  plugins: [appointments({})],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI!,
  }),
});
