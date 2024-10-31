import { DefaultTemplate } from "@payloadcms/next/templates";
import type { AdminViewProps } from "payload";
import React from "react";
import AppointmentsListMeClient from "./index.client";
import { Appointment, User } from "@/src/types";

const AppointmentsListMe: React.FC<AdminViewProps> = async ({
	initPageResult,
	params,
	searchParams,
}) => {
	const appointments: Appointment[] = (
		await initPageResult.req.payload.find({
			collection: "appointments",
			where: {
				"host.id": {
					equals: initPageResult.req.user?.id,
				},
			},
		})
	).docs as Appointment[];

	const hosts: User[] = (
		await initPageResult.req.payload.find({
			collection: "users",
			where: {
				id: {
					equals: initPageResult.req.user?.id,
				},
			},
		})
	).docs as User[];

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
			<AppointmentsListMeClient
				appointments={appointments}
				hosts={hosts}
			/>
		</DefaultTemplate>
	);
};

export default AppointmentsListMe;
