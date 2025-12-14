'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import configPromise from '@payload-config';
import { getPayload } from 'payload';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  let shouldRedirect = false;

  try {
    const payload = await getPayload({ config: configPromise });

    const result = await payload.login({
      collection: 'users',
      data: { email, password },
    });

    // if (result.user.roles === 'admin') {
    //   return { error: 'Login failed' };
    // }

    (await cookies()).set('payload-token', result.token!, {
      httpOnly: true,
      maxAge: result.exp!,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });

    shouldRedirect = true;
  } catch (error) {
    return { error: (error as Error).message };
  }

  if (shouldRedirect) {
    redirect('/');
  }
}

export async function logout() {
  (await cookies()).delete('payload-token');
  redirect('/login');
}

export async function getAuthToken() {
  return (await cookies()).get('payload-token')?.value;
}

export async function isAuthenticated() {
  const token = (await cookies()).get('payload-token');
  return !!token?.value;
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;

  let shouldRedirect = false;

  try {
    const payload = await getPayload({ config: configPromise });

    await payload.create({
      collection: 'users',
      data: {
        email,
        firstName,
        lastName,
        password,
        roles: 'customer',
      },
    });

    const result = await payload.login({
      collection: 'users',
      data: { email, password },
    });

    (await cookies()).set('payload-token', result.token!, {
      httpOnly: true,
      maxAge: result.exp!,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });

    shouldRedirect = true;
  } catch (error) {
    return { error: (error as Error).message };
  }

  if (shouldRedirect) {
    redirect('/');
  }
}
