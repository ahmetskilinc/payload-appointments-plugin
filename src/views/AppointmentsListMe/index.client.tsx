"use client";

import { useConfig, useStepNav } from "@payloadcms/ui";
import React, { useEffect } from "react";
import Calendar from "../../components/Appointments";
import { Appointment, TeamMember } from "../../types";

const AppointmentsListMeClient: React.FC<{
  hosts: TeamMember[];
  appointments: Appointment[];
}> = ({ hosts, appointments }) => {
  const { setStepNav } = useStepNav();
  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig();

  useEffect(() => {
    setStepNav([
      {
        label: "Appointments Schedule",
        url: `${adminRoute}/appointments/schedule`,
      },
      {
        label: "My Appointments",
      },
    ]);
  }, [setStepNav]);

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  return (
    <div className="collection-list appointments-calendar-view">
      <header className="list-header">
        <h1>My Appointments</h1>
      </header>
      {hosts && appointments ? <Calendar /> : null}
    </div>
  );
};

export default AppointmentsListMeClient;
