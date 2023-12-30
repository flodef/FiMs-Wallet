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

export default function IndexPage() {
  const { isPopupOpen } = usePopup();
  const { connect } = useUser();
  const { page } = useNavigation();
  const isWindowReady = useIsWindowReady();

  useEffect(() => {
    if (!isWindowReady) return;

    const params = new URLSearchParams(window.location.search);
    connect(params.get('user') ?? '');
  }, [isWindowReady, connect]);

  return (
    <main className={'space-y-6 p-4 md:p-10 mx-auto max-w-7xl ' + (isPopupOpen ? 'blur-sm' : '')}>
      {page === Page.Dashboard ? (
        <Dashboard />
      ) : page === Page.Portfolio ? (
        <Portfolio />
      ) : page === Page.Transactions ? (
        <Transactions />
      ) : (
        Loading()
      )}
    </main>
  );
}
