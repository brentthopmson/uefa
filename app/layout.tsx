import './globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import RootLayoutWrapper from './RootLayout';
import { Inter } from 'next/font/google';

import { UserProvider } from './UserContext';

config.autoAddCss = false;
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'UEFA Mobile Tickets - Official Match Tickets',
  description: 'Manage, transfer and use your official UEFA match tickets for Euro 2024, Champions League and more.',
  keywords: 'uefa, tickets, euro 2024, champions league, mobile tickets',
  viewport: 'width=device-width, initial-scale=1, format-detection=telephone=no',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
  openGraph: {
    url: 'https://www.uefa.com/tickets',
    title: 'UEFA Mobile Tickets',
    description: 'The easiest way to manage your official UEFA tickets.',
    siteName: 'uefa.com',
    images: [
      {
        url: '/logo.png',
      },
    ],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://ws.vggcdn.net/" />
        <link rel="dns-prefetch" href="https://ws.vggcdn.net/" />
        <link rel="preconnect" href="https://img.vggcdn.net/" />
        <link rel="dns-prefetch" href="https://img.vggcdn.net/" />
        <link rel="preconnect" href="https://img.uefa.com" />
        <link rel="dns-prefetch" href="https://img.uefa.com" />
        <link rel="preconnect" href="https://media.stubhubstatic.com" />
        <link rel="dns-prefetch" href="https://media.stubhubstatic.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter:400,500,600,700&display=swap" />
      </head>
      <body className={inter.className}>
        <UserProvider>
          <RootLayoutWrapper inter={inter}>
            {children}
          </RootLayoutWrapper>
        </UserProvider>
      </body>
    </html>
  );
}