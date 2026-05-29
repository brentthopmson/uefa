import './globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import RootLayoutWrapper from './RootLayout';
import { Inter } from 'next/font/google';

import { UserProvider } from './UserContext';
import ManifestLoader from './ManifestLoader';
import RegisterSW from './RegisterSW';

config.autoAddCss = false;
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'UEFA Mobile Tickets - Official Match Tickets',
  description: 'Manage, transfer and use your official UEFA match tickets for Euro 2024, Champions League and more.',
  keywords: 'uefa, tickets, euro 2024, champions league, mobile tickets',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, format-detection=telephone=no',
  icons: {
    icon: [
      { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgFJEeQooGVRcuv7w9UddBTFqiXMIBDVUVrQ&s' },
    ],
    shortcut: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgFJEeQooGVRcuv7w9UddBTFqiXMIBDVUVrQ&s',
    apple: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgFJEeQooGVRcuv7w9UddBTFqiXMIBDVUVrQ&s',
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
        <meta name="theme-color" content="#001C4B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="UEFA Tickets" />
        <link rel="apple-touch-startup-image" href="/splash-1170x2532.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash-1290x2796.png" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash-1179x2556.png" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash-1080x2340.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash-750x1334.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash-2048x2732.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash-1668x2388.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="preconnect" href="https://ws.vggcdn.net/" />
        <link rel="dns-prefetch" href="https://ws.vggcdn.net/" />
        <link rel="preconnect" href="https://img.vggcdn.net/" />
        <link rel="dns-prefetch" href="https://img.vggcdn.net/" />
        <link rel="preconnect" href="https://img.uefa.com" />
        <link rel="dns-prefetch" href="https://img.uefa.com" />
        <link rel="preconnect" href="https://media.stubhubstatic.com" />
        <link rel="dns-prefetch" href="https://media.stubhubstatic.com" />
      </head>
      <style>{`
        body {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
        }
        header.fixed {
          padding-top: env(safe-area-inset-top);
        }
        nav.fixed {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
      <body className={inter.className}>
        <UserProvider>
          <RootLayoutWrapper inter={inter}>
            {children}
          </RootLayoutWrapper>
        </UserProvider>
        <ManifestLoader />
        <RegisterSW />
      </body>
    </html>
  );
}