import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import LoginPageClient from './page.client'

export default async function LoginPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('payload-token')

  if (session) {
    redirect('/dashboard')
  }

  return <LoginPageClient />
}
