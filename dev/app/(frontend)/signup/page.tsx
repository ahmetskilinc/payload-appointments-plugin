import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import SignupPageClient from './page.client'

export default async function SignupPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('payload-token')

  if (session) {
    redirect('/')
  }

  return <SignupPageClient />
}
