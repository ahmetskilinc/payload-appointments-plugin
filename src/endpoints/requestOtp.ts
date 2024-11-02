import { PayloadHandler, PayloadRequest } from "payload";
import { generateOTP } from "../utilities/GenerateOtp";
import crypto from "crypto";
import { requestTokenEmail } from "../utilities/RequestTokenEmail";
import { Customer } from "../types";

export const requestOtp: PayloadHandler = async (req: PayloadRequest) => {
	try {
		const { email } = await req.json?.();
		const otp = generateOTP();
		const expiresAt = Date.now() + 15 * 60 * 1000;

		const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

		const customerId = (
			await req.payload.find({
				collection: "customers",
				limit: 1,
				where: {
					email: {
						equals: email,
					},
				},
			})
		).docs[0];

		const customer = (await req.payload.update({
			collection: "customers",
			id: customerId.id,
			data: {
				otpCode: hashedOtp,
				otpExpiresAt: new Date(expiresAt).toISOString(),
			},
		})) as Customer;

		req.payload.sendEmail(requestTokenEmail(customer, otp));

		return Response.json(
			{ message: "OTP Generated and sent successfully" },
			{ status: 200 },
		);
	} catch (error) {
		return Response.json(
			{ message: "error", error: error },
			{ status: 500 },
		);
	}
};
