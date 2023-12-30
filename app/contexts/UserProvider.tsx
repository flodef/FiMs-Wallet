'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FC, ReactNode, useCallback, useState } from 'react';
import { Page, useNavigation } from '../hooks/useNavigation';
import { User, UserContext } from '../hooks/useUser';

export interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const { setPage } = useNavigation();
  const { replace } = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | undefined>();

  const disconnect = useCallback(() => {
    setUser(undefined);
    setPage(Page.Dashboard);

    const params = new URLSearchParams(window.location.search);
    params.delete('user');
    replace(`${pathname}?${params.toString()}`);
  }, [pathname, replace, setPage]);

  const connect = useCallback(
    async (userName: string) => {
      if (userName === '') {
        disconnect();
        return;
      }

      return await fetch(`./api/database?user=${userName}`)
        .then(async (result) => {
          return await result.json().then((data: User[]) => {
            console.log(data);
            if (data.length === 1) {
              setUser(data[0]);
              setPage(Page.Portfolio);

              const params = new URLSearchParams(window.location.search);
              params.set('user', userName);
              replace(`${pathname}?${params.toString()}`);

              return data[0];
            } else {
              console.error('No user found');
              disconnect();
              return undefined;
            }
          });
        })
        .catch((error) => {
          console.error(error);
          disconnect();
          return undefined;
        });
    },
    [pathname, replace, setPage, disconnect]
  );

  return (
    <UserContext.Provider
      value={{
        user,
        connect,
        disconnect,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
