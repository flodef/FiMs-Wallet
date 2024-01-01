'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FC, ReactNode, useCallback, useRef, useState } from 'react';
import { Page, useNavigation } from '../hooks/useNavigation';
import { User, UserContext } from '../hooks/useUser';

export interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const { setPage } = useNavigation();
  const { replace } = useRouter();
  const pathname = usePathname();

  const connecting = useRef(false);
  const [user, setUser] = useState<User | undefined>();

  const disconnect = useCallback(() => {
    setUser(undefined);
    setPage(Page.Dashboard);
    connecting.current = false;

    const params = new URLSearchParams(window.location.search);
    params.delete('user');
    replace(`${pathname}?${params.toString()}`);
  }, [pathname, replace, setPage]);

  const connect = useCallback(
    async (userName: string) => {
      if (!userName || userName.toLowerCase() === user?.name.toLowerCase() || connecting.current) return user;

      connecting.current = true;

      return await fetch(`./api/database/getUsers?user=${userName}`)
        .then(async (result) => {
          return await result.json().then((data: User[]) => {
            if (data.length === 1) {
              connecting.current = false;
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
    [pathname, replace, setPage, disconnect, user]
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
