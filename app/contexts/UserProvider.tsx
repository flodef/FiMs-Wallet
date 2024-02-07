'use client';

import { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Page, useNavigation } from '../hooks/useNavigation';
import { User, UserContext } from '../hooks/useUser';
import { useLocalStorage } from '../utils/localStorage';
import { DataName, loadData } from '../utils/processData';

export interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const { setPage } = useNavigation();

  const connecting = useRef(false);
  const [user, setUser] = useLocalStorage<User | undefined>('user', undefined);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setPage(user ? Page.Portfolio : Page.Dashboard);
    setIsConnected(!!user);
  }, [user, setPage]);

  const disconnect = useCallback(() => {
    setUser(undefined);
    connecting.current = false;
  }, [setUser]);

  const connect = useCallback(
    async (userName: string) => {
      if (!userName || userName.toLowerCase() === user?.name.toLowerCase() || connecting.current) return user;

      connecting.current = true;

      return await loadData(DataName.portfolio)
        .then((users: User[]) => {
          const newUser = users.filter(u => u.name.toLowerCase() === userName.toLowerCase());
          if (newUser.length === 1) {
            connecting.current = false;
            setUser(newUser[0]);
            return newUser[0];
          } else {
            console.error('No user found');
            disconnect();
            return undefined;
          }
        })
        .catch(error => {
          console.error(error);
          disconnect();
          return undefined;
        });
    },
    [disconnect, user, setUser],
  );

  return (
    <UserContext.Provider
      value={{
        user,
        connect,
        disconnect,
        isConnected,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
