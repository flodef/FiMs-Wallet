'use client';

import { useEffect } from 'react';
import { Page, useNavigation } from './hooks/useNavigation';
import { usePopup } from './hooks/usePopup';
import { useUser } from './hooks/useUser';
import { useIsWindowReady } from './hooks/useWindowParam';
import Loading from './loading';
import Dashboard from './pages/dashboard';
import Portfolio from './pages/portfolio';
import Transactions from './pages/transactions';
import Users from './pages/users';

export default function IndexPage({ searchParams }: { searchParams: { user: string; q: string } }) {
  const { isPopupOpen } = usePopup();
  const { connect } = useUser();
  const { page } = useNavigation();
  const isWindowReady = useIsWindowReady();

  useEffect(() => {
    if (!isWindowReady) return;

    connect(searchParams.user ?? '');
  }, [isWindowReady, connect, searchParams.user]);

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
        Loading()
      )}
    </main>
  );
}
