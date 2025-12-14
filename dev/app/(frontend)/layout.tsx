import { NuqsAdapter } from 'nuqs/adapters/next/app';

import Header from '../../components/Header/index';
import './globals.css';

export const metadata = {
  description: 'Book appointments effortlessly with our modern scheduling platform',
  title: 'Bookly - Appointment Scheduling',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <NuqsAdapter>
          <Header />
          <main className="relative">{children}</main>
        </NuqsAdapter>
      </body>
    </html>
  );
}
