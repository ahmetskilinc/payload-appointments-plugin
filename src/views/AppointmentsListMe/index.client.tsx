"use client";

import { ListHeader, useConfig, useStepNav } from "@payloadcms/ui";
import moment from "moment";
import React, { useEffect, useState } from "react";
import Calendar from "../../components/Appointments";
import { Appointment, User } from "../../types";

const AppointmentsListMeClient: React.FC<{
	hosts: User[];
	appointments: Appointment[];
}> = ({ hosts, appointments }) => {
	const { setStepNav } = useStepNav();
	const {
		config: {
			routes: { admin: adminRoute },
		},
	} = useConfig();

	useEffect(() => {
		setStepNav([
			{
				label: "Appointments Schedule",
				url: `${adminRoute}/appointments/schedule`,
			},
			{
				label: "My Appointments",
			},
		]);
	}, [setStepNav]);

	const myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");

	return (
		<div className="collection-list appointments-calendar-view">
			<ListHeader heading="Appointments" />
			{hosts && appointments ? (
				<Calendar events={appointments} resources={hosts} />
			) : null}
		</div>
	);
};

export default AppointmentsListMeClient;
