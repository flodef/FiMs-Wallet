'use client';

import { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Page, useNavigation } from '../hooks/useNavigation';
import { User, UserContext } from '../hooks/useUser';
import { useLocalStorage } from '../utils/localStorage';
import { clearData } from '../utils/processData';

export interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const { setPage } = useNavigation();

  const connecting = useRef(false);
  const [user, setUser] = useLocalStorage<User | undefined>('user', undefined);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const isValidUser = !!user?.id && !!user?.name && !!user?.address;
    if (!isValidUser) setUser(undefined);

    setPage(isValidUser ? Page.Portfolio : Page.Dashboard);
    setIsConnected(isValidUser);
    connecting.current = false;
  }, [user, setPage, setUser]);

  const disconnect = useCallback(() => {
    setUser(undefined);
    clearData();
  }, [setUser]);

  const connect = useCallback(
    async (userName: string) => {
      if (!userName || userName.toLowerCase() === user?.name.toLowerCase() || connecting.current) return user;

      connecting.current = true;

      return await fetch('/api/database/getUsers')
        .then(async result => {
          if (!result.ok) throw new Error('Error while fetching users');

          return result.json().then((users: User[]) => {
            const newUser = users.find(u => u.name.toLowerCase() === userName.toLowerCase());
            if (newUser) {
              setUser(newUser);
            } else {
              console.error('No user found');
              disconnect();
            }
            return newUser;
          });
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
