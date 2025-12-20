import React from 'react';

type Props = {};

export default function Page({}: Props) {
  return (
    <div>
      <div>Test Page</div>
      <div>NEXT_PUBLIC_VERCEL_ENV: {process.env.NEXT_PUBLIC_VERCEL_ENV}</div>
      <div>
        NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL:{' '}
        {process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}
      </div>
      <div>NEXT_PUBLIC_VERCEL_BRANCH_URL: {process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL}</div>
      <div>NEXT_PUBLIC_APP_URL: {process.env.NEXT_PUBLIC_APP_URL}</div>
      <div>PAYLOAD_PUBLIC_SERVER_URL: {process.env.PAYLOAD_PUBLIC_SERVER_URL}</div>
    </div>
  );
}
