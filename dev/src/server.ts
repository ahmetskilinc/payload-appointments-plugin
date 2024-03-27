import express from "express";
import payload from "payload";
import { InitOptions } from "payload/config";
import nodemailer from "nodemailer";

require("dotenv").config();
const app = express();

// Redirect root to Admin panel
app.get("/", (_, res) => {
	res.redirect("/admin");
});

export const start = async (args?: Partial<InitOptions>) => {
	const transport = nodemailer.createTransport({
		service: "icloud",
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		},
	});

	// Initialize Payload
	await payload.init({
		secret: process.env.PAYLOAD_SECRET,
		express: app,
		onInit: async () => {
			payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
		},
		email: {
			transport,
			fromName: "Payload Plugin Test",
			fromAddress: "ahmet@kilinc.me",
		},
		...(args || {}),
	});

	// Add your own express routes here

	app.listen(3000);
};

start();
