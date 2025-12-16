'use client';

import * as React from 'react';
import { Pie, PieChart, Cell } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '../ui/chart';

interface AppointmentStats {
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
  pending: number;
  confirmed: number;
}

interface StatusBreakdownChartProps {
  data: AppointmentStats;
}

const STATUS_CONFIG: ChartConfig = {
  completed: {
    label: 'Completed',
    color: 'hsl(142, 76%, 36%)',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'hsl(217, 91%, 60%)',
  },
  pending: {
    label: 'Pending',
    color: 'hsl(48, 96%, 53%)',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'hsl(0, 84%, 60%)',
  },
  noShow: {
    label: 'No Show',
    color: 'hsl(0, 0%, 45%)',
  },
};

export function StatusBreakdownChart({ data }: StatusBreakdownChartProps) {
  const chartData = [
    { name: 'Completed', value: data.completed, fill: STATUS_CONFIG.completed.color },
    { name: 'Confirmed', value: data.confirmed, fill: STATUS_CONFIG.confirmed.color },
    { name: 'Pending', value: data.pending, fill: STATUS_CONFIG.pending.color },
    { name: 'Cancelled', value: data.cancelled, fill: STATUS_CONFIG.cancelled.color },
    { name: 'No Show', value: data.noShow, fill: STATUS_CONFIG.noShow.color },
  ].filter((item) => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="analytics-card">
        <div className="analytics-card__header">
          <h3 className="analytics-card__title">Status Breakdown</h3>
          <p className="analytics-card__description">Appointments by status</p>
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
        <h3 className="analytics-card__title">Status Breakdown</h3>
        <p className="analytics-card__description">Appointments by status</p>
      </div>
      <div className="analytics-card__content">
        <ChartContainer config={STATUS_CONFIG} className="h-[300px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  );
}
