import React, { useMemo, useReducer, useState } from "react";
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
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { useDocumentDrawer } from "payload/components/elements";
import Appointments from "../../../collections/Appointments";

const localizer = momentLocalizer(moment);
// const DragAndDropCalendar = withDragAndDrop(ReactBigCalendar);

const initialParams = {
	depth: 100,
};

const Calendar: React.FC<{
	resources: Host[];
	events: AppointmentType[];
	setAppointmentsParams?: React.Dispatch<unknown>;
	setHostsParams?: React.Dispatch<unknown>;
}> = ({ resources, events, setAppointmentsParams, setHostsParams }) => {
	const [date, setDate] = useState<Date>(moment().toDate());
	const [cacheBust, dispatchCacheBust] = useReducer(state => state + 1, 0);

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

	const [DocumentDrawer, DocumentDrawerToggler, { closeDrawer, openDrawer }] = useDocumentDrawer({
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

	const handleSlotSelect = (slotInfo: SlotInfo) => {
		console.log(slotInfo);
		openDrawer();
	};

	const components: Components<BigCalendarAppointment, Host> = useMemo(
		() => ({
			event: ({ event }) => {
				if (event.appointmentType === "appointment")
					return (
						<Appointment
							event={event}
							setAppointmentsParams={setAppointmentsParams}
							setHostsParams={setHostsParams}
						/>
					);
				if (event.appointmentType === "blockout") return <Blockout event={event} />;
				return null;
			},
		}),
		[],
	);

	return (
		<div className="rbc-calendar-container">
			{remapAppointments() && resources ? (
				<ReactBigCalendar
					localizer={localizer}
					events={remapAppointments()}
					startAccessor="start"
					endAccessor="end"
					defaultView="day"
					views={["week", "day"]}
					step={30}
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
			<DocumentDrawer onSave={updateRelationship} />
		</div>
	);
};

export default Calendar;
