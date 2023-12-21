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
    (user: User) => {
      setUser(user);

      const params = new URLSearchParams(window.location.search);
      params.set('user', user?.name);

      // startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
      // });
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
