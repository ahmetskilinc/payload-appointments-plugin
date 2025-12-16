import type { PayloadHandler, PayloadRequest } from 'payload';

import moment from 'moment';

import type { Appointment } from '../types';

import { generateICalFeed } from '../utilities/ical';

export const getICalFeed: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const { host, token, months } = req.query;

    if (!token || typeof token !== 'string') {
      return Response.json({ error: 'Authentication token required' }, { status: 401 });
    }

    const feedToken = await req.payload.find({
      collection: 'teamMembers',
      depth: 0,
      limit: 1,
      where: {
        icalToken: { equals: token },
      },
    });

    if (feedToken.totalDocs === 0) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const tokenHost = feedToken.docs[0];
    const effectiveHostId = host && typeof host === 'string' ? host : String(tokenHost.id);

    const monthsAhead = months && typeof months === 'string' ? parseInt(months, 10) : 3;
    const startDate = moment().subtract(1, 'month').startOf('day').toISOString();
    const endDate = moment().add(monthsAhead, 'months').endOf('day').toISOString();

    const whereClause: any = {
      and: [
        { appointmentType: { equals: 'appointment' } },
        { start: { greater_than_equal: startDate } },
        { start: { less_than_equal: endDate } },
        { status: { not_in: ['cancelled'] } },
      ],
    };

    if (effectiveHostId) {
      whereClause.and.push({ host: { equals: effectiveHostId } });
    }

    const appointments = await req.payload.find({
      collection: 'appointments',
      depth: 2,
      limit: 500,
      where: whereClause,
    });

    const baseUrl =
      req.headers.get('origin') || req.headers.get('host') || 'https://appointments.example.com';

    const hostName =
      tokenHost.preferredNameAppointments ||
      `${tokenHost.firstName || ''} ${tokenHost.lastName || ''}`.trim() ||
      'Appointments';

    const calendarName = `${hostName}'s Schedule`;

    const icalContent = generateICalFeed(
      appointments.docs as unknown as Appointment[],
      calendarName,
      baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`,
    );

    return new Response(icalContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="appointments.ics"',
      },
    });
  } catch (error) {
    req.payload.logger.error(`iCal feed error: ${error}`);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
