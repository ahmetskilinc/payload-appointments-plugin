import { AdminViewComponent } from "payload/config";
import React, { useEffect } from "react";
import Calendar from "../components/Appointments/Calendar";
import { DefaultTemplate } from "payload/components/templates";
import { usePayloadAPI, useStepNav } from "payload/components/hooks";
import Appointments from "../collections/Appointments";
import { useConfig } from "payload/components/utilities";
import "../components/Appointments/Calendar/styles.scss";
import { AppointmentProvider } from "../providers/AppointmentsProvider";
import { AppointmentModal } from "../components/AppointmentModal";
import { User } from "../types";

const AppointmentsList: AdminViewComponent = ({ user, canAccessAdmin }) => {
	const { setStepNav } = useStepNav();

	useEffect(() => {
		setStepNav([
			{
				label: "Appointments List",
			},
		]);
	}, [setStepNav]);

	if (!user) return null;

	const {
		routes: { api },
		admin,
		serverURL,
	} = useConfig();

	const [
		{
			data: { docs: appointments },
		},
	] = usePayloadAPI(`${serverURL}${api}/${Appointments.slug}`);

	const [
		{
			data: { docs: users },
		},
	] = usePayloadAPI(`${serverURL}${api}/${admin.user}`);

	return (
		<AppointmentProvider>
			<DefaultTemplate>
				<div className="collection-list appointments-calendar-view">
					<h1>Appointments List</h1>
					{users && appointments ? (
						<Calendar
							resources={users.filter((user: User) => user.takingAppointments)}
							events={appointments}
						/>
					) : null}
				</div>
				{/* <AppointmentModal /> */}
			</DefaultTemplate>
		</AppointmentProvider>
	);
};

export default AppointmentsList;
