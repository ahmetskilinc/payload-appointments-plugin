import React, { useReducer } from "react";
import type { BigCalendarAppointment } from "../../../types";
import { useDocumentDrawer } from "payload/components/elements";
import "./eventStyles.scss";
import Appointments from "../../../collections/Appointments";
import moment from "moment";

const initialParams = {
	depth: 100,
};

const Appointment = ({
	event,
	setAppointmentsParams,
	setHostsParams,
}: {
	event: BigCalendarAppointment;
	setAppointmentsParams?: React.Dispatch<unknown>;
	setHostsParams?: React.Dispatch<unknown>;
}) => {
	const [cacheBust, dispatchCacheBust] = useReducer(state => state + 1, 0);
	const [DocumentDrawer, DocumentDrawerToggler, { closeDrawer, openDrawer }] = useDocumentDrawer({
		id: event.id,
		collectionSlug: Appointments.slug,
	});

	const updateRelationship = React.useCallback(
		({}) => {
			setAppointmentsParams!({
				...initialParams,
				cacheBust,
			});
			closeDrawer();
			dispatchCacheBust();
		},
		[cacheBust, setAppointmentsParams, closeDrawer],
	);

	return (
		<>
			<div className="event appointment" onClick={() => openDrawer()}>
				<p className="event__label">{event.customer.firstName}</p>
				<p className="event__start-end">
					{moment(event.start).format("HH:mm")} - {moment(event.end).format("HH:mm")} -{" "}
					{event.services.map(service => service.title).join(", ")}
				</p>
			</div>
			<DocumentDrawer onSave={updateRelationship} />
		</>
	);
};

export default Appointment;
