'use client';

import { FC, ReactNode, useEffect, useState } from 'react';
import { NavigationContext, Page } from '../hooks/useNavigation';

const pages = Object.keys(Page).map(page => Page[page as keyof typeof Page]);

export interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: FC<NavigationProviderProps> = ({ children }) => {
  const [page, setPage] = useState<Page>();
  const [needRefresh, setNeedRefresh] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setNeedRefresh(true);
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        page,
        setPage,
        pages,
        needRefresh,
        setNeedRefresh,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};
