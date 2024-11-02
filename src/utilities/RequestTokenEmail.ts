import { RenderedEmail } from "../emails/RequestTokenEmail";
import { Customer } from "../types";

export const requestTokenEmail = (customer: Customer, otp: string) => {
	return {
		to: customer.email,
		from: "Payload Appointments <ahmet@kilinc.me>",
		html: RenderedEmail({ customer, otp }),
		subject: `OTP: ${otp}`,
	};
};
