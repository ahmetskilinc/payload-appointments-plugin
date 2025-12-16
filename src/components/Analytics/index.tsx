'use client';

import * as React from 'react';

import { StatCard } from './StatCard';
import { BookingTrendsChart } from './BookingTrendsChart';
import { ServicesPieChart } from './ServicesPieChart';
import { StatusBreakdownChart } from './StatusBreakdownChart';
import { HostUtilizationTable } from './HostUtilizationTable';
import type { AnalyticsData } from '../../utilities/analytics';

interface AnalyticsDashboardProps {
  className?: string;
}

type Granularity = 'day' | 'week' | 'month';

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [granularity, setGranularity] = React.useState<Granularity>('day');
  const [dateRange, setDateRange] = React.useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  });

  const fetchAnalytics = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        startDate: new Date(dateRange.startDate).toISOString(),
        endDate: new Date(dateRange.endDate + 'T23:59:59').toISOString(),
        granularity,
      });

      const response = await fetch(`/api/appointments-analytics?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [dateRange, granularity]);

  React.useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className={className}>
      <div className="analytics-filters">
        <div className="analytics-filters__row">
          <div className="field-type date">
            <label className="field-label">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
              className="date-input"
            />
          </div>
          <div className="field-type date">
            <label className="field-label">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
              className="date-input"
            />
          </div>
          <div className="field-type select">
            <label className="field-label">Granularity</label>
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value as Granularity)}
              className="select-input"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay loading-overlay--dimmed">
          <div className="loading-overlay__spinner" />
        </div>
      )}

      {error && (
        <div className="banner banner--error">
          <span className="banner__content">{error}</span>
        </div>
      )}

      {data && !loading && (
        <div className="analytics-content">
          <div className="analytics-stats-grid">
            <StatCard
              title="Total Appointments"
              value={data.appointmentStats.total}
              description="In selected period"
            />
            <StatCard
              title="Completed"
              value={data.appointmentStats.completed}
              description={`${data.appointmentStats.total > 0 ? ((data.appointmentStats.completed / data.appointmentStats.total) * 100).toFixed(1) : 0}% completion rate`}
            />
            <StatCard
              title="Revenue"
              value={formatCurrency(data.revenueStats.total)}
              description="Total from paid services"
            />
            <StatCard
              title="No-Show Rate"
              value={`${data.noShowStats.rate}%`}
              description={`${data.noShowStats.count} of ${data.noShowStats.total} appointments`}
            />
          </div>

          <div className="analytics-charts-grid">
            <BookingTrendsChart data={data.bookingTrends} granularity={granularity} />
            <StatusBreakdownChart data={data.appointmentStats} />
          </div>

          <div className="analytics-charts-grid">
            <ServicesPieChart data={data.popularServices} />
            <HostUtilizationTable data={data.hostUtilization} />
          </div>
        </div>
      )}
    </div>
  );
}

export { StatCard } from './StatCard';
export { BookingTrendsChart } from './BookingTrendsChart';
export { ServicesPieChart } from './ServicesPieChart';
export { StatusBreakdownChart } from './StatusBreakdownChart';
export { HostUtilizationTable } from './HostUtilizationTable';
