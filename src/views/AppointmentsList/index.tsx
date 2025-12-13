import type { AdminViewProps } from 'payload'

import { DefaultTemplate } from '@payloadcms/next/templates'

import type { Appointment, TeamMember } from '../../types'

import Appointments from '../../collections/Appointments'
import TeamMembers from '../../collections/TeamMembers'
import { AppointmentProvider } from '../../providers/AppointmentsProvider'
import AppointmentsListClient from './index.client'

const AppointmentsList: React.FC<AdminViewProps> = async ({
  initPageResult,
  params,
  searchParams,
}) => {
  const { payload } = initPageResult.req

  const [appointmentsRes, teamMembersRes] = await Promise.all([
    payload.find({
      collection: Appointments.slug as 'appointments',
      depth: 1,
      limit: 1000,
    }),
    payload.find({
      collection: TeamMembers.slug as 'teamMembers',
      limit: 1000,
    }),
  ])

  const apiRoute = payload.config.routes.api

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
  )
}

export default AppointmentsList
