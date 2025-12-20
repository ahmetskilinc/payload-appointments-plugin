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

interface PopularService {
  serviceId: string;
  serviceName: string;
  count: number;
  revenue: number;
}

interface ServicesPieChartProps {
  data: PopularService[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function ServicesPieChart({ data }: ServicesPieChartProps) {
  const chartConfig: ChartConfig = data.reduce((acc, service, index) => {
    acc[service.serviceName] = {
      label: service.serviceName,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  const chartData = data.map((service, index) => ({
    name: service.serviceName,
    value: service.count,
    fill: COLORS[index % COLORS.length],
  }));

  if (data.length === 0) {
    return (
      <div className="analytics-card">
        <div className="analytics-card__header">
          <h3 className="analytics-card__title">Popular Services</h3>
          <p className="analytics-card__description">Top services by booking count</p>
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
        <h3 className="analytics-card__title">Popular Services</h3>
        <p className="analytics-card__description">Top services by booking count</p>
      </div>
      <div className="analytics-card__content">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
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
