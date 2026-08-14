import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { getDashboardData } from '../../../lib/dashboardData'
import SignupPageClient from './page.client'

export default async function SignupPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('payload-token')

  // Only bounce away when the token actually resolves to a user — a stale
  // cookie should still let the visitor sign up.
  const user = session ? await getDashboardData() : null
  if (user) {
    redirect('/')
  }

  return <SignupPageClient />
}
