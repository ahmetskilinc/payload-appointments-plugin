import { CollectionConfig } from "payload";
import { addAdminTitle } from "../hooks/addAdminTitle";
import { sendCustomerEmail } from "../hooks/sendCustomerEmail";
import { setEndDateTime } from "../hooks/setEndDateTime";

const Appointments: CollectionConfig = {
	slug: "appointments",
	labels: {
		singular: "Appointment",
		plural: "Appointments",
	},
	admin: {
		group: "Appointments",
		useAsTitle: "adminTitle",
	},
	hooks: {
		afterChange: [sendCustomerEmail],
	},
	fields: [
		{
			name: "appointmentType",
			type: "select",
			label: "Appointment type",
			options: [
				{
					value: "appointment",
					label: "Appointment",
				},
				{
					value: "blockout",
					label: "Blockout",
				},
			],
			required: true,
		},
		{
			type: "relationship",
			relationTo: "teamMembers",
			filterOptions: ({ data }) => {
				return {
					takingAppointments: {
						equals: true,
					},
				};
			},
			name: "host",
			label: "Host",
			admin: {
				condition: (siblingData) => {
					if (siblingData.appointmentType === "appointment")
						return true;
					if (siblingData.appointmentType === "blockout") return true;
					return false;
				},
			},
			required: true,
		},
		{
			type: "relationship",
			relationTo: "customers",
			name: "customer",
			label: "Customer",
			admin: {
				condition: (siblingData) => {
					if (siblingData.appointmentType === "appointment")
						return true;
					return false;
				},
			},
			required: true,
		},
		{
			type: "relationship",
			relationTo: "services",
			name: "services",
			label: "Services",
			hasMany: true,
			admin: {
				condition: (data, siblingData) => {
					if (siblingData.appointmentType === "appointment")
						return true;
					return false;
				},
			},
			required: true,
		},
		{
			name: "title",
			type: "text",
			admin: {
				condition: (data, siblingData) => {
					if (siblingData.appointmentType === "blockout") return true;
					return false;
				},
			},
			required: true,
		},
		{
			type: "row",
			fields: [
				{
					type: "date",
					name: "start",
					label: "Starts at",
					defaultValue: new Date().toString(),
					admin: {
						date: {
							pickerAppearance: "dayAndTime",
						},
						condition: (data, siblingData) => {
							if (siblingData.appointmentType === "appointment")
								return true;
							if (siblingData.appointmentType === "blockout")
								return true;
							return false;
						},
					},
					required: true,
				},
				{
					type: "date",
					name: "end",
					label: "Ends at",
					defaultValue: new Date().toString(),
					admin: {
						date: {
							pickerAppearance: "dayAndTime",
						},
						condition: (data, siblingData) => {
							if (siblingData.appointmentType === "appointment")
								return true;
							if (siblingData.appointmentType === "blockout")
								return true;
							return false;
						},
					},
					hooks: {
						beforeValidate: [setEndDateTime],
					},
					required: true,
				},
			],
		},
		{
			type: "text",
			name: "adminTitle",
			admin: {
				hidden: true,
			},
			hooks: {
				beforeValidate: [addAdminTitle],
			},
		},
	],
};

export default Appointments;
