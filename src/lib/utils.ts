import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getPublicServerUrl = (serverURL?: null | string) => {
  // Prefer the Payload config's serverURL so links work on any host —
  // the Vercel env vars are only a fallback for Vercel deployments.
  if (serverURL) {
    return serverURL;
  }
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;
  } else if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL}`;
  } else {
    return `http://localhost:3000`;
  }
};
