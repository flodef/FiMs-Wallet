'use client';

import { useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Page, useNavigation } from './hooks/useNavigation';
import { usePopup } from './hooks/usePopup';
import { useUser } from './hooks/useUser';
import { useIsWindowReady } from './hooks/useWindowParam';
import { LoadingDot } from './loading';
import Dashboard from './pages/dashboard';
import Portfolio from './pages/portfolio';
import Transactions from './pages/transactions';
import Users from './pages/users';
import { cls } from './utils/constants';

export default function IndexPage() {
  const { isPopupOpen } = usePopup();
  const { connect, disconnect, user } = useUser();
  const { page, setPage, pages } = useNavigation();

  const isWindowReady = useIsWindowReady();

  useEffect(() => {
    if (!isWindowReady) return;

    const urlSearchParams = new URLSearchParams(window.location.search);
    const user = urlSearchParams.get('user');

    if (user) {
      connect(user);
    } else {
      disconnect();
    }
  }, [isWindowReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentIndex = pages.indexOf(page ?? Page.Dashboard);
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!user) return;

      setPage(pages[currentIndex < pages.length - 1 ? currentIndex + 1 : 0]);
    },
    onSwipedRight: () => {
      if (!user) return;

      setPage(pages[currentIndex > 0 ? currentIndex - 1 : pages.length - 1]);
    },
  });

  return (
    <main className={cls('space-y-6 p-4 md:p-10 mx-auto max-w-7xl', isPopupOpen ? 'blur-sm' : '')} {...handlers}>
      {page === Page.Dashboard ? (
        <Dashboard />
      ) : page === Page.Portfolio ? (
        <Portfolio />
      ) : page === Page.Transactions ? (
        <Transactions />
      ) : page === Page.Users ? (
        <Users />
      ) : (
        <LoadingDot />
      )}
    </main>
  );
}
