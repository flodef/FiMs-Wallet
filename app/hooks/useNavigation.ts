import { createContext, useContext } from 'react';

export enum Page {
  Portfolio = 'Portfolio',
  Transactions = 'Transactions',
  Dashboard = 'Dashboard',
}

export interface NavigationContextState {
  page: Page | undefined;
  setPage: (page: Page) => void;
}

export const NavigationContext = createContext<NavigationContextState>({} as NavigationContextState);

export function useNavigation(): NavigationContextState {
  return useContext(NavigationContext);
}
