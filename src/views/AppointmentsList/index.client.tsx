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
import { TeamMember } from "../../types";
import TeamMembers from "../../collections/TeamMembers";

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
			data: { docs: teamMembers },
		},
	] = usePayloadAPI(`${serverURL}${apiRoute}/${TeamMembers.slug}`);

	const takingAppointments = teamMembers?.filter(
		(user: TeamMember) => user.takingAppointments,
	);

	return (
		<div className="collection-list appointments-calendar-view">
			<ListHeader heading="Appointments" />
			{takingAppointments && appointments ? (
				<Calendar
					resources={takingAppointments}
					events={appointments}
				/>
			) : null}
		</div>
	);
};

export default AppointmentsListClient;
