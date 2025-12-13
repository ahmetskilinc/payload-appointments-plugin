import type { Appointment as AppointmentType, TeamMember } from '../../types'

import CalendarClient from './CalendarClient'
import './styles.scss'

interface CalendarProps {
  apiRoute: string
  collectionSlug: string
  initialAppointments: AppointmentType[]
  initialTeamMembers: TeamMember[]
}

export default function Calendar({
  apiRoute,
  collectionSlug,
  initialAppointments,
  initialTeamMembers,
}: CalendarProps) {
  return (
    <CalendarClient
      apiRoute={apiRoute}
      collectionSlug={collectionSlug}
      initialAppointments={initialAppointments}
      initialTeamMembers={initialTeamMembers}
    />
  )
}
