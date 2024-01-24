import { useEffect, useMemo } from 'react';
import { useSwiper } from 'swiper/react';
import { Page, useNavigation } from './hooks/useNavigation';
import { useUser } from './hooks/useUser';
import { LoadingDot } from './loading';
import Dashboard from './pages/dashboard';
import Portfolio from './pages/portfolio';
import Transactions from './pages/transactions';
import Users from './pages/users';

export default function MainPage({ page }: { page: Page }) {
  const { pages, page: currentPage } = useNavigation();
  const { user } = useUser();

  const swiper = useSwiper();

  useEffect(() => {
    if (!swiper || swiper.destroyed) return;

    const i = pages.findIndex((p) => p === currentPage);
    if (i === swiper.activeIndex) return;

    swiper.slideTo(i);
  }, [currentPage, pages, swiper]);

  return !user || page === Page.Dashboard ? (
    <Dashboard />
  ) : page === Page.Portfolio ? (
    <Portfolio />
  ) : page === Page.Transactions ? (
    <Transactions />
  ) : page === Page.Users ? (
    <Users />
  ) : (
    <LoadingDot />
  );
}
