import type { Payload } from 'payload';

import moment from 'moment';

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
  byService: { serviceId: string; serviceName: string; revenue: number; count: number }[];
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

export async function getAppointmentStats(
  payload: Payload,
  dateRange: DateRange,
): Promise<AppointmentStats> {
  const { startDate, endDate } = dateRange;

  const appointments = await payload.find({
    collection: 'appointments',
    depth: 0,
    limit: 0,
    where: {
      and: [
        { appointmentType: { equals: 'appointment' } },
        { start: { greater_than_equal: startDate } },
        { start: { less_than_equal: endDate } },
      ],
    },
  });

  const stats: AppointmentStats = {
    total: appointments.totalDocs,
    completed: 0,
    cancelled: 0,
    noShow: 0,
    pending: 0,
    confirmed: 0,
  };

  const statusCounts = await Promise.all([
    payload.count({
      collection: 'appointments',
      where: {
        and: [
          { appointmentType: { equals: 'appointment' } },
          { start: { greater_than_equal: startDate } },
          { start: { less_than_equal: endDate } },
          { status: { equals: 'completed' } },
        ],
      },
    }),
    payload.count({
      collection: 'appointments',
      where: {
        and: [
          { appointmentType: { equals: 'appointment' } },
          { start: { greater_than_equal: startDate } },
          { start: { less_than_equal: endDate } },
          { status: { equals: 'cancelled' } },
        ],
      },
    }),
    payload.count({
      collection: 'appointments',
      where: {
        and: [
          { appointmentType: { equals: 'appointment' } },
          { start: { greater_than_equal: startDate } },
          { start: { less_than_equal: endDate } },
          { status: { equals: 'no-show' } },
        ],
      },
    }),
    payload.count({
      collection: 'appointments',
      where: {
        and: [
          { appointmentType: { equals: 'appointment' } },
          { start: { greater_than_equal: startDate } },
          { start: { less_than_equal: endDate } },
          { status: { equals: 'pending' } },
        ],
      },
    }),
    payload.count({
      collection: 'appointments',
      where: {
        and: [
          { appointmentType: { equals: 'appointment' } },
          { start: { greater_than_equal: startDate } },
          { start: { less_than_equal: endDate } },
          { status: { equals: 'confirmed' } },
        ],
      },
    }),
  ]);

  stats.completed = statusCounts[0].totalDocs;
  stats.cancelled = statusCounts[1].totalDocs;
  stats.noShow = statusCounts[2].totalDocs;
  stats.pending = statusCounts[3].totalDocs;
  stats.confirmed = statusCounts[4].totalDocs;

  return stats;
}

