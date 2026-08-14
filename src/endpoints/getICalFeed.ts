import type { PayloadHandler, PayloadRequest } from 'payload';

import moment from 'moment';

import type { Appointment } from '../types';

import { getSlugs } from '../slugs';
import { generateICalFeed } from '../utilities/ical';

export const getICalFeed: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const { token, months } = req.query;

    if (!token || typeof token !== 'string') {
      return Response.json({ error: 'Authentication token required' }, { status: 401 });
    }

    const slugs = getSlugs(req.payload.config);

    const feedToken = await req.payload.find({
      collection: slugs.teamMembers,
      depth: 0,
      limit: 1,
      where: {
        icalToken: { equals: token },
      },
    });

    if (feedToken.totalDocs === 0) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    // The token determines whose calendar is served — never trust a host param.
    const tokenHost = feedToken.docs[0];
    const effectiveHostId = String(tokenHost.id);

    const parsedMonths = months && typeof months === 'string' ? parseInt(months, 10) : 3;
    const monthsAhead =
      Number.isFinite(parsedMonths) && parsedMonths > 0 ? Math.min(parsedMonths, 24) : 3;
    const startDate = moment().subtract(1, 'month').startOf('day').toISOString();
    const endDate = moment().add(monthsAhead, 'months').endOf('day').toISOString();

    const appointments = await req.payload.find({
      collection: slugs.appointments,
      depth: 2,
      limit: 500,
      sort: 'start',
      where: {
        and: [
          { appointmentType: { equals: 'appointment' } },
          { start: { greater_than_equal: startDate } },
          { start: { less_than_equal: endDate } },
          { status: { not_in: ['cancelled'] } },
          { host: { equals: effectiveHostId } },
        ],
      },
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
