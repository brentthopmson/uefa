import './globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import RootLayoutWrapper from './RootLayout';
import { Inter } from 'next/font/google';

import { UserProvider } from './UserContext';
import ManifestLoader from './ManifestLoader';
import RegisterSW from './RegisterSW';
import PwaInstallPrompt from './PwaInstallPrompt';
import HideSplash from './HideSplash';

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
        <link rel="apple-touch-startup-image" href="/splash-1024x1024.png" />
        <link rel="preconnect" href="https://ws.vggcdn.net/" />
        <link rel="dns-prefetch" href="https://ws.vggcdn.net/" />
        <link rel="preconnect" href="https://img.vggcdn.net/" />
        <link rel="dns-prefetch" href="https://img.vggcdn.net/" />
        <link rel="preconnect" href="https://img.uefa.com" />
        <link rel="dns-prefetch" href="https://img.uefa.com" />
        <link rel="preconnect" href="https://media.stubhubstatic.com" />
        <link rel="dns-prefetch" href="https://media.stubhubstatic.com" />
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
          #splash-screen {
            position: fixed; inset: 0; z-index: 99999;
            display: flex; align-items: center; justify-content: center;
            background: #001C4B;
            opacity: 1; transition: opacity 0.4s ease;
            pointer-events: none;
          }
          #splash-screen.hidden { opacity: 0; }
          #splash-screen img {
            width: 80px; height: 80px; border-radius: 50%;
          }
        `}</style>
      </head>
      <body className={inter.className}>
        <div id="splash-screen" suppressHydrationWarning>
          <img src="/logo.png" alt="" />
        </div>
        <HideSplash />
        <UserProvider>
          <PwaInstallPrompt />
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