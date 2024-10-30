import { CollectionConfig } from "payload";

const Customers: CollectionConfig = {
	slug: "customers",
	labels: {
		singular: "Customer",
		plural: "Customers",
	},
	auth: true,
	admin: {
		useAsTitle: "username",
		group: "Booking",
	},
	access: {
		create: () => true,
	},
	fields: [
		{
			name: "username",
			type: "text",
			label: "Username",
			required: true,
			unique: true,
		},
		{
			name: "firstName",
			type: "text",
			label: "First Name",
			required: true,
		},
		{
			name: "lastName",
			type: "text",
			label: "Last Name",
			required: true,
		},
		{
			name: "dob",
			type: "date",
			label: "Date Of Birth",
			required: true,
		},
	],
};

export default Customers;
