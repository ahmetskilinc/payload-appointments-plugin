import { PayloadHandler, PayloadRequest } from "payload";
import crypto from "crypto";
import { Customer } from "src/types";

export const verifyOtp: PayloadHandler = async (req: PayloadRequest) => {
	try {
		const { email, otp } = await req.json?.();

		const customer = (
			await req.payload.find({
				collection: "customers",
				limit: 1,
				where: {
					email: {
						equals: email,
					},
				},
			})
		).docs[0] as Customer;

		if (!customer.otpCode) {
			return Response.json({ message: "No OTP Code" }, { status: 500 });
		}

		if (new Date() > customer.otpExpiresAt!) {
			await req.payload.update({
				collection: "customers",
				id: customer.id,
				data: {
					otpCode: "",
					otpExpiresAt: new Date(),
				},
			});
			return Response.json({ message: "OTP Expired" }, { status: 500 });
		}

		const hashedReceivedOTP = crypto
			.createHash("sha256")
			.update(otp)
			.digest("hex");

		if (
			!crypto.timingSafeEqual(
				Buffer.from(hashedReceivedOTP),
				Buffer.from(customer.otpCode),
			)
		) {
			throw new Error("Could not verify OTP");
		}

		await req.payload.update({
			collection: "customers",
			id: customer.id,
			data: {
				otpCode: "",
				otpExpiresAt: new Date(),
			},
		});

		return Response.json(
			{ message: "OTP Verified successfully" },
			{ status: 200 },
		);
	} catch (error) {
		return Response.json(
			{ message: "error", error: error },
			{ status: 500 },
		);
	}
};
