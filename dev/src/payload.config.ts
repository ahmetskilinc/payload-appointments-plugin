import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
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
	plugins: [appointments()],
	db: mongooseAdapter({
		url: process.env.DATABASE_URI!,
	}),
});
