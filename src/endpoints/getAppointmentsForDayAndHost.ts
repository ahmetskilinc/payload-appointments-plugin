import type { PayloadHandler, PayloadRequest } from 'payload';

import moment from 'moment';

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

const curateSlots = (
  slotInterval: number,
  startTime: string,
  endTime: string,
  bookingWindow: BookingWindowConfig,
): string[] => {
  const slots: string[] = [];
  const current = moment(startTime);
  const end = moment(endTime);
  const now = moment();
  const earliestBookable = bookingWindow.earliestBookableTime
    ? moment(bookingWindow.earliestBookableTime)
    : now;

  while (current.isBefore(end)) {
    if (current.isAfter(earliestBookable)) {
      slots.push(current.format('YYYY-MM-DDTHH:mm:ss.SSSZ'));
    }
    current.add(slotInterval, 'minutes');
  }

  return slots;
};

const filterSlotsForHost = async (
  req: PayloadRequest,
  day: string,
  availableSlots: string[],
  slotDuration: number,
  hostId?: string,
  maxAppointmentsPerDay?: number,
): Promise<string[]> => {
  const startOfDay = moment(day).startOf('day');
  const endOfDay = moment(day).endOf('day');

  const whereClause: any = {
    and: [
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
    ],
  };

  if (hostId) {
    whereClause.and.push({
      host: {
        equals: hostId,
      },
    });
  }

  const existingAppointments = await req.payload.find({
    collection: 'appointments',
    depth: 0,
    limit: 100,
    where: whereClause,
  });

  if (maxAppointmentsPerDay && maxAppointmentsPerDay > 0) {
    const appointmentCount = existingAppointments.docs.filter(
      (a) => a.appointmentType === 'appointment',
    ).length;
    if (appointmentCount >= maxAppointmentsPerDay) {
      return [];
    }
  }

  return availableSlots.filter((slot) => {
    const slotStart = moment(slot);
    const slotEnd = slotStart.clone().add(slotDuration, 'minutes');

    const hasOverlap = existingAppointments.docs.some((appointment) => {
      const appointmentStart = moment(appointment.start);
      const appointmentEnd = moment(appointment.end);

      return slotStart.isBefore(appointmentEnd) && slotEnd.isAfter(appointmentStart);
    });

    return !hasOverlap;
  });
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

    const servicesArray = services.split(',');
    const servicesData = await req.payload.find({
      collection: 'services',
      depth: 0,
      where: {
        id: {
          in: servicesArray,
        },
      },
    });

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

    const requestedDay = moment(day).startOf('day');
    if (latestBookableDate && requestedDay.isAfter(moment(latestBookableDate))) {
      return Response.json({
        availableSlots: [],
        bookingWindow,
        filteredSlots: [],
        message: `Cannot book more than ${effectiveMaxAdvance} days in advance`,
      });
    }

    const dayOfWeek = moment(day).format('dddd').toLowerCase() as DayOfWeek;

    let opening: string | null = null;
    let closing: string | null = null;
    let isOpen = false;
    let maxAppointmentsPerDay: number | undefined;

    if (hostId) {
      const teamMember = (await req.payload.findByID({
        id: hostId,
        collection: 'teamMembers',
        depth: 0,
      })) as unknown as TeamMember;

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
      const openingTimes = await req.payload.findGlobal({
        slug: 'openingTimes',
        depth: 0,
      });

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
        filteredSlots: [],
      });
    }

    const openingMoment = moment(opening);
    const closingMoment = moment(closing);

    const startTime = moment(day).set({
      hour: openingMoment.hour(),
      millisecond: 0,
      minute: openingMoment.minute(),
      second: 0,
    });
    const endTime = moment(day).set({
      hour: closingMoment.hour(),
      millisecond: 0,
      minute: closingMoment.minute(),
      second: 0,
    });

    const availableSlots = curateSlots(
      totalDuration,
      startTime.toISOString(),
      endTime.toISOString(),
      bookingWindow,
    );
    const filteredSlots = await filterSlotsForHost(
      req,
      day,
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
