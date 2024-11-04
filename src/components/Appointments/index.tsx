"use client";

import { useConfig, useDocumentDrawer } from "@payloadcms/ui";
import moment from "moment";
import React, { useMemo, useState } from "react";
import { Components, Calendar as ReactBigCalendar, SlotInfo, View, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import Appointments from "../../collections/Appointments";
import type { Appointment as AppointmentType, BigCalendarAppointment, TeamMember, User } from "../../types";
import Appointment from "./Appointment";
import Blockout from "./Blockout";
import "./styles.scss";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(ReactBigCalendar);

const Calendar: React.FC<{
  resources: TeamMember[];
  events: AppointmentType[];
}> = ({ resources, events }) => {
  const [view, setView] = useState<View>("day");
  const {
    config: {
      routes: { api: apiRoute },
    },
  } = useConfig();

  const [DocumentDrawer, _DocumentDrawerToggler, { toggleDrawer }] = useDocumentDrawer({
    collectionSlug: Appointments?.slug,
  });

  const remapAppointments = () => {
    return events.map((doc) => {
      return {
        ...doc,
        start: moment(doc.start).toDate(),
        end: moment(doc.end).toDate(),
        hostId: doc.host.id,
      };
    });
  };

  const handleSlotSelect = (slotInfo: SlotInfo) => {
    toggleDrawer();
  };

  const handleEventDrop = async ({ event, start, end, resourceId }: any) => {
    const data = {
      host: resourceId,
      start: moment(start).toString(),
      end: moment(end).toString(),
    };

    await fetch(`${apiRoute}/${Appointments.slug}/${event.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  };

  const handleEventResize = async ({ event, start, end, resourceId }: any) => {
    const data = {
      host: resourceId,
      start: moment(start).toString(),
      end: moment(end).toString(),
    };

    await fetch(`${apiRoute}/${Appointments.slug}/${event.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  };

  const components: Components<BigCalendarAppointment, TeamMember> = useMemo(
    () => ({
      event: ({ event }) => {
        if (event.appointmentType === "appointment") return <Appointment event={event} />;
        if (event.appointmentType === "blockout") return <Blockout event={event} />;
        return null;
      },
    }),
    []
  );

  return (
    <React.Fragment>
      {remapAppointments() && resources ? (
        <DnDCalendar
          localizer={localizer}
          events={remapAppointments()}
          defaultView={view}
          views={["week", "day"]}
          step={15}
          // @ts-expect-error
          components={components}
          defaultDate={moment().subtract(1, "d").toDate()}
          // @ts-expect-error
          titleAccessor="title"
          onView={(newView) => setView(newView)}
          // @ts-expect-error
          resourceAccessor="hostId"
          // @ts-expect-error
          resourceIdAccessor="id"
          // @ts-expect-error
          resourceTitleAccessor="preferredNameAppointments"
          resources={resources}
          min={new Date(1970, 0, 0, 9, 0, 0, 0)}
          max={new Date(1970, 0, 0, 19, 0, 0, 0)}
          onSelectSlot={handleSlotSelect}
          onEventDrop={handleEventDrop}
          resizable={false}
          selectable
        />
      ) : null}
      <DocumentDrawer />
    </React.Fragment>
  );
};

export default Calendar;
