import React, { useMemo, useState } from "react";
import {
	Components,
	Calendar as ReactBigCalendar,
	SlotInfo,
	momentLocalizer,
} from "react-big-calendar";
import moment from "moment";
import "./styles.scss";
import type { Appointment as AppointmentType, Host, BigCalendarAppointment } from "../../../types";
import Appointment from "./Appointment";
import Blockout from "./Blockout";
import { useAppointments } from "../../../providers/AppointmentsProvider";

const localizer = momentLocalizer(moment);

const Calendar: React.FC<{
	resources: Host[];
	events: AppointmentType[];
}> = ({ resources, events }) => {
	const [date, setDate] = useState<Date>(moment().toDate());
	const { openModal } = useAppointments();

	const remapAppointments = () => {
		return events.map(doc => {
			return {
				...doc,
				start: moment(doc.start).toDate(),
				end: moment(doc.end).toDate(),
				hostId: doc.host.id,
			};
		});
	};

	const handleSlotSelect = (slotInfo: SlotInfo) => {
		openModal({ type: "add", slotInfo });
	};

	const components: Components<BigCalendarAppointment, Host> = useMemo(
		() => ({
			event: ({ event }) => {
				if (event.appointmentType === "appointment") return <Appointment event={event} />;
				if (event.appointmentType === "blockout") return <Blockout event={event} />;
				return null;
			},
		}),
		[],
	);

	return (
		<React.Fragment>
			{remapAppointments() && resources ? (
				<ReactBigCalendar
					localizer={localizer}
					events={remapAppointments()}
					startAccessor="start"
					endAccessor="end"
					defaultView="day"
					views={["week", "day"]}
					step={15}
					defaultDate={date}
					titleAccessor="title"
					resourceAccessor="hostId"
					resourceIdAccessor="id"
					resourceTitleAccessor="prefferedName"
					resources={resources}
					min={new Date(1970, 0, 0, 7, 0, 0, 0)}
					max={new Date(1970, 0, 0, 21, 0, 0, 0)}
					components={components}
					selectable={true}
					onSelectSlot={handleSlotSelect}
				/>
			) : null}
		</React.Fragment>
	);
};

export default Calendar;
