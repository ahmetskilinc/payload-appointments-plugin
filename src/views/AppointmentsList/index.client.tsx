"use client";

import { useStepNav } from "@payloadcms/ui";
import { useEffect } from "react";
import Calendar from "../../components/Appointments";
import "../../components/Appointments/styles.scss";

const AppointmentsListClient: React.FC = () => {
  const { setStepNav } = useStepNav();

  useEffect(() => {
    setStepNav([
      {
        label: "Appointments List",
      },
    ]);
  }, [setStepNav]);

  return (
    <div className="collection-list appointments-calendar-view">
      <header className="list-header">
        <h1>Appointments</h1>
      </header>
      {<Calendar />}
    </div>
  );
};

export default AppointmentsListClient;
