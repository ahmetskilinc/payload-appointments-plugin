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
	],
};

export default Users;
