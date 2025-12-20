import type { PayloadHandler, PayloadRequest } from 'payload';

import moment from 'moment';

import { getAllAnalytics } from '../utilities/analytics';

export const getAnalytics: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const { startDate, endDate, granularity } = req.query;

    const effectiveStartDate =
      typeof startDate === 'string'
        ? startDate
        : moment().subtract(30, 'days').startOf('day').toISOString();

    const effectiveEndDate =
      typeof endDate === 'string' ? endDate : moment().endOf('day').toISOString();

    const effectiveGranularity =
      granularity === 'week' || granularity === 'month' ? granularity : 'day';

    const analytics = await getAllAnalytics(
      req.payload,
      { startDate: effectiveStartDate, endDate: effectiveEndDate },
      effectiveGranularity,
    );

    return Response.json({
      data: analytics,
      dateRange: {
        startDate: effectiveStartDate,
        endDate: effectiveEndDate,
      },
      granularity: effectiveGranularity,
    });
  } catch (error) {
    req.payload.logger.error(`Error getting analytics: ${error}`);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
