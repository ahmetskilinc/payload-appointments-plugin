import type { Config, Plugin } from "payload/config";

import type { PluginTypes } from "./types";
import { extendWebpackConfig } from "./webpack";
import Appointments from "./collections/Appointments";
import Customers from "./collections/Customers";
import Services from "./collections/Services";
import AppointmentsList from "./views/AppointmentsList";
import BeforeNavLinks from "./components/Appointments/BeforeNavLinks";
import AppointmentsListMe from "./views/AppointmentsListMe";
import OpeningTimes from "./globals/OpeningTimes";
import { onInitExtension } from "./onInitExtension";

export const appointments =
	(pluginOptions?: PluginTypes): Plugin =>
	incomingConfig => {
		let config: Config = { ...incomingConfig };
		const webpack = extendWebpackConfig(incomingConfig);

		config.admin = {
			...(config.admin || {}),
			webpack,
			components: {
				...(config.admin?.components || {}),
				afterDashboard: [...(config.admin?.components?.afterDashboard || [])],
			},
		};

		config.admin = {
			...(config.admin || {}),
			components: {
				...(config.admin?.components || {}),
				views: {
					...(config.admin.components?.views || {}),
					AppointmentsList: {
						Component: AppointmentsList,
						path: "/appointments-schedule",
						exact: true,
					},
					// AppointmentsListMe: {
					// 	Component: AppointmentsListMe,
					// 	path: "/appointments-schedule/me",
					// 	exact: true,
					// },
				},
				beforeNavLinks: [
					...(config.admin?.components?.beforeNavLinks || []),
					BeforeNavLinks,
				],
			},
		};

		config.collections = [...(config.collections || []), Appointments, Customers, Services];

		if (config.collections !== undefined) {
			const userCollection = config.collections.find(
				collection => collection.slug === incomingConfig.admin?.user,
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
							condition: siblingData => {
								if (siblingData.takingAppointments) return true;
								return false;
							},
						},
					},
				];
			}
		}

		config.endpoints = [
			...(config.endpoints || []),
			// {
			// 	path: "/custom-endpoint",
			// 	method: "get",
			// 	root: true,
			// 	handler: (req, res): void => {
			// 		res.json({ message: "Here is a custom endpoint" });
			// 	},
			// },
		];

		config.globals = [...(config.globals || []), OpeningTimes];

		config.hooks = {
			...(config.hooks || {}),
		};

		config.onInit = async payload => {
			if (incomingConfig.onInit) await incomingConfig.onInit(payload);
			// Add additional onInit code by using the onInitExtension function
			onInitExtension(payload, pluginOptions);
		};

		return config;
	};
