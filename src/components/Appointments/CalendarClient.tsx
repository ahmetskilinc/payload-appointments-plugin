'use client'

import type { Components, SlotInfo, View } from 'react-big-calendar'

import { useDocumentDrawer } from '@payloadcms/ui'
import moment from 'moment'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { momentLocalizer, Calendar as ReactBigCalendar } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'

import type {
  Appointment as AppointmentType,
  BigCalendarAppointment,
  TeamMember,
} from '../../types'

import Appointment from './Appointment'
import Blockout from './Blockout'

const localizer = momentLocalizer(moment)
const DnDCalendar = withDragAndDrop<BigCalendarAppointment, TeamMember>(ReactBigCalendar)

interface CalendarClientProps {
  apiRoute: string
  collectionSlug: string
  initialAppointments: AppointmentType[]
  initialTeamMembers: TeamMember[]
}

export default function CalendarClient({
  apiRoute,
  collectionSlug,
  initialAppointments,
  initialTeamMembers,
}: CalendarClientProps) {
  const [view, setView] = useState<View>('day')
  const [appointments, setAppointments] = useState<AppointmentType[]>(initialAppointments)

  const takingAppointments = useMemo(
    () => initialTeamMembers.filter((user: TeamMember) => user.takingAppointments),
    [initialTeamMembers],
  )

  const [DocumentDrawer, _DocumentDrawerToggler, { isDrawerOpen, toggleDrawer }] =
    useDocumentDrawer({
      collectionSlug,
    })

  const fetchAppointments = useCallback(async () => {
    const res = await fetch(`${apiRoute}/${collectionSlug}`)
    const appointmentsRes = await res.json()
    setAppointments(appointmentsRes.docs)
  }, [apiRoute, collectionSlug])

  useEffect(() => {
    if (!isDrawerOpen) {
      void fetchAppointments()
    }
  }, [isDrawerOpen, fetchAppointments])

  const remappedAppointments = useMemo(() => {
    return appointments.map((doc: AppointmentType) => ({
      ...doc,
      end: moment(doc.end).toDate(),
      hostId: doc.host.id,
      start: moment(doc.start).toDate(),
    }))
  }, [appointments])

  const handleSlotSelect = useCallback(
    (_slotInfo: SlotInfo) => {
      toggleDrawer()
    },
    [toggleDrawer],
  )

  const handleEventDrop = useCallback(
    async ({ end, event, resourceId, start }: any) => {
      const data = {
        end: moment(end).toISOString(),
        host: resourceId,
        start: moment(start).toISOString(),
      }

      await fetch(`${apiRoute}/${collectionSlug}/${event.id}`, {
        body: JSON.stringify(data),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      })
      await fetchAppointments()
    },
    [apiRoute, collectionSlug, fetchAppointments],
  )

  const components: Components<BigCalendarAppointment, TeamMember> = useMemo(
    () => ({
      event: ({ event }) => {
        if (event.appointmentType === 'appointment') {
          return <Appointment event={event} />
        }
        if (event.appointmentType === 'blockout') {
          return <Blockout event={event} />
        }
        return null
      },
    }),
    [],
  )

  if (!remappedAppointments.length && !takingAppointments.length) {
    return null
  }

  return (
    <React.Fragment>
      <DnDCalendar
        components={components}
        defaultDate={moment().subtract(1, 'd').toDate()}
        defaultView={view}
        events={remappedAppointments}
        localizer={localizer}
        max={new Date(1970, 0, 0, 19, 0, 0, 0)}
        min={new Date(1970, 0, 0, 9, 0, 0, 0)}
        onEventDrop={handleEventDrop}
        onSelectSlot={handleSlotSelect}
        onView={(newView: View) => setView(newView)}
        resizable={false}
        resourceAccessor="hostId"
        resourceIdAccessor="id"
        resources={takingAppointments}
        resourceTitleAccessor="preferredNameAppointments"
        selectable
        step={15}
        titleAccessor="title"
        views={['week', 'day']}
      />
      <DocumentDrawer />
    </React.Fragment>
  )
}
