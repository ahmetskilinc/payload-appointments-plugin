import type { Config, Plugin } from "payload";
import type { PluginTypes } from "./types";
import Appointments from "./collections/Appointments";
import Customers from "./collections/Customers";
import Services from "./collections/Services";
import OpeningTimes from "./globals/OpeningTimes";
import { onInitExtension } from "./onInitExtension";

export const appointments =
	(pluginOptions?: PluginTypes): Plugin =>
	(incomingConfig): Config => {
		let config: Config = { ...incomingConfig };

		config.admin = {
			...(config.admin || {}),
			components: {
				...(config.admin?.components || {}),
				views: {
					...(config.admin?.components?.views || {}),
					AppointmentsList: {
						Component:
							"payload-appointments-plugin/src/views/AppointmentsList",
						path: "/appointments-schedule",
						exact: true,
					},
					// AppointmentsListMe: {
					// 	Component:
					// 		"payload-appointments-plugin/src/views/AppointmentsListMe",
					// 	path: "/appointments-schedule/me",
					// 	exact: true,
					// },
				},
				beforeNavLinks: [
					...(config.admin?.components?.beforeNavLinks || []),
					// "/src/components/Appointments/BeforeNavLinks",
				],
			},
		};

		config.collections = [
			...(config.collections || []),
			Appointments,
			Customers,
			Services,
		];

		if (config.collections !== undefined) {
			const userCollection = config.collections.find(
				(collection) => collection.slug === incomingConfig.admin?.user,
			);
			if (userCollection) {
				userCollection.fields = [
					...userCollection.fields,
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
						label: "Taking appointments?",
						defaultValue: false,
					},
					{
						name: "prefferedName",
						type: "text",
						label: "Preffered name",
						required: true,
						admin: {
							condition: (siblingData) => {
								if (siblingData.takingAppointments) return true;
								return false;
							},
						},
					},
				];
			}
		}

		config.globals = [...(config.globals || []), OpeningTimes];

		config.onInit = async (payload) => {
			if (incomingConfig.onInit) {
				await incomingConfig.onInit(payload);
			}
			// Add additional onInit code by using the onInitExtension function
			onInitExtension(pluginOptions!, payload);
		};

		return config;
	};
