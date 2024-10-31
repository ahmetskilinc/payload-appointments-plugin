"use client";

import {
	ListHeader,
	useConfig,
	usePayloadAPI,
	useStepNav,
} from "@payloadcms/ui";
import { useEffect } from "react";
import Appointments from "../../collections/Appointments";
import Calendar from "../../components/Appointments";
import "../../components/Appointments/styles.scss";
import { User } from "../../types";
import { AppointmentModal } from "../../components/AppointmentModal";

const AppointmentsListClient: React.FC = () => {
	const { setStepNav } = useStepNav();

	useEffect(() => {
		setStepNav([
			{
				label: "Appointments List",
			},
		]);
	}, [setStepNav]);

	const {
		config: {
			routes: { api: apiRoute },
			admin,
			serverURL,
		},
	} = useConfig();

	const [
		{
			data: { docs: appointments },
		},
	] = usePayloadAPI(`${serverURL}${apiRoute}/${Appointments.slug}`);

	const [
		{
			data: { docs: admins },
		},
	] = usePayloadAPI(`${serverURL}${apiRoute}/${admin.user}`);

	const takingAppointments = admins?.filter(
		(user: User) => user.roles === "admin" && user.takingAppointments,
	);

	return (
		<>
			<div className="collection-list appointments-calendar-view">
				<ListHeader heading="Appointments" />
				{takingAppointments && appointments ? (
					<Calendar
						resources={takingAppointments}
						events={appointments}
					/>
				) : null}
			</div>
			<AppointmentModal />
		</>
	);
};

export default AppointmentsListClient;
