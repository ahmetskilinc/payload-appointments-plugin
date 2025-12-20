'use client';

import * as React from 'react';

interface HostUtilization {
  hostId: string;
  hostName: string;
  appointmentsCount: number;
  hoursBooked: number;
  completedCount: number;
  cancelledCount: number;
}

interface HostUtilizationTableProps {
  data: HostUtilization[];
}

export function HostUtilizationTable({ data }: HostUtilizationTableProps) {
  if (data.length === 0) {
    return (
      <div className="analytics-card">
        <div className="analytics-card__header">
          <h3 className="analytics-card__title">Team Performance</h3>
          <p className="analytics-card__description">Appointment statistics by team member</p>
        </div>
        <div className="analytics-card__content analytics-card__content--empty">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-card">
      <div className="analytics-card__header">
        <h3 className="analytics-card__title">Team Performance</h3>
        <p className="analytics-card__description">Appointment statistics by team member</p>
      </div>
      <div className="analytics-card__content" style={{ padding: 0 }}>
        <table className="utilization-table">
          <thead>
            <tr>
              <th>Team Member</th>
              <th className="text-right">Appointments</th>
              <th className="text-right">Hours</th>
              <th className="text-right">Completed</th>
              <th className="text-right">Cancelled</th>
            </tr>
          </thead>
          <tbody>
            {data.map((host) => (
              <tr key={host.hostId}>
                <td className="font-medium">{host.hostName}</td>
                <td className="text-right">{host.appointmentsCount}</td>
                <td className="text-right">{host.hoursBooked.toFixed(1)}</td>
                <td className="text-right text-success">{host.completedCount}</td>
                <td className="text-right text-error">{host.cancelledCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
