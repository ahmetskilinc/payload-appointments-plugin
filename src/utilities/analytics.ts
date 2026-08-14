import type { Payload } from 'payload';

import moment from 'moment';

import { getSlugs } from '../slugs';
import { findAll } from './findAll';
import { getServicePrice } from './servicePrice';

export type DateRange = {
  startDate: string;
  endDate: string;
};

export type AppointmentStats = {
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
  pending: number;
  confirmed: number;
};

export type RevenueStats = {
  total: number;
  /** `count` is the number of booked service line-items for that service. */
  byService: { serviceId: string; serviceName: string; revenue: number; count: number }[];
  /** `count` is the number of appointments for that host. */
  byHost: { hostId: string; hostName: string; revenue: number; count: number }[];
};

export type PopularService = {
  serviceId: string;
  serviceName: string;
  count: number;
  revenue: number;
};

export type HostUtilization = {
  hostId: string;
  hostName: string;
  appointmentsCount: number;
  hoursBooked: number;
  completedCount: number;
  cancelledCount: number;
};

export type NoShowStats = {
  rate: number;
  count: number;
  total: number;
};

export type BookingTrend = {
  date: string;
  count: number;
  revenue: number;
};

export type AnalyticsData = {
  appointmentStats: AppointmentStats;
  revenueStats: RevenueStats;
  popularServices: PopularService[];
  hostUtilization: HostUtilization[];
  noShowStats: NoShowStats;
  bookingTrends: BookingTrend[];
};

type AppointmentDoc = {
  end: string;
  host?: unknown;
  services?: unknown;
  start: string;
  status?: string | null;
};

/** Statuses that represent real (or expected) income. */
const REVENUE_STATUSES = new Set(['completed', 'confirmed']);

const getHostInfo = (host: unknown): { id: string; name: string } | null => {
  if (!host || typeof host !== 'object') {
    return null;
  }
  const h = host as {
    firstName?: string;
    id: number | string;
    lastName?: string;
    preferredNameAppointments?: string;
  };
  return {
    id: String(h.id),
    name:
      h.preferredNameAppointments ||
      `${h.firstName || ''} ${h.lastName || ''}`.trim() ||
      'Unknown Host',
  };
};

const getServiceInfo = (
  service: unknown,
): { id: string; name: string; price: number } | null => {
  if (!service || typeof service !== 'object') {
    return null;
  }
  const s = service as {
    duration?: number;
    id: number | string;
    paidService?: boolean;
    price?: number;
    pricingType?: string;
    title?: string;
  };
  return {
    id: String(s.id),
    name: s.title || 'Unknown Service',
    price: getServicePrice(s),
  };
};

const appointmentServices = (appointment: AppointmentDoc) =>
  Array.isArray(appointment.services) ? appointment.services : [];

/**
 * One paginated fetch of every appointment starting in the range (all
 * statuses); every computation below derives from this dataset.
 */
export async function fetchAppointmentsInRange(
  payload: Payload,
  dateRange: DateRange,
): Promise<AppointmentDoc[]> {
  return findAll<AppointmentDoc>({
    collection: getSlugs(payload.config).appointments,
    depth: 1,
    payload,
    select: {
      end: true,
      host: true,
      services: true,
      start: true,
      status: true,
    },
    where: {
      and: [
        { appointmentType: { equals: 'appointment' } },
        { start: { greater_than_equal: dateRange.startDate } },
        { start: { less_than_equal: dateRange.endDate } },
      ],
    },
  });
}

export function computeAppointmentStats(appointments: AppointmentDoc[]): AppointmentStats {
  const stats: AppointmentStats = {
    total: appointments.length,
    completed: 0,
    cancelled: 0,
    noShow: 0,
    pending: 0,
    confirmed: 0,
  };

  for (const appointment of appointments) {
    switch (appointment.status) {
      case 'completed':
        stats.completed += 1;
        break;
      case 'cancelled':
        stats.cancelled += 1;
        break;
      case 'no-show':
        stats.noShow += 1;
        break;
      case 'pending':
        stats.pending += 1;
        break;
      case 'confirmed':
        stats.confirmed += 1;
        break;
    }
  }

  return stats;
}

export function computeRevenueStats(appointments: AppointmentDoc[]): RevenueStats {
  const serviceMap = new Map<string, { name: string; revenue: number; count: number }>();
  const hostMap = new Map<string, { name: string; revenue: number; count: number }>();
  let totalRevenue = 0;

  for (const appointment of appointments) {
    if (!REVENUE_STATUSES.has(appointment.status || '')) {
      continue;
    }

    let appointmentRevenue = 0;

    for (const rawService of appointmentServices(appointment)) {
      const service = getServiceInfo(rawService);
      if (!service) {
        continue;
      }

      appointmentRevenue += service.price;

      const existing = serviceMap.get(service.id) || {
        name: service.name,
        revenue: 0,
        count: 0,
      };
      existing.revenue += service.price;
      existing.count += 1;
      serviceMap.set(service.id, existing);
    }

    totalRevenue += appointmentRevenue;

    const host = getHostInfo(appointment.host);
    if (host) {
      const existing = hostMap.get(host.id) || { name: host.name, revenue: 0, count: 0 };
      existing.revenue += appointmentRevenue;
      existing.count += 1;
      hostMap.set(host.id, existing);
    }
  }

  return {
    total: totalRevenue,
    byService: Array.from(serviceMap.entries()).map(([serviceId, data]) => ({
      serviceId,
      serviceName: data.name,
      revenue: data.revenue,
      count: data.count,
    })),
    byHost: Array.from(hostMap.entries()).map(([hostId, data]) => ({
      hostId,
      hostName: data.name,
      revenue: data.revenue,
      count: data.count,
    })),
  };
}

