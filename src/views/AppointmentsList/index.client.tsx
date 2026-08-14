'use client';

import { useStepNav } from '@payloadcms/ui';
import { useEffect } from 'react';

import type { Appointment, TeamMember } from '../../types';

import Calendar from '../../components/Appointments/index';

interface AppointmentsListClientProps {
  apiRoute: string;
  collectionSlug: string;
  initialAppointments: Appointment[];
  initialTeamMembers: TeamMember[];
}

const AppointmentsListClient: React.FC<AppointmentsListClientProps> = ({
  apiRoute,
  collectionSlug,
  initialAppointments,
  initialTeamMembers,
}) => {
  const { setStepNav } = useStepNav();

  useEffect(() => {
    setStepNav([
      {
        label: 'Appointments List',
      },
    ]);
  }, [setStepNav]);

  return (
    <div className="collection-list appointments-calendar-view">
      <header className="list-header">
        <h1>Appointments</h1>
      </header>
      <Calendar
        apiRoute={apiRoute}
        collectionSlug={collectionSlug}
        initialAppointments={initialAppointments}
        initialTeamMembers={initialTeamMembers}
      />
    </div>
  );
};

export default AppointmentsListClient;
