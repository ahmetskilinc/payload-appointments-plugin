"use client";

import { DefaultTemplate } from "@payloadcms/next/templates";
import { useConfig, usePayloadAPI, useStepNav } from "@payloadcms/ui";
import { useEffect } from "react";
import type { AdminViewProps } from "payload";
import Appointments from "../collections/Appointments";
import { AppointmentModal } from "../components/AppointmentModal";
import Calendar from "../components/Appointments/Calendar";
import "../components/Appointments/Calendar/styles.scss";
import { AppointmentProvider } from "../providers/AppointmentsProvider";
import { User } from "../types";

const AppointmentsList: React.FC<AdminViewProps> = ({
	initPageResult,
	params,
	searchParams,
}) => {
	// const { setStepNav } = useStepNav();

	// useEffect(() => {
	// 	setStepNav([
	// 		{
	// 			label: "Appointments List",
	// 		},
	// 	]);
	// }, [setStepNav]);

	// // const {
	// // 	config: {
	// // 		routes: { api: apiRoute },
	// // 		admin,
	// // 		serverURL,
	// // 	},
	// // } = useConfig();

	// const {
	// 	req: {
	// 		payload: {
	// 			config: {
	// 				routes: { api: apiRoute },
	// 				admin,
	// 				serverURL,
	// 			},
	// 		},
	// 	},
	// } = initPageResult;

	// const [
	// 	{
	// 		data: { docs: appointments },
	// 	},
	// ] = usePayloadAPI(`${serverURL}${apiRoute}/${Appointments.slug}`);

	// const [
	// 	{
	// 		data: { docs: admins },
	// 	},
	// ] = usePayloadAPI(`${serverURL}${apiRoute}/${admin.user}`);

	// const takingAppointments = admins?.filter(
	// 	(user: User) => user.takingAppointments,
	// );

	return (
		<AppointmentProvider>
			<DefaultTemplate
				i18n={initPageResult.req.i18n}
				locale={initPageResult.locale}
				params={params}
				payload={initPageResult.req.payload}
				permissions={initPageResult.permissions}
				searchParams={searchParams}
				user={initPageResult.req.user || undefined}
				visibleEntities={initPageResult.visibleEntities}
			>
				<div className="collection-list appointments-calendar-view">
					<h1>Appointments List</h1>
					{/* {takingAppointments && appointments ? (
						<Calendar
							resources={takingAppointments}
							events={appointments}
						/>
					) : null} */}
				</div>
				{/* <AppointmentModal /> */}
			</DefaultTemplate>
		</AppointmentProvider>
	);
};

export default AppointmentsList;
