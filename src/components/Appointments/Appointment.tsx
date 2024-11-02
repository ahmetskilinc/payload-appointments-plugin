import React from "react";
import type { BigCalendarAppointment } from "../../types";

import "./eventStyles.scss";
import moment from "moment";
import { useDocumentDrawer } from "@payloadcms/ui";

const Appointment = ({ event }: { event: BigCalendarAppointment }) => {
	const [DocumentDrawer, DocumentDrawerToggler] = useDocumentDrawer({
		id: event.id,
		collectionSlug: "appointments",
	});

	return (
		<>
			<DocumentDrawerToggler className="event">
				<div className="appointment">
					<p className="event__label">
						{event.customer.firstName +
							" " +
							event.customer.lastName}
					</p>
					<p className="event__start-end">
						{moment(event.start).format("HH:mm")} -{" "}
						{moment(event.end).format("HH:mm")} -{" "}
						{event.services
							.map((service) => service.title)
							.join(", ")}
					</p>
				</div>
			</DocumentDrawerToggler>
			<DocumentDrawer />
		</>
	);
};

export default Appointment;
