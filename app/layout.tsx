import './globals.css';

import { SpeedInsights } from '@vercel/speed-insights/next';
import Navbar from './components/navbar';
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
    <html lang="fr">
      <body className="flex flex-col h-screen bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle">
        <NavigationProvider>
          <UserProvider>
            <PopupProvider>
              <Navbar />
              {children}
              <SpeedInsights />
              <Toast />
            </PopupProvider>
          </UserProvider>
        </NavigationProvider>
      </body>
    </html>
  );
}
