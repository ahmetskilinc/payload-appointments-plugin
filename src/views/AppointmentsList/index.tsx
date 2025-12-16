import type { AdminViewProps } from 'payload';

import { DefaultTemplate } from '@payloadcms/next/templates';

import type { Appointment, TeamMember } from '../../types';

import Appointments from '../../collections/Appointments';
import TeamMembers from '../../collections/TeamMembers';
import { AppointmentProvider } from '../../providers/AppointmentsProvider';
import AppointmentsListClient from './index.client';

const AppointmentsList: React.FC<AdminViewProps> = async ({
  initPageResult,
  params,
  searchParams,
}) => {
  const { payload } = initPageResult.req;

  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const [appointmentsRes, teamMembersRes] = await Promise.all([
    payload.find({
      collection: Appointments.slug as 'appointments',
      depth: 1,
      limit: 500,
      where: {
        and: [
          {
            start: {
              greater_than_equal: startOfDay.toISOString(),
            },
          },
          {
            end: {
              less_than_equal: endOfDay.toISOString(),
            },
          },
        ],
      },
    }),
    payload.find({
      collection: TeamMembers.slug as 'teamMembers',
      limit: 100,
    }),
  ]);

  const apiRoute = payload.config.routes.api;

  return (
    <AppointmentProvider>
      <DefaultTemplate
        i18n={initPageResult.req.i18n}
        locale={initPageResult.locale}
        params={params}
        payload={payload}
        permissions={initPageResult.permissions}
        searchParams={searchParams}
        user={initPageResult.req.user || undefined}
        visibleEntities={initPageResult.visibleEntities}
      >
        <AppointmentsListClient
          apiRoute={apiRoute}
          collectionSlug={Appointments.slug}
          initialAppointments={appointmentsRes.docs as unknown as Appointment[]}
          initialTeamMembers={teamMembersRes.docs as unknown as TeamMember[]}
        />
      </DefaultTemplate>
    </AppointmentProvider>
  );
};

export default AppointmentsList;
