'use client';

import { FC, ReactNode, useEffect, useState } from 'react';
import { NavigationContext, Page } from '../hooks/useNavigation';

const pages = Object.keys(Page).map((page) => Page[page as keyof typeof Page]);

export interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: FC<NavigationProviderProps> = ({ children }) => {
  const [page, setPage] = useState<Page>();
  const [needRefresh, setNeedRefresh] = useState(false);
  useEffect(() => {
    setNeedRefresh(false);
    const timeOut = setTimeout(() => {
      setNeedRefresh(true);
    }, 60000);

    return () => {
      clearTimeout(timeOut);
    };
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        page,
        setPage,
        pages,
        needRefresh,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};
