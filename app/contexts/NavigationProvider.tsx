'use client';

import { FC, ReactNode, useState } from 'react';
import { NavigationContext, Page } from '../hooks/useNavigation';

const pages = Object.keys(Page).map((page) => Page[page as keyof typeof Page]);

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
        pages,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};
