import { getAuthToken } from '../app/(frontend)/actions/auth'

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getAuthToken()

  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    throw new Error('Unauthorized')
  }

  return response
}

export async function fetchPublic(url: string, options: RequestInit = {}) {
  const response = await fetch(url, options)
  return response
}
