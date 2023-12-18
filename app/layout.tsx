import './globals.css';

import { SpeedInsights } from '@vercel/speed-insights/next';
import { Suspense } from 'react';
import Nav from './components/nav';
import Toast from './components/toast';
import { PopupProvider } from './contexts/PopupProvider';
import { Popup } from './components/popup';

export const metadata = {
  title: 'FiMs Wallet',
  description: 'Porte-monnaie FiMs sur Solana.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full bg-gray-50">
      <body className="h-full">
        <PopupProvider>
          <Suspense>
            <Nav />
          </Suspense>
          {children}
          <SpeedInsights />
          <Toast />
          <Popup />
        </PopupProvider>
      </body>
    </html>
  );
}
