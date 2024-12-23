'use client';

import { ReactNode, useEffect, useState } from 'react';
import { NavigationContext, Page } from '../hooks/useNavigation';

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
        needRefresh,
        setNeedRefresh,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};
