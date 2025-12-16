'use client';

import * as React from 'react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';

interface BookingTrend {
  date: string;
  count: number;
  revenue: number;
}

interface BookingTrendsChartProps {
  data: BookingTrend[];
  granularity: 'day' | 'week' | 'month';
}

const chartConfig = {
  count: {
    label: 'Appointments',
    color: 'hsl(var(--chart-1))',
  },
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function BookingTrendsChart({ data, granularity }: BookingTrendsChartProps) {
  const formatDate = (date: string) => {
    const d = new Date(date);
    switch (granularity) {
      case 'month':
        return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      case 'week':
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      default:
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: formatDate(item.date),
  }));

  return (
    <div className="analytics-card">
      <div className="analytics-card__header">
        <h3 className="analytics-card__title">Booking Trends</h3>
        <p className="analytics-card__description">Appointment counts over time</p>
      </div>
      <div className="analytics-card__content">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={formattedData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="formattedDate" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
