import { CollectionConfig } from "payload";

const Customers: CollectionConfig = {
	slug: "customers",
	admin: {
		useAsTitle: "firstName",
	},
	access: {},
	fields: [
		{
			name: "firstName",
			type: "text",
			label: "First name",
		},
		{
			name: "lastName",
			type: "text",
			label: "Last name",
		},
		{
			name: "email",
			type: "email",
			label: "Email",
		},
		{
			name: "otpCode",
			type: "text",
			admin: {
				disabled: true,
			},
		},
		{
			name: "otpExpiresAt",
			type: "date",
			admin: {
				disabled: true,
			},
		},
	],
};

export default Customers;
