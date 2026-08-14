import type { PayloadHandler, PayloadRequest, Where } from 'payload';

import moment from 'moment-timezone';

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
    collection: 'appointments',
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

    const servicesArray = [...new Set(services.split(','))];
    const servicesData = await req.payload.find({
      collection: 'services',
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
      slug: 'openingTimes',
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

    const dayOfWeek = dayOfWeekInTimezone(day, timezone) as DayOfWeek;

    let opening: string | null = null;
    let closing: string | null = null;
    let isOpen = false;
    let maxAppointmentsPerDay: number | undefined;

    if (hostId) {
      const teamMember = (await req.payload.findByID({
        id: hostId,
        collection: 'teamMembers',
        depth: 0,
        disableErrors: true,
      })) as unknown as TeamMember | null;

      if (teamMember?.useCustomHours && teamMember?.customHours) {
        const memberDayConfig = teamMember.customHours[dayOfWeek];
        if (memberDayConfig?.isWorking && memberDayConfig?.start && memberDayConfig?.end) {
          opening = memberDayConfig.start;
          closing = memberDayConfig.end;
          isOpen = true;
        }
      }

      maxAppointmentsPerDay = teamMember?.maxAppointmentsPerDay;
    }

    if (!opening || !closing) {
      if (!openingTimes || !openingTimes[dayOfWeek]) {
        return Response.json(
          { error: 'Opening times not configured for this day' },
          { status: 400 },
        );
      }

      const dayConfig = openingTimes[dayOfWeek] as {
        closing: string | null;
        isOpen: boolean;
        opening: string | null;
      };

      if (!dayConfig.isOpen || !dayConfig.opening || !dayConfig.closing) {
        return Response.json({
          availableSlots: [],
          bookingWindow,
          filteredSlots: [],
        });
      }

      opening = dayConfig.opening;
      closing = dayConfig.closing;
      isOpen = dayConfig.isOpen;
    }

    if (!isOpen || !opening || !closing) {
      return Response.json({
        availableSlots: [],
        bookingWindow,
        filteredSlots: [],
      });
    }

    const openingInstant = resolveTimeOnDay(day, opening, timezone);
    const closingInstant = resolveTimeOnDay(day, closing, timezone);

    const availableSlots = curateSlots(slotDuration, openingInstant, closingInstant, {
      earliestBookableTime,
    });
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
