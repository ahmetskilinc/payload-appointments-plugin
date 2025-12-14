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
    <div className="py-12 px-6">
      <div className="max-w-4xl mx-auto mb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Book an Appointment</h1>
        <p className="text-gray-500">Choose your services and pick a time that works for you</p>
      </div>
      <BookNow isAuthenticated={isAuthenticated} services={services} teamMembers={teamMembers} />
    </div>
  )
}

export default Page
