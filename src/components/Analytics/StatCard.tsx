'use client';

import * as React from 'react';

import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, description, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('stat-card', className)}>
      <div className="stat-card__header">
        <h3 className="stat-card__title">{title}</h3>
        {icon && <div className="stat-card__icon">{icon}</div>}
      </div>
      <p className="stat-card__value">{value}</p>
      {description && <p className="stat-card__description">{description}</p>}
      {trend && (
        <p
          className={cn(
            'stat-card__trend',
            trend.isPositive ? 'stat-card__trend--positive' : 'stat-card__trend--negative',
          )}
        >
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from previous period
        </p>
      )}
    </div>
  );
}
