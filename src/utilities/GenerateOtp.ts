import crypto from "crypto";

export function generateOTP(length = 6) {
	const buffer = crypto.randomBytes(length);

	let otp = "";
	for (let i = 0; i < length; i++) {
		if (i === 0) {
			// Ensure first digit is 1-9
			otp += ((buffer[i] % 9) + 1).toString();
		} else {
			// Use modulo 10 to get a digit (0-9)
			otp += (buffer[i] % 10).toString();
		}
	}

	return otp;
}
