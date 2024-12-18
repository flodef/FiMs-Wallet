'use client';

import { useEffect, useState } from 'react';
import { EffectCreative, EffectCube, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import VersionNotes, { VersionNote } from './components/versionNotes';
import { Page, useNavigation } from './hooks/useNavigation';
import { usePopup } from './hooks/usePopup';
import { useUser } from './hooks/useUser';
import { LoadingDot } from './loading';
import MainPage from './main';
import { cls } from './utils/constants';
import { useLocalStorage } from './utils/localStorage';
import { isMobileDevice } from './utils/mobile';
import { SwiperEffect, SwipingType } from './utils/swiperEffect';

// import Swiper and modules styles
import 'swiper/css';
import 'swiper/css/effect-creative';
import 'swiper/css/pagination';
import tailwindConfig from '@/tailwind.config';

export default function IndexPage() {
  const { isPopupOpen, openPopup, closePopup } = usePopup();
  const { isConnected } = useUser();
  const { page: currentPage, setPage, pages, setNeedRefresh } = useNavigation();

  const [version, setVersion] = useLocalStorage('version', '0.0');
  const [isLoaded, setIsLoaded] = useState(false);

  const rootClassName = cls(
    'flex-grow w-full h-screen self-center',
    isPopupOpen ? 'animate-blur overflow-hidden' : !isLoaded ? 'animate-unblur overflow-auto' : 'overflow-auto',
  );
  const pageClassName =
    'space-y-6 p-4 md:p-10 mx-auto w-full max-w-7xl text-center center overflow-auto bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle';

  useEffect(() => {
    const interval = setInterval(() => {
      setNeedRefresh(true);
    }, 60000); // Refresh every minute

    return () => {
      clearInterval(interval);
    };
  }, [setNeedRefresh]);

  useEffect(() => {
    if (isPopupOpen) {
      setIsLoaded(false);
    } else {
      setTimeout(() => {
        setIsLoaded(true);
      }, parseInt(tailwindConfig.theme.extend.transitionDuration.DEFAULT));
    }
  }, [isPopupOpen]);

  useEffect(() => {
    setIsLoaded(true);
    fetch('/VERSION.md')
      .then(response => response.text())
      .then(text => {
        const regex = /# (\d+\.\d+)((?:\n(?!\n#).*)*)/g;
        let match;
        const versions: VersionNote[] = [];

        while ((match = regex.exec(text)) !== null) {
          if (versions.length < 3) {
            versions.push({
              version: match[1],
              notes: match[2]
                .trim()
                .split('\n')
                .filter(line => line.trim().length > 0)
                .map(note => note.replace(/^- /, '')),
            });
          }
        }

        const handleClose = () => {
          setVersion(versions[0].version);
          setTimeout(closePopup, 100);
        };

        if (versions.length && version !== versions[0].version) {
          openPopup(<VersionNotes versionNotes={versions} onClose={handleClose} />);
        }
      })
      .catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const MainScreen = () => {
    return isConnected && isMobileDevice() ? (
      <Swiper
        pagination={true}
        modules={[Pagination, EffectCube, EffectCreative]}
        effect={'creative'}
        creativeEffect={SwiperEffect(SwipingType.Rotate)}
        onSlideChange={swiper => setPage(pages[swiper.activeIndex])}
        className={rootClassName}
      >
        {pages.map(page => (
          <SwiperSlide key={page} className={pageClassName} style={{ overflowY: 'auto', overflowX: 'hidden' }}>
            <MainPage page={page} />
          </SwiperSlide>
        ))}
      </Swiper>
    ) : (
      <div className={rootClassName}>
        {isConnected ? (
          pages.map(page => (
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
    );
  };

  return currentPage ? <MainScreen /> : <LoadingDot />;
}
