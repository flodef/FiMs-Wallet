import './globals.css';

import { SpeedInsights } from '@vercel/speed-insights/next';
import { Suspense } from 'react';
import Navbar from './components/navbar';
import Popup from './components/popup';
import Toast from './components/toast';
import { NavigationProvider } from './contexts/NavigationProvider';
import { PopupProvider } from './contexts/PopupProvider';
import { UserProvider } from './contexts/UserProvider';

export const metadata = {
  title: 'FiMs Wallet',
  description: 'Porte-monnaie FiMs sur Solana.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full bg-gray-50">
      <body className="h-full">
        <NavigationProvider>
          <UserProvider>
            <PopupProvider>
              <Suspense>
                <Navbar />
              </Suspense>
              {children}
              <SpeedInsights />
              <Toast />
              <Popup />
            </PopupProvider>
          </UserProvider>
        </NavigationProvider>
      </body>
    </html>
  );
}
