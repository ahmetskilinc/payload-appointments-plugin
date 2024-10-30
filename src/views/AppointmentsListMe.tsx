"use client";

import { DefaultTemplate } from "@payloadcms/next/templates";
import { useStepNav } from "@payloadcms/ui";
import moment from "moment";
import type { AdminViewProps } from "payload";
import React, { useEffect, useState } from "react";
import Calendar from "../components/Appointments/Calendar";
import { Appointment, User } from "../types";

const AppointmentsListMe: React.FC<AdminViewProps> = ({
	initPageResult,
	params,
	searchParams,
}) => {
	const { setStepNav } = useStepNav();

	useEffect(() => {
		setStepNav([
			{
				label: "Appointments List",
				url: "/admin/appointments-list",
			},
			{
				label: "My Appointments",
			},
		]);
	}, [setStepNav]);

	const [appointments, setAppointments] = useState<Appointment[] | undefined>(
		undefined,
	);
	const [hosts, setHosts] = useState<User[] | undefined>(undefined);

	const myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");

	useEffect(() => {
		fetch("http://localhost:3000/api/appointments")
			.then((response) => response.json())
			.then((result) => {
				const newApps = result.docs.map((doc: Appointment) => {
					return {
						...doc,
						start: moment(doc.start).toDate(),
						end: moment(doc.end).toDate(),
						hostId: doc.host.id,
					};
				});
				setAppointments(newApps);
			})
			.catch((error) => {
				console.error(error);
				setAppointments([]);
			});
	}, []);

	return (
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
			<div
				style={{
					paddingLeft: "var(--gutter-h)",
					paddingRight: "var(--gutter-h)",
				}}
				className="collection-list"
			>
				<h1>Appointments List Me</h1>
				{hosts && appointments ? (
					<Calendar events={appointments} resources={hosts} />
				) : null}
			</div>
		</DefaultTemplate>
	);
};

export default AppointmentsListMe;
