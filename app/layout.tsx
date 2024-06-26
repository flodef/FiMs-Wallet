import './globals.css';

import { SpeedInsights } from '@vercel/speed-insights/next';
import { ReactNode } from 'react';
import Navbar from './components/navBar';
import Toast from './components/toast';
import { NavigationProvider } from './contexts/navigationProvider';
import { PopupProvider } from './contexts/popupProvider';
import { PrivacyProvider } from './contexts/privacyProvider';
import { UserProvider } from './contexts/userProvider';

export const metadata = {
  title: 'FiMs Wallet',
  description: 'Porte-monnaie FiMs sur Solana.',
};

export default function RootLayout({ children }: { children: Readonly<ReactNode> }) {
  return (
    <html lang="fr">
      <body className="flex flex-col h-screen bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle">
        <NavigationProvider>
          <UserProvider>
            <PopupProvider>
              <PrivacyProvider>
                <Navbar />
                {children}
                <SpeedInsights />
                <Toast />
              </PrivacyProvider>
            </PopupProvider>
          </UserProvider>
        </NavigationProvider>
      </body>
    </html>
  );
}
