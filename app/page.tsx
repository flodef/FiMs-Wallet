'use client';

import { useEffect } from 'react';
import { EffectCreative, EffectCube, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Page, useNavigation } from './hooks/useNavigation';
import { usePopup } from './hooks/usePopup';
import { useUser } from './hooks/useUser';
import { useIsWindowReady } from './hooks/useWindowParam';
import { LoadingDot } from './loading';
import MainPage from './main';
import { cls } from './utils/constants';
import { isMobileDevice } from './utils/mobile';
import { SwiperEffect, SwipingType } from './utils/swiperEffect';

// import Swiper and modules styles
import 'swiper/css';
import 'swiper/css/effect-creative';
import 'swiper/css/pagination';

export default function IndexPage() {
  const { isPopupOpen } = usePopup();
  const { connect, disconnect, user } = useUser();
  const { page: currentPage, setPage, pages } = useNavigation();

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

  const rootClassName = cls('flex-grow overflow-auto w-full h-screen', isPopupOpen ? 'blur-sm' : '');
  const pageClassName = 'space-y-6 p-4 md:p-10 md:px-[10%] mx-auto text-center w-full center overflow-auto bg-gray-50';

  return currentPage ? (
    user !== undefined && isMobileDevice() ? (
      <Swiper
        pagination={true}
        modules={[Pagination, EffectCube, EffectCreative]}
        effect={'creative'}
        creativeEffect={SwiperEffect(SwipingType.Rotate)}
        onSlideChange={(swiper) => setPage(pages[swiper.activeIndex])}
        className={rootClassName}
      >
        {pages.map((page) => (
          <SwiperSlide key={page} className={pageClassName} style={{ overflowY: 'auto', overflowX: 'hidden' }}>
            <MainPage page={page} />
          </SwiperSlide>
        ))}
      </Swiper>
    ) : (
      <div className={rootClassName}>
        {user !== undefined ? (
          pages.map((page) => (
            <div key={page} className={cls(pageClassName, page === currentPage ? 'visible' : 'hidden')}>
              <MainPage page={page} />
            </div>
          ))
        ) : (
          <div className={pageClassName}>
            <MainPage page={Page.Dashboard} />
          </div>
        )}
      </div>
    )
  ) : (
    <LoadingDot />
  );
}
