import './globals.css';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ReactNode } from 'react';
import Navbar from './components/navBar';
import Popup from './components/popup';
import Toast from './components/toast';
import { DataProvider } from './contexts/dataProvider';
import { NavigationProvider } from './contexts/navigationProvider';
import { PrivacyProvider } from './contexts/privacyProvider';
import { UserProvider } from './contexts/userProvider';
import { PopupProvider } from './hooks/usePopup';

export const metadata = {
  title: 'FiMs Wallet',
  description: 'Porte-monnaie FiMs sur Solana.',
};

export default function RootLayout({ children }: { children: Readonly<ReactNode> }) {
  return (
    <html lang="fr">
      <body className="flex flex-col h-screen bg-theme-background-subtle dark:bg-dark-theme-background-subtle overflow-hidden">
        <NavigationProvider>
          <DataProvider>
            <UserProvider>
              <PopupProvider>
                <PrivacyProvider>
                  <Navbar />
                  <AntdRegistry>{children}</AntdRegistry>
                  <SpeedInsights />
                  <Toast />
                  <Popup />
                </PrivacyProvider>
              </PopupProvider>
            </UserProvider>
          </DataProvider>
        </NavigationProvider>
      </body>
    </html>
  );
}
