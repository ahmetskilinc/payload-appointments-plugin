import { CollectionConfig } from "payload";
import { sendCustomerEmail } from "../hooks/sendCustomerEmail";
import { getAppointmentsForDayAndHost } from "../utilities/GetAppointmentsForDay";
import { setEndDateTime } from "../hooks/setEndDateTime";

const Appointments: CollectionConfig = {
	slug: "appointments",
	labels: {
		singular: "Appointment",
		plural: "Appointments",
	},
	admin: {
		group: "Appointments",
	},
	hooks: {
		afterChange: [sendCustomerEmail],
	},
	endpoints: [
		// {
		// 	path: "/get-slots",
		// 	method: "get",
		// 	handler: async (req, res): Promise<void> => {
		// 		const { availableSlotsForDate, filteredSlots } =
		// 			await getAppointmentsForDayAndHost(req);
		// 		res.json({
		// 			availableSlots: filteredSlots,
		// 			allSlots: availableSlotsForDate,
		// 		});
		// 	},
		// },
	],
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
			relationTo: "users",
			filterOptions: ({ data }) => {
				return {
					roles: {
						equals: "admin",
					},
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
			relationTo: "users",
			name: "customer",
			label: "Customer",
			filterOptions: ({ id }) => {
				return {
					roles: {
						equals: "customer",
					},
				};
			},
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
	],
};

export default Appointments;
