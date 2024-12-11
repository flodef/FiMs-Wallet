import { createContext, useContext } from 'react';

export interface User {
  [key: string]: string | number | number[] | boolean;
  id: number;
  name: string;
  address: string;
}

export interface UserContextState {
  user: User | undefined;
  connect: (userName: string) => Promise<User | undefined>;
  disconnect: () => void;
  isConnected: boolean;
}

export const UserContext = createContext<UserContextState>({} as UserContextState);

export function useUser(): UserContextState {
  return useContext(UserContext);
}
