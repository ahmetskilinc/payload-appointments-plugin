import type { User } from 'payload-types'

import { fetchWithAuth } from './api'

const SERVER_URL = process.env.SERVER_URL

export async function getDashboardData() {
  try {
    const response = await fetchWithAuth(`${SERVER_URL}/api/users/me?depth=10`)
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data')
    }

    const data: { user: User } = await response.json()

    return data.user
  } catch (error) {
    console.error(error)
    return null
  }
}
