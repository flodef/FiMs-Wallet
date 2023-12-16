import './globals.css';

import Nav from './nav';
import Toast from './toast';
import { Suspense } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
  title: 'FiMs Wallet',
  description: 'Porte-monnaie FiMs sur Solana.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full bg-gray-50">
      <body className="h-full">
        <Suspense>
          <Nav />
        </Suspense>
        {children}
        <SpeedInsights />
        <Toast />
      </body>
    </html>
  );
}
