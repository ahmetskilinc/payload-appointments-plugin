import type { PayloadHandler, PayloadRequest, Where } from 'payload';

import moment from 'moment-timezone';

import { getSlugs } from '../slugs';
import { findAll } from '../utilities/findAll';
import {
  curateSlots,
  dayOfWeekInTimezone,
  filterOverlappingSlots,
  resolveTimeOnDay,
} from '../utilities/slots';

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

type TeamMemberCustomHours = {
  [key in DayOfWeek]?: {
    end?: string | null;
    isWorking?: boolean;
    start?: string | null;
  };
};

type TeamMember = {
  customHours?: TeamMemberCustomHours;
  maxAppointmentsPerDay?: number;
  useCustomHours?: boolean;
};

type BookingWindowConfig = {
  minLeadTime: number;
  maxAdvanceBooking: number;
  earliestBookableTime: string | null;
  latestBookableDate: string | null;
};

type StoredAppointment = {
  appointmentType?: string;
  end: string;
  start: string;
};

const filterSlotsForHost = async (
  req: PayloadRequest,
  day: string,
  timezone: string,
  availableSlots: string[],
  slotDuration: number,
  hostId?: string,
  maxAppointmentsPerDay?: number,
): Promise<string[]> => {
  const startOfDay = moment.tz(day, timezone).startOf('day');
  const endOfDay = moment.tz(day, timezone).endOf('day');

  const conditions: Where[] = [
    {
      start: {
        greater_than_equal: startOfDay.toISOString(),
        less_than_equal: endOfDay.toISOString(),
      },
    },
    {
      status: {
        not_equals: 'cancelled',
      },
    },
  ];

  if (hostId) {
    conditions.push({
      host: {
        equals: hostId,
      },
    });
  }

  const existingAppointments = await findAll<StoredAppointment>({
    collection: getSlugs(req.payload.config).appointments,
    payload: req.payload,
    where: { and: conditions },
  });

  if (maxAppointmentsPerDay && maxAppointmentsPerDay > 0) {
    const appointmentCount = existingAppointments.filter(
      (a) => a.appointmentType === 'appointment',
    ).length;
    if (appointmentCount >= maxAppointmentsPerDay) {
      return [];
    }
  }

  return filterOverlappingSlots(availableSlots, slotDuration, existingAppointments);
};

export const getAppointmentsForDayAndHost: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const { day, host, services } = req.query;

    if (!services || !day || typeof services !== 'string' || typeof day !== 'string') {
      return Response.json(
        { error: 'Missing or invalid services or day parameter' },
        { status: 400 },
      );
    }

    const hostId = typeof host === 'string' ? host : undefined;
    const slugs = getSlugs(req.payload.config);

    const servicesArray = [...new Set(services.split(','))];
    const servicesData = await req.payload.find({
      collection: slugs.services,
      depth: 0,
      limit: servicesArray.length,
      where: {
        id: {
          in: servicesArray,
        },
      },
    });

    if (servicesData.docs.length === 0) {
      return Response.json({ error: 'No matching services found' }, { status: 400 });
    }

    const totalDuration = servicesData.docs.reduce(
      (total, service) => total + (service.duration || 0),
      0,
    );

    const maxBufferTime = servicesData.docs.reduce(
      (max, service) => Math.max(max, service.bufferTime || 0),
      0,
    );

    const slotDuration = totalDuration + maxBufferTime;

    const maxMinLeadTime = servicesData.docs.reduce(
      (max, service) => Math.max(max, service.minLeadTime || 0),
      0,
    );

    const nonZeroMaxAdvance = servicesData.docs
      .map((s) => s.maxAdvanceBooking || 0)
      .filter((v) => v > 0);
    const effectiveMaxAdvance = nonZeroMaxAdvance.length > 0 ? Math.min(...nonZeroMaxAdvance) : 0;

    const now = moment();
    const earliestBookableTime =
      maxMinLeadTime > 0 ? now.clone().add(maxMinLeadTime, 'hours').toISOString() : null;
    const latestBookableDate =
      effectiveMaxAdvance > 0
        ? now.clone().add(effectiveMaxAdvance, 'days').endOf('day').toISOString()
        : null;

    const bookingWindow: BookingWindowConfig = {
      minLeadTime: maxMinLeadTime,
      maxAdvanceBooking: effectiveMaxAdvance,
      earliestBookableTime,
      latestBookableDate,
    };

    // All wall-clock math happens in the business timezone.
    const openingTimes = await req.payload.findGlobal({
      slug: slugs.openingTimes,
      depth: 0,
    });
    const timezone = (openingTimes?.timezone as string) || 'UTC';

    const requestedDay = moment.tz(day, timezone).startOf('day');
    if (latestBookableDate && requestedDay.isAfter(moment(latestBookableDate))) {
      return Response.json({
        availableSlots: [],
        bookingWindow,
        filteredSlots: [],
        message: `Cannot book more than ${effectiveMaxAdvance} days in advance`,
      });
    }

    // Holidays close the whole day regardless of weekday/custom hours.
    const holidays = (openingTimes?.holidays ?? []) as { date: string; name?: string | null }[];
    const requestedDate = requestedDay.format('YYYY-MM-DD');
    const holiday = holidays.find(
      (h) => h.date && moment.tz(h.date, timezone).format('YYYY-MM-DD') === requestedDate,
    );
    if (holiday) {
      return Response.json({
        availableSlots: [],
        bookingWindow,
        filteredSlots: [],
        holiday: holiday.name || true,
        message: holiday.name ? `Closed for ${holiday.name}` : 'Closed for holiday',
      });
    }

    const dayOfWeek = dayOfWeekInTimezone(day, timezone) as DayOfWeek;

    // Wall-clock open ranges for the day: a host's custom hours (one range) or
    // the business-wide intervals (possibly several, e.g. around lunch).
    let openRanges: { closing: string; opening: string }[] = [];
    let maxAppointmentsPerDay: number | undefined;

    if (hostId) {
      const teamMember = (await req.payload.findByID({
        id: hostId,
        collection: slugs.teamMembers,
        depth: 0,
        disableErrors: true,
      })) as unknown as TeamMember | null;

      if (teamMember?.useCustomHours && teamMember?.customHours) {
        const memberDayConfig = teamMember.customHours[dayOfWeek];
        if (memberDayConfig?.isWorking && memberDayConfig?.start && memberDayConfig?.end) {
          openRanges = [{ closing: memberDayConfig.end, opening: memberDayConfig.start }];
        }
      }

      maxAppointmentsPerDay = teamMember?.maxAppointmentsPerDay;
    }

    if (openRanges.length === 0) {
      if (!openingTimes || !openingTimes[dayOfWeek]) {
        return Response.json(
          { error: 'Opening times not configured for this day' },
          { status: 400 },
        );
      }

      const dayConfig = openingTimes[dayOfWeek] as {
        intervals?: { closing?: string | null; opening?: string | null }[] | null;
        isOpen: boolean;
      };

      if (!dayConfig.isOpen) {
        return Response.json({
          availableSlots: [],
          bookingWindow,
          filteredSlots: [],
        });
      }

      openRanges = (dayConfig.intervals ?? []).flatMap((interval) =>
        interval?.opening && interval?.closing
          ? [{ closing: interval.closing, opening: interval.opening }]
          : [],
      );
    }

    if (openRanges.length === 0) {
      return Response.json({
        availableSlots: [],
        bookingWindow,
        filteredSlots: [],
      });
    }

    const availableSlots = openRanges
      .flatMap((range) =>
        curateSlots(
          slotDuration,
          resolveTimeOnDay(day, range.opening, timezone),
          resolveTimeOnDay(day, range.closing, timezone),
          { earliestBookableTime },
        ),
      )
      .sort();
    const filteredSlots = await filterSlotsForHost(
      req,
      day,
      timezone,
      availableSlots,
      slotDuration,
      hostId,
      maxAppointmentsPerDay,
    );

    return Response.json({
      availableSlots,
      bookingWindow,
      bufferTime: maxBufferTime,
      filteredSlots,
      slotDuration,
    });
  } catch (error) {
    req.payload.logger.error(`Error getting appointments: ${error}`);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
