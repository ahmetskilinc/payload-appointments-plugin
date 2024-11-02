import React from "react";
import { Appointment, BigCalendarAppointment } from "../../types";
import "./eventStyles.scss";
import { useDocumentDrawer } from "@payloadcms/ui";

const Blockout = ({ event }: { event: BigCalendarAppointment }) => {
	const [DocumentDrawer, DocumentDrawerToggler] = useDocumentDrawer({
		id: event.id,
		collectionSlug: "appointments",
	});
	return (
		<>
			<DocumentDrawerToggler className="event">
				<div className="blockout">
					<p className="event__label">{event.title}</p>
				</div>
			</DocumentDrawerToggler>
			<DocumentDrawer />
		</>
	);
};

export default Blockout;
