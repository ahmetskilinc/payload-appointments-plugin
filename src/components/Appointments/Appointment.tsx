import React from "react";
import type { BigCalendarAppointment } from "../../types";

import "./eventStyles.scss";
import moment from "moment";

const Appointment = ({ event }: { event: BigCalendarAppointment }) => {
	return (
		<div className="event appointment">
			<p className="event__label">{event.customer.firstName}</p>
			<p className="event__start-end">
				{moment(event.start).format("HH:mm")} -{" "}
				{moment(event.end).format("HH:mm")} -{" "}
				{event.services.map((service) => service.title).join(", ")}
			</p>
		</div>
	);
};

export default Appointment;
