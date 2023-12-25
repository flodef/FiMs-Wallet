import { createContext, useContext } from 'react';

export enum Page {
  Portfolio = 'Portfolio',
  Transactions = 'Transactions',
  Users = 'Utilisateurs',
  Dashboard = 'Dashboard', // Should stay at the end
}

export interface NavigationContextState {
  page: Page | undefined;
  setPage: (page: Page) => void;
}

export const NavigationContext = createContext<NavigationContextState>({} as NavigationContextState);

export function useNavigation(): NavigationContextState {
  return useContext(NavigationContext);
}
