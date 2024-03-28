import { AdminViewComponent } from "payload/config";
import React, { useEffect } from "react";
import Calendar from "../components/Appointments/Calendar";
import { DefaultTemplate } from "payload/components/templates";
import { usePayloadAPI, useStepNav } from "payload/components/hooks";
import Appointments from "../collections/Appointments";
import { useConfig } from "payload/components/utilities";
import Hosts from "../collections/Hosts";
import "../components/Appointments/Calendar/styles.scss";
import { AppointmentProvider } from "../providers/AppointmentsProvider";
import { AppointmentModal } from "../components/AppointmentModal";
import { ModalProvider } from "@faceless-ui/modal";

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

	const [
		{
			data: { docs: appointments },
		},
	] = usePayloadAPI(`${serverURL}${api}/${Appointments.slug}`);

	const [
		{
			data: { docs: hosts },
		},
	] = usePayloadAPI(`${serverURL}${api}/${Hosts.slug}`);

	return (
		<ModalProvider>
			<AppointmentProvider>
				<DefaultTemplate>
					<div className="collection-list appointments-calendar-view">
						<h1>Appointments List</h1>
						{hosts && appointments ? (
							<Calendar resources={hosts} events={appointments} />
						) : null}
					</div>
					<AppointmentModal />
				</DefaultTemplate>
			</AppointmentProvider>
		</ModalProvider>
	);
};

export default AppointmentsList;
