import React from "react";
import { Appointment, BigCalendarAppointment } from "../../../types";
import "./eventStyles.scss";

const Blockout = ({ event }: { event: BigCalendarAppointment }) => {
	return (
		<div className="event blockout">
			<p className="event__label">{event.title}</p>
		</div>
	);
};

export default Blockout;