export async function getRevenueStats(
  payload: Payload,
  dateRange: DateRange,
): Promise<RevenueStats> {
  const { startDate, endDate } = dateRange;

  const appointments = await payload.find({
    collection: 'appointments',
    depth: 2,
    limit: 1000,
    where: {
      and: [
        { appointmentType: { equals: 'appointment' } },
        { start: { greater_than_equal: startDate } },
        { start: { less_than_equal: endDate } },
        { status: { not_in: ['cancelled'] } },
      ],
    },
  });

  const serviceMap = new Map<string, { name: string; revenue: number; count: number }>();
  const hostMap = new Map<string, { name: string; revenue: number; count: number }>();
  let totalRevenue = 0;

  for (const appointment of appointments.docs) {
    const services = appointment.services as any[];
    const host = appointment.host as any;

    let appointmentRevenue = 0;

    if (services && Array.isArray(services)) {
      for (const service of services) {
        if (service && typeof service === 'object') {
          const serviceId = service.id;
          const serviceName = service.title || 'Unknown Service';
          const price = service.paidService ? service.price || 0 : 0;

          appointmentRevenue += price;

          const existing = serviceMap.get(serviceId) || { name: serviceName, revenue: 0, count: 0 };
          existing.revenue += price;
          existing.count += 1;
          serviceMap.set(serviceId, existing);
        }
      }
    }

    totalRevenue += appointmentRevenue;

    if (host && typeof host === 'object') {
      const hostId = host.id;
      const hostName =
        host.preferredNameAppointments ||
        `${host.firstName || ''} ${host.lastName || ''}`.trim() ||
        'Unknown Host';

      const existing = hostMap.get(hostId) || { name: hostName, revenue: 0, count: 0 };
      existing.revenue += appointmentRevenue;
      existing.count += 1;
      hostMap.set(hostId, existing);
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

export async function getPopularServices(
  payload: Payload,
  dateRange: DateRange,
  limit = 5,
): Promise<PopularService[]> {
  const { startDate, endDate } = dateRange;

  const appointments = await payload.find({
    collection: 'appointments',
    depth: 2,
    limit: 1000,
    where: {
      and: [
        { appointmentType: { equals: 'appointment' } },
        { start: { greater_than_equal: startDate } },
        { start: { less_than_equal: endDate } },
        { status: { not_in: ['cancelled'] } },
      ],
    },
  });

  const serviceMap = new Map<string, { name: string; count: number; revenue: number }>();

  for (const appointment of appointments.docs) {
    const services = appointment.services as any[];

    if (services && Array.isArray(services)) {
      for (const service of services) {
        if (service && typeof service === 'object') {
          const serviceId = service.id;
          const serviceName = service.title || 'Unknown Service';
          const price = service.paidService ? service.price || 0 : 0;

          const existing = serviceMap.get(serviceId) || { name: serviceName, count: 0, revenue: 0 };
          existing.count += 1;
          existing.revenue += price;
          serviceMap.set(serviceId, existing);
        }
      }
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

export async function getHostUtilization(
  payload: Payload,
  dateRange: DateRange,
): Promise<HostUtilization[]> {
  const { startDate, endDate } = dateRange;

  const appointments = await payload.find({
    collection: 'appointments',
    depth: 1,
    limit: 1000,
    where: {
      and: [
        { appointmentType: { equals: 'appointment' } },
        { start: { greater_than_equal: startDate } },
        { start: { less_than_equal: endDate } },
      ],
    },
  });

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

  for (const appointment of appointments.docs) {
    const host = appointment.host as any;
    const start = moment(appointment.start);
    const end = moment(appointment.end);
    const duration = moment.duration(end.diff(start)).asHours();
    const status = appointment.status;

    if (host && typeof host === 'object') {
      const hostId = host.id;
      const hostName =
        host.preferredNameAppointments ||
        `${host.firstName || ''} ${host.lastName || ''}`.trim() ||
        'Unknown Host';

      const existing = hostMap.get(hostId) || {
        name: hostName,
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

      hostMap.set(hostId, existing);
    }
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

export async function getNoShowRate(payload: Payload, dateRange: DateRange): Promise<NoShowStats> {
  const { startDate, endDate } = dateRange;

  const [total, noShows] = await Promise.all([
    payload.count({
      collection: 'appointments',
      where: {
        and: [
          { appointmentType: { equals: 'appointment' } },
          { start: { greater_than_equal: startDate } },
          { start: { less_than_equal: endDate } },
          { status: { not_in: ['cancelled', 'pending'] } },
        ],
      },
    }),
    payload.count({
      collection: 'appointments',
      where: {
        and: [
          { appointmentType: { equals: 'appointment' } },
          { start: { greater_than_equal: startDate } },
          { start: { less_than_equal: endDate } },
          { status: { equals: 'no-show' } },
        ],
      },
    }),
  ]);

  const rate = total.totalDocs > 0 ? (noShows.totalDocs / total.totalDocs) * 100 : 0;

  return {
    rate: Math.round(rate * 100) / 100,
    count: noShows.totalDocs,
    total: total.totalDocs,
  };
}

export async function getBookingTrends(
  payload: Payload,
  dateRange: DateRange,
  granularity: 'day' | 'week' | 'month' = 'day',
): Promise<BookingTrend[]> {
  const { startDate, endDate } = dateRange;

  const appointments = await payload.find({
    collection: 'appointments',
    depth: 2,
    limit: 1000,
    where: {
      and: [
        { appointmentType: { equals: 'appointment' } },
        { start: { greater_than_equal: startDate } },
        { start: { less_than_equal: endDate } },
        { status: { not_in: ['cancelled'] } },
      ],
    },
  });

  const trendMap = new Map<string, { count: number; revenue: number }>();

  const formatKey = (date: moment.Moment): string => {
    switch (granularity) {
      case 'week':
        return date.startOf('week').format('YYYY-MM-DD');
      case 'month':
        return date.startOf('month').format('YYYY-MM');
      default:
        return date.format('YYYY-MM-DD');
    }
  };

  for (const appointment of appointments.docs) {
    const date = moment(appointment.start);
    const key = formatKey(date);

    const services = appointment.services as any[];
    let revenue = 0;

    if (services && Array.isArray(services)) {
      for (const service of services) {
        if (service && typeof service === 'object' && service.paidService) {
          revenue += service.price || 0;
        }
      }
    }

    const existing = trendMap.get(key) || { count: 0, revenue: 0 };
    existing.count += 1;
    existing.revenue += revenue;
    trendMap.set(key, existing);
  }

  const start = moment(startDate);
  const end = moment(endDate);
  const results: BookingTrend[] = [];
  const current = start.clone();

  while (current.isSameOrBefore(end)) {
    const key = formatKey(current.clone());
    const data = trendMap.get(key) || { count: 0, revenue: 0 };

    if (!results.find((r) => r.date === key)) {
      results.push({
        date: key,
        count: data.count,
        revenue: data.revenue,
      });
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

  return results.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getAllAnalytics(
  payload: Payload,
  dateRange: DateRange,
  granularity: 'day' | 'week' | 'month' = 'day',
): Promise<AnalyticsData> {
  const [
    appointmentStats,
    revenueStats,
    popularServices,
    hostUtilization,
    noShowStats,
    bookingTrends,
  ] = await Promise.all([
    getAppointmentStats(payload, dateRange),
    getRevenueStats(payload, dateRange),
    getPopularServices(payload, dateRange, 5),
    getHostUtilization(payload, dateRange),
    getNoShowRate(payload, dateRange),
    getBookingTrends(payload, dateRange, granularity),
  ]);

  return {
    appointmentStats,
    revenueStats,
    popularServices,
    hostUtilization,
    noShowStats,
    bookingTrends,
  };
}
