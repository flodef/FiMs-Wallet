import { createContext, useContext } from 'react';

export interface User {
  name: string;
  address: string;
}

export interface UserContextState {
  user: User | undefined;
  connect: (user: User) => void;
  disconnect: () => void;
}

export const UserContext = createContext<UserContextState>({} as UserContextState);

export function useUser(): UserContextState {
  return useContext(UserContext);
}
