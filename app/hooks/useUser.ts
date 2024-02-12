import { createContext, useContext } from 'react';

export interface User {
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