export function computePopularServices(
  appointments: AppointmentDoc[],
  limit = 5,
): PopularService[] {
  const serviceMap = new Map<string, { name: string; count: number; revenue: number }>();

  for (const appointment of appointments) {
    if (appointment.status === 'cancelled') {
      continue;
    }

    const countsRevenue = REVENUE_STATUSES.has(appointment.status || '');

    for (const rawService of appointmentServices(appointment)) {
      const service = getServiceInfo(rawService);
      if (!service) {
        continue;
      }

      const existing = serviceMap.get(service.id) || {
        name: service.name,
        count: 0,
        revenue: 0,
      };
      existing.count += 1;
      if (countsRevenue) {
        existing.revenue += service.price;
      }
      serviceMap.set(service.id, existing);
    }
  }

  return Array.from(serviceMap.entries())
    .map(([serviceId, data]) => ({
      serviceId,
      serviceName: data.name,
      count: data.count,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function computeHostUtilization(appointments: AppointmentDoc[]): HostUtilization[] {
  const hostMap = new Map<
    string,
    {
      name: string;
      appointmentsCount: number;
      hoursBooked: number;
      completedCount: number;
      cancelledCount: number;
    }
  >();

  for (const appointment of appointments) {
    const host = getHostInfo(appointment.host);
    if (!host) {
      continue;
    }

    const start = moment(appointment.start);
    const end = moment(appointment.end);
    const duration = moment.duration(end.diff(start)).asHours();
    const status = appointment.status;

    const existing = hostMap.get(host.id) || {
      name: host.name,
      appointmentsCount: 0,
      hoursBooked: 0,
      completedCount: 0,
      cancelledCount: 0,
    };

    existing.appointmentsCount += 1;
    if (status !== 'cancelled') {
      existing.hoursBooked += duration;
    }
    if (status === 'completed') {
      existing.completedCount += 1;
    }
    if (status === 'cancelled') {
      existing.cancelledCount += 1;
    }

    hostMap.set(host.id, existing);
  }

  return Array.from(hostMap.entries())
    .map(([hostId, data]) => ({
      hostId,
      hostName: data.name,
      appointmentsCount: data.appointmentsCount,
      hoursBooked: Math.round(data.hoursBooked * 100) / 100,
      completedCount: data.completedCount,
      cancelledCount: data.cancelledCount,
    }))
    .sort((a, b) => b.appointmentsCount - a.appointmentsCount);
}

/** Rate over appointments that actually reached their date (excludes cancelled/pending). */
export function computeNoShowRate(appointments: AppointmentDoc[]): NoShowStats {
  const relevant = appointments.filter(
    (a) => a.status !== 'cancelled' && a.status !== 'pending',
  );
  const noShows = relevant.filter((a) => a.status === 'no-show');

  const rate = relevant.length > 0 ? (noShows.length / relevant.length) * 100 : 0;

  return {
    rate: Math.round(rate * 100) / 100,
    count: noShows.length,
    total: relevant.length,
  };
}

export function computeBookingTrends(
  appointments: AppointmentDoc[],
  dateRange: DateRange,
  granularity: 'day' | 'week' | 'month' = 'day',
): BookingTrend[] {
  const formatKey = (date: moment.Moment): string => {
    switch (granularity) {
      case 'week':
        return date.clone().startOf('week').format('YYYY-MM-DD');
      case 'month':
        return date.clone().startOf('month').format('YYYY-MM');
      default:
        return date.format('YYYY-MM-DD');
    }
  };

  const trendMap = new Map<string, { count: number; revenue: number }>();

  for (const appointment of appointments) {
    if (appointment.status === 'cancelled') {
      continue;
    }

    const key = formatKey(moment(appointment.start));

    let revenue = 0;
    if (REVENUE_STATUSES.has(appointment.status || '')) {
      for (const rawService of appointmentServices(appointment)) {
        const service = getServiceInfo(rawService);
        if (service) {
          revenue += service.price;
        }
      }
    }

    const existing = trendMap.get(key) || { count: 0, revenue: 0 };
    existing.count += 1;
    existing.revenue += revenue;
    trendMap.set(key, existing);
  }

  // Fill in empty buckets across the range so charts render continuous axes.
  const end = moment(dateRange.endDate);
  const results = new Map<string, BookingTrend>();
  const current = moment(dateRange.startDate);

  while (current.isSameOrBefore(end)) {
    const key = formatKey(current);
    if (!results.has(key)) {
      const data = trendMap.get(key) || { count: 0, revenue: 0 };
      results.set(key, { date: key, count: data.count, revenue: data.revenue });
    }

    switch (granularity) {
      case 'week':
        current.add(1, 'week');
        break;
      case 'month':
        current.add(1, 'month');
        break;
      default:
        current.add(1, 'day');
    }
  }

  // The final partial bucket can be skipped by the increment above.
  const endKey = formatKey(end);
  if (!results.has(endKey)) {
    const data = trendMap.get(endKey) || { count: 0, revenue: 0 };
    results.set(endKey, { date: endKey, count: data.count, revenue: data.revenue });
  }

  return Array.from(results.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export async function getAllAnalytics(
  payload: Payload,
  dateRange: DateRange,
  granularity: 'day' | 'week' | 'month' = 'day',
): Promise<AnalyticsData> {
  const appointments = await fetchAppointmentsInRange(payload, dateRange);

  return {
    appointmentStats: computeAppointmentStats(appointments),
    revenueStats: computeRevenueStats(appointments),
    popularServices: computePopularServices(appointments, 5),
    hostUtilization: computeHostUtilization(appointments),
    noShowStats: computeNoShowRate(appointments),
    bookingTrends: computeBookingTrends(appointments, dateRange, granularity),
  };
}
