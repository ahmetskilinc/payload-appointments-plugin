import type { AdminViewProps } from 'payload';

import { DefaultTemplate } from '@payloadcms/next/templates';
import { redirect } from 'next/navigation';

import type { Appointment, TeamMember } from '../../types';

import { AppointmentProvider } from '../../providers/AppointmentsProvider';
import { getSlugs } from '../../slugs';
import AppointmentsListClient from './index.client';

const AppointmentsList: React.FC<AdminViewProps> = async ({
  initPageResult,
  params,
  searchParams,
}) => {
  const { payload, user } = initPageResult.req;

  if (!user) {
    redirect(`${payload.config.routes.admin}/login`);
  }

  const slugs = getSlugs(payload.config);

  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const [appointmentsRes, teamMembersRes] = await Promise.all([
    payload.find({
      collection: slugs.appointments,
      depth: 1,
      limit: 500,
      overrideAccess: false,
      user,
      where: {
        and: [
          {
            // Include appointments spanning the day's boundaries.
            start: {
              less_than_equal: endOfDay.toISOString(),
            },
          },
          {
            end: {
              greater_than_equal: startOfDay.toISOString(),
            },
          },
        ],
      },
    }),
    payload.find({
      collection: slugs.teamMembers,
      limit: 100,
      overrideAccess: false,
      user,
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
          collectionSlug={slugs.appointments}
          initialAppointments={appointmentsRes.docs as unknown as Appointment[]}
          initialTeamMembers={teamMembersRes.docs as unknown as TeamMember[]}
        />
      </DefaultTemplate>
    </AppointmentProvider>
  );
};

export default AppointmentsList;
