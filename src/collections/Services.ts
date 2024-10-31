import { CollectionConfig } from "payload";

const Services: CollectionConfig = {
	slug: "services",
	labels: {
		singular: "Service",
		plural: "Services",
	},
	admin: {
		group: "Appointments",
		useAsTitle: "title",
	},
	access: {
		read: () => true,
	},
	fields: [
		{
			type: "text",
			name: "title",
			label: "Title",
			required: true,
		},
		{
			type: "textarea",
			name: "description",
			label: "Description",
			required: false,
		},
		{
			type: "number",
			name: "duration",
			label: "Duration",
			required: true,
		},
	],
};

export default Services;
