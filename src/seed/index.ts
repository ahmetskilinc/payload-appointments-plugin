import type { Payload } from 'payload'

import { getSlugs } from '../slugs'
import { openingTimesSeed, servicesSeed, teamMembersSeed } from './data'

export const seedAppointmentsData = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding appointments plugin data...')

  const slugs = getSlugs(payload.config)

  try {
    await payload.updateGlobal({
      slug: slugs.openingTimes,
      data: openingTimesSeed,
    })
    payload.logger.info('Seeded opening times')

    const existingServices = await payload.find({
      collection: slugs.services,
      limit: 1,
    })

    if (existingServices.totalDocs === 0) {
      for (const service of servicesSeed) {
        await payload.create({
          collection: slugs.services,
          data: service,
        })
      }
      payload.logger.info(`Seeded ${servicesSeed.length} services`)
    } else {
      payload.logger.info('Services already exist, skipping...')
    }

    const existingTeamMembers = await payload.find({
      collection: slugs.teamMembers,
      limit: 1,
    })

    if (existingTeamMembers.totalDocs === 0) {
      for (const teamMember of teamMembersSeed) {
        await payload.create({
          collection: slugs.teamMembers,
          data: teamMember,
        })
      }
      payload.logger.info(`Seeded ${teamMembersSeed.length} team members`)
    } else {
      payload.logger.info('Team members already exist, skipping...')
    }

    payload.logger.info('Appointments plugin data seeding complete!')
  } catch (error) {
    payload.logger.error(`Error seeding appointments data: ${error}`)
  }
}
