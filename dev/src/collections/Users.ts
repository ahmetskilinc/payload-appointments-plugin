import { CollectionConfig } from "payload";

const Users: CollectionConfig = {
	slug: "users",
	auth: true,
	admin: {
		useAsTitle: "email",
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
		{
			name: "roles",
			type: "select",
			options: [
				{
					value: "admin",
					label: "Admin",
				},
				{
					value: "customer",
					label: "Customer",
				},
			],
		},
		{
			name: "takingAppointments",
			type: "checkbox",
			admin: {
				condition: (siblingData) =>
					["admin"].includes(siblingData.roles),
			},
			label: "Taking appointments?",
			defaultValue: false,
		},
		{
			name: "preferredNameAppointments",
			type: "text",
			label: "Preferred name",
			required: true,
			admin: {
				condition: (siblingData) =>
					Boolean(siblingData.takingAppointments),
				description:
					"Name to show in appointment schedule calendar and to customers when booking.",
			},
		},
	],
};

export default Users;
