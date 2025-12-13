import type { FieldHook } from 'payload'

import moment from 'moment'

export const setEndDateTime: FieldHook = async ({ req, siblingData }) => {
  if (siblingData.appointmentType !== 'appointment') {
    return siblingData.end
  }

  if (!siblingData.services?.length) {
    return moment(siblingData.start).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
  }

  try {
    const services = await req.payload.find({
      collection: 'services',
      depth: 0,
      limit: siblingData.services.length,
      where: {
        id: {
          in: siblingData.services,
        },
      },
    })

    const totalDuration = services.docs.reduce(
      (total, service) => total + (service.duration || 0),
      0,
    )
    return moment(siblingData.start)
      .add(totalDuration, 'minutes')
      .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
  } catch (error) {
    req.payload.logger.error(`Error calculating end time: ${error}`)
    return moment(siblingData.start).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
  }
}
