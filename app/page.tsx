'use client';

import { useEffect } from 'react';
import { Page, useNavigation } from './hooks/useNavigation';
import { usePopup } from './hooks/usePopup';
import { useUser } from './hooks/useUser';
import { LoadingDot } from './loading';
import Dashboard from './pages/dashboard';
import Portfolio from './pages/portfolio';
import Transactions from './pages/transactions';
import Users from './pages/users';
import { useIsWindowReady } from './hooks/useWindowParam';
import { isMobileDevice } from './utils/mobile';

export default function IndexPage({ searchParams }: { searchParams: { user: string; q: string } }) {
  const { isPopupOpen } = usePopup();
  const { connect, disconnect } = useUser();
  const { page } = useNavigation();

  const isWindowReady = useIsWindowReady();

  useEffect(() => {
    let user: string | undefined;
    if (isWindowReady) {
      if (isMobileDevice()) {
        const urlSearchParams = new URLSearchParams(window.location.search);
        user = urlSearchParams.get('user') ?? '';
      } else {
        user = searchParams.user;
      }
    }

    alert('user: ' + user);

    if (user !== undefined) {
      if (user) {
        connect(user);
      } else {
        disconnect();
      }
    }
  }, [isWindowReady]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className={'space-y-6 p-4 md:p-10 mx-auto max-w-7xl ' + (isPopupOpen ? 'blur-sm' : '')}>
      {page === Page.Dashboard ? (
        <Dashboard />
      ) : page === Page.Portfolio ? (
        <Portfolio />
      ) : page === Page.Transactions ? (
        <Transactions />
      ) : page === Page.Users ? (
        <Users searchParams={searchParams} />
      ) : (
        LoadingDot()
      )}
    </main>
  );
}
