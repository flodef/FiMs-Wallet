'use client';

import { ReactNode, useEffect, useState } from 'react';
import { NavigationContext, Page } from '../hooks/useNavigation';

const pages = Object.keys(Page).map(page => Page[page as keyof typeof Page]);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [page, setPage] = useState<Page>();
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    if (page) setNeedRefresh(true);
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
