import { createContext, useContext } from 'react';

export enum Page {
  Portfolio = 'Portfolio',
  Transactions = 'Transactions',
  Users = 'Users',
  Dashboard = 'Dashboard', // Should stay at the end
}

export const pages = Object.values(Page);

export interface NavigationContextState {
  page: Page | undefined;
  setPage: (page: Page) => void;
  needRefresh: boolean;
  setNeedRefresh: (needRefresh: boolean) => void;
}

export const NavigationContext = createContext<NavigationContextState>({} as NavigationContextState);

export function useNavigation(): NavigationContextState {
  return useContext(NavigationContext);
}
