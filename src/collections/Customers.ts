import { CollectionConfig } from "payload";

const Customers: CollectionConfig = {
	slug: "customers",
	admin: {
		useAsTitle: "firstName",
	},
	access: {
		read: () => true,
	},
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
	],
};

export default Customers;
