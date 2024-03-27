import { AdminViewComponent } from "payload/config";
import React, { useEffect, useState } from "react";
import Calendar from "../components/Appointments/Calendar";
import { DefaultTemplate } from "payload/components/templates";
import { usePayloadAPI, useStepNav } from "payload/components/hooks";
import Appointments from "../collections/Appointments";
import { useConfig } from "payload/components/utilities";
import Hosts from "../collections/Hosts";
import "../components/Appointments/Calendar/styles.scss";

const AppointmentsList: AdminViewComponent = ({ user, canAccessAdmin }) => {
	const { setStepNav } = useStepNav();

	useEffect(() => {
		setStepNav([
			{
				label: "Appointments List",
			},
		]);
	}, [setStepNav]);

	const {
		routes: { api },
		serverURL,
	} = useConfig();

	const myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");
	myHeaders.append("Cookie", "lng=en");

	const [
		{
			data: { docs: appointments },
		},
		{ setParams: setAppointmentsParams },
	] = usePayloadAPI(`${serverURL}${api}/${Appointments.slug}`);

	const [
		{
			data: { docs: hosts },
		},
		{ setParams: setHostsParams },
	] = usePayloadAPI(`${serverURL}${api}/${Hosts.slug}`);

	return (
		<DefaultTemplate>
			<div className="collection-list appointments-calendar-view">
				<h1>Appointments List</h1>
				{hosts && appointments ? (
					<Calendar
						resources={hosts}
						events={appointments}
						setAppointmentsParams={setAppointmentsParams}
						setHostsParams={setHostsParams}
					/>
				) : null}
			</div>
		</DefaultTemplate>
	);
};

export default AppointmentsList;
