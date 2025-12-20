'use client';

import React, { useMemo } from 'react';

import type { Appointment, AppointmentStatus } from '../../types';

interface StatsCardProps {
  appointments: Appointment[];
  currentDate: Date;
}

const StatsCard: React.FC<StatsCardProps> = ({ appointments, currentDate }) => {
  const stats = useMemo(() => {
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const todaysAppointments = appointments.filter((apt) => {
      if (apt.appointmentType !== 'appointment') return false;
      const aptDate = new Date(apt.start);
      return aptDate >= startOfDay && aptDate <= endOfDay;
    });

    const statusCounts: Record<AppointmentStatus, number> = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      'no-show': 0,
    };

    todaysAppointments.forEach((apt) => {
      if (apt.status) {
        statusCounts[apt.status]++;
      }
    });

    return {
      total: todaysAppointments.length,
      ...statusCounts,
    };
  }, [appointments, currentDate]);

  return (
    <div className="appointments-stats">
      <div className="appointments-stats__item">
        <span className="appointments-stats__value">{stats.total}</span>
        <span className="appointments-stats__label">Today</span>
      </div>
      <div className="appointments-stats__item appointments-stats__item--confirmed">
        <span className="appointments-stats__value">{stats.confirmed}</span>
        <span className="appointments-stats__label">Confirmed</span>
      </div>
      <div className="appointments-stats__item appointments-stats__item--pending">
        <span className="appointments-stats__value">{stats.pending}</span>
        <span className="appointments-stats__label">Pending</span>
      </div>
      <div className="appointments-stats__item appointments-stats__item--completed">
        <span className="appointments-stats__value">{stats.completed}</span>
        <span className="appointments-stats__label">Completed</span>
      </div>
    </div>
  );
};

export default StatsCard;
