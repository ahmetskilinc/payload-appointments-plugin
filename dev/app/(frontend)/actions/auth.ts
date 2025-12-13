'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// This function would call your auth server
async function loginToAuthServer(email: string, password: string) {
  // Replace this with actual call to your auth server
  const response = await fetch(`${process.env.SERVER_URL}/api/users/login`, {
    body: JSON.stringify({ email, password }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Login failed')
  }

  const data = await response.json()

  if (data.user.roles === 'admin') {
    throw new Error('Login failed')
  }

  return data
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const { exp, token } = await loginToAuthServer(email, password)

    // Store the token in an HTTP-only cookie
    ;(await cookies()).set('payload-token', token, {
      httpOnly: true,
      maxAge: exp,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    })

    redirect('/dashboard')
  } catch (error) {
    return { error: (error as Error).message }
  }
}

export async function logout() {
  ;(await cookies()).delete('payload-token')
  redirect('/login')
}

export async function getAuthToken() {
  return (await cookies()).get('payload-token')?.value
}
