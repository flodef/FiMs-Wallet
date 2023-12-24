'use client';

import { FC, ReactNode, startTransition, useCallback, useState } from 'react';
import { User, UserContext } from '../hooks/useUser';
import { usePathname, useRouter } from 'next/navigation';

export interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const { replace } = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | undefined>();

  const connect = useCallback(
    async (userName: string) => {
      if (userName === '') return;

      return await fetch(`./api/database?user=${userName}`)
        .then(async (result) => {
          return await result.json().then((data: User[]) => {
            console.log(data);
            if (data.length === 1) {
              setUser(data[0]);

              const params = new URLSearchParams(window.location.search);
              params.set('user', userName);
              replace(`${pathname}?${params.toString()}`);

              return data[0];
            } else {
              console.log('No user found');
              return undefined;
            }
          });
        })
        .catch((error) => {
          console.log(error);
          return undefined;
        });
    },
    [pathname, replace]
  );

  const disconnect = useCallback(() => {
    setUser(undefined);

    const params = new URLSearchParams(window.location.search);
    params.delete('user');
    replace(`${pathname}?${params.toString()}`);
  }, [pathname, replace]);

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
