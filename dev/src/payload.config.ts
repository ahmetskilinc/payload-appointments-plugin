import { buildConfig } from "payload/config";
import path from "path";
import Users from "./collections/Users";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { webpackBundler } from "@payloadcms/bundler-webpack";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import appointments from "../../src";

export default buildConfig({
	admin: {
		user: Users.slug,
		bundler: webpackBundler(),
		webpack: config => {
			const newConfig = {
				...config,
				resolve: {
					...config.resolve,
					alias: {
						...(config.resolve?.alias || {}),
						react: path.join(__dirname, "../node_modules/react"),
						"react-dom": path.join(__dirname, "../node_modules/react-dom"),
						payload: path.join(__dirname, "../node_modules/payload"),
					},
				},
			};
			return newConfig;
		},
	},
	defaultDepth: 30,
	maxDepth: 100,
	editor: lexicalEditor({}),
	collections: [Users],
	typescript: {
		outputFile: path.resolve(__dirname, "payload-types.ts"),
	},
	graphQL: {
		schemaOutputFile: path.resolve(__dirname, "generated-schema.graphql"),
	},
	plugins: [appointments()],
	db: mongooseAdapter({
		url: process.env.DATABASE_URI,
	}),
});
