'use client';

import { useConfig, useStepNav } from '@payloadcms/ui';
import { useEffect } from 'react';

import type { Appointment, TeamMember } from '../../types';

import Calendar from '../../components/Appointments/index';
import { getClientSettings } from '../../lib/clientSettings';

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
  const { config } = useConfig();
  const label = getClientSettings(config).views.schedule.label;

  useEffect(() => {
    setStepNav([
      {
        label,
      },
    ]);
  }, [label, setStepNav]);

  return (
    <div className="collection-list appointments-calendar-view">
      <header className="list-header">
        <h1>{label}</h1>
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
