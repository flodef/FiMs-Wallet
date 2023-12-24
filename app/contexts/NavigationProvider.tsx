'use client';

import { FC, ReactNode, useState } from 'react';
import { NavigationContext, Page } from '../hooks/useNavigation';

export interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: FC<NavigationProviderProps> = ({ children }) => {
  const [page, setPage] = useState<Page>();

  return (
    <NavigationContext.Provider
      value={{
        page,
        setPage,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};
