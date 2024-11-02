import { CollectionConfig } from "payload";

const TeamMembers: CollectionConfig = {
	slug: "teamMembers",
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
		{
			name: "takingAppointments",
			type: "checkbox",
			admin: {
				description: "Whether this user takes appointments or not.",
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
				description:
					"Name to show in appointment schedule calendar and to customers when booking.",
			},
		},
	],
};

export default TeamMembers;
