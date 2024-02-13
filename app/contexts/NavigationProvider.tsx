'use client';

import { ReactNode, use, useEffect, useState } from 'react';
import { NavigationContext, Page } from '../hooks/useNavigation';

const pages = Object.keys(Page).map(page => Page[page as keyof typeof Page]);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [page, setPage] = useState<Page>();
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    if (page) setNeedRefresh(true); // Refresh when the page changes

    const interval = setInterval(() => {
      setNeedRefresh(true);
    }, 60000); // Refresh every minute

    return () => {
      clearInterval(interval);
    };
  }, [page]);

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
