import configPromise from '@payload-config'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'

import BookNow from '../../../components/Book'

const Page = async () => {
  const cookieStore = await cookies()
  const session = cookieStore.get('payload-token')
  const isAuthenticated = !!session?.value

  const payload = await getPayload({ config: configPromise })
  const teamMembers = (
    await payload.find({
      collection: 'teamMembers',
      overrideAccess: false,
      where: {
        takingAppointments: {
          equals: true,
        },
      },
    })
  ).docs

  const services = (
    await payload.find({
      collection: 'services',
      overrideAccess: false,
    })
  ).docs

  return (
    <div className="py-20 px-6">
      <BookNow isAuthenticated={isAuthenticated} services={services} teamMembers={teamMembers} />
    </div>
  )
}

export default Page
