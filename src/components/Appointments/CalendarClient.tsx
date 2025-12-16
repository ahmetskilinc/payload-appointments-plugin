'use client';

import type { Components, SlotInfo, View } from 'react-big-calendar';

import { useDocumentDrawer } from '@payloadcms/ui';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { momentLocalizer, Calendar as ReactBigCalendar } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

import type {
  Appointment as AppointmentType,
  AppointmentStatus,
  BigCalendarAppointment,
  TeamMember,
} from '../../types';

import Appointment from './Appointment';
import Blockout from './Blockout';
import StatsCard from './StatsCard';
import Toolbar from './Toolbar';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop<BigCalendarAppointment, TeamMember>(ReactBigCalendar);

interface CalendarClientProps {
  apiRoute: string;
  collectionSlug: string;
  initialAppointments: AppointmentType[];
  initialTeamMembers: TeamMember[];
}

function getDateRangeForView(date: Date, view: View): { start: Date; end: Date } {
  const m = moment(date);
  if (view === 'week') {
    return {
      start: m.clone().startOf('week').toDate(),
      end: m.clone().endOf('week').toDate(),
    };
  }
  return {
    start: m.clone().startOf('day').toDate(),
    end: m.clone().endOf('day').toDate(),
  };
}

export default function CalendarClient({
  apiRoute,
  collectionSlug,
  initialAppointments,
  initialTeamMembers,
}: CalendarClientProps) {
  const [view, setView] = useState<View>('day');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<AppointmentType[]>(initialAppointments);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [teamFilter, setTeamFilter] = useState<string | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);

  const takingAppointments = useMemo(
    () => initialTeamMembers.filter((user: TeamMember) => user.takingAppointments),
    [initialTeamMembers],
  );

  const filteredTeamMembers = useMemo(() => {
    if (teamFilter === 'all') return takingAppointments;
    return takingAppointments.filter((member) => String(member.id) === teamFilter);
  }, [takingAppointments, teamFilter]);

  const [DocumentDrawer, , { isDrawerOpen, toggleDrawer }] = useDocumentDrawer({
    collectionSlug,
  });

  const fetchAppointments = useCallback(async () => {
    const { start, end } = getDateRangeForView(currentDate, view);

    const params = new URLSearchParams();
    params.set('where[start][greater_than_equal]', start.toISOString());
    params.set('where[end][less_than_equal]', end.toISOString());
    params.set('limit', '500');
    params.set('depth', '1');

    setIsLoading(true);
    try {
      const res = await fetch(`${apiRoute}/${collectionSlug}?${params.toString()}`);
      const appointmentsRes = await res.json();
      setAppointments(appointmentsRes.docs);
    } finally {
      setIsLoading(false);
    }
  }, [apiRoute, collectionSlug, currentDate, view]);

  useEffect(() => {
    if (!isDrawerOpen) {
      fetchAppointments();
    }
  }, [isDrawerOpen, fetchAppointments]);

  const remappedAppointments = useMemo(() => {
    return appointments
      .filter((doc: AppointmentType) => {
        if (statusFilter !== 'all' && doc.status !== statusFilter) {
          return false;
        }
        return true;
      })
      .map((doc: AppointmentType) => ({
        ...doc,
        end: moment(doc.end).toDate(),
        hostId: doc.host.id,
        start: moment(doc.start).toDate(),
      }));
  }, [appointments, statusFilter]);

  const handleSlotSelect = useCallback(
    (_slotInfo: SlotInfo) => {
      toggleDrawer();
    },
    [toggleDrawer],
  );

  const handleEventDrop = useCallback(
    async ({ end, event, resourceId, start }: any) => {
      const data = {
        end: moment(end).toISOString(),
        host: resourceId,
        start: moment(start).toISOString(),
      };

      await fetch(`${apiRoute}/${collectionSlug}/${event.id}`, {
        body: JSON.stringify(data),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      });
      await fetchAppointments();
    },
    [apiRoute, collectionSlug, fetchAppointments],
  );

  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const handleNewAppointment = useCallback(() => {
    toggleDrawer();
  }, [toggleDrawer]);

  const components: Components<BigCalendarAppointment, TeamMember> = useMemo(
    () => ({
      event: ({ event }) => {
        if (event.appointmentType === 'appointment') {
          return <Appointment event={event} />;
        }
        if (event.appointmentType === 'blockout') {
          return <Blockout event={event} />;
        }
        return null;
      },
    }),
    [],
  );

  return (
    <React.Fragment>
      <Toolbar
        currentDate={currentDate}
        onDateChange={handleDateChange}
        onNewAppointment={handleNewAppointment}
        onStatusFilterChange={setStatusFilter}
        onTeamFilterChange={setTeamFilter}
        statusFilter={statusFilter}
        teamFilter={teamFilter}
        teamMembers={takingAppointments}
      />

      <StatsCard appointments={appointments} currentDate={currentDate} />

      <div className={`appointments-calendar ${isLoading ? 'appointments-calendar--loading' : ''}`}>
        <DnDCalendar
          components={components}
          date={currentDate}
          defaultView={view}
          events={remappedAppointments}
          localizer={localizer}
          max={new Date(1970, 0, 0, 19, 0, 0, 0)}
          min={new Date(1970, 0, 0, 9, 0, 0, 0)}
          onEventDrop={handleEventDrop}
          onNavigate={(date) => setCurrentDate(date)}
          onSelectSlot={handleSlotSelect}
          onView={(newView: View) => setView(newView)}
          resizable={false}
          resourceAccessor="hostId"
          resourceIdAccessor="id"
          resources={filteredTeamMembers}
          resourceTitleAccessor="preferredNameAppointments"
          selectable
          step={15}
          titleAccessor="title"
          views={['week', 'day']}
        />
      </div>

      <DocumentDrawer />
    </React.Fragment>
  );
}
