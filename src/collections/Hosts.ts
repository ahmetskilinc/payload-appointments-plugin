import { CollectionConfig } from "payload/types";

const Hosts: CollectionConfig = {
	slug: "hosts",
	labels: {
		singular: "Host",
		plural: "Hosts",
	},
	admin: {
		useAsTitle: "prefferedName",
		group: "Booking",
	},
	access: {
		read: () => true,
	},
	fields: [
		{ name: "firstName", type: "text", label: "First Name" },
		{ name: "lastName", type: "text", label: "Last Name" },
		{ name: "prefferedName", type: "text", label: "Preffered Name" },
	],
};

export default Hosts;
