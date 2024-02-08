'use client';

import { useLocalStorage } from '@solana/wallet-adapter-react';
import { Dialog, DialogPanel } from '@tremor/react';
import { useEffect, useState } from 'react';
import { EffectCreative, EffectCube, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Connect from './components/connect';
import Disconnect from './components/disconnect';
import VersionNotes, { VersionNote } from './components/versionNotes';
import { usePopup } from './contexts/PopupProvider';
import { Page, useNavigation } from './hooks/useNavigation';
import { useUser } from './hooks/useUser';
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
  const { isPopupOpen, openPopup, closePopup } = usePopup();
  const { isConnected } = useUser();
  const { page: currentPage, setPage, pages } = useNavigation();

  const [version, setVersion] = useLocalStorage('version', '0.0');
  const [versionNotes, setVersionNotes] = useState<VersionNote[]>([]);

  const rootClassName = cls(
    'flex-grow overflow-auto w-full h-screen max-w-7xl self-center',
    isPopupOpen ? 'blur-sm' : '',
  );
  const pageClassName =
    'space-y-6 p-4 md:p-10 mx-auto text-center w-full center overflow-auto bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle';

  useEffect(() => {
    fetch('/VERSION.md')
      .then(response => {
        response.text().then(text => {
          const regex = /# (\d+\.\d+)((?:\n(?!\n#).*)*)/g;
          let match;
          const versions: VersionNote[] = [];

          while ((match = regex.exec(text)) !== null) {
            if (version < match[1] && versions.length < 3) {
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

          if (versions.length > 0) {
            setVersion(versions[0].version);
            setVersionNotes(versions);
            openPopup();
          }
        });
      })
      .catch(error => {
        console.error('Error fetching version note:', error);
      });
  }, [version, setVersion, openPopup]);

  function handleClose() {
    setVersionNotes([]);
    closePopup();
  }

  return (
    <>
      <Dialog open={isPopupOpen} onClose={handleClose}>
        <DialogPanel>
          {versionNotes.length > 0 ? (
            <VersionNotes versionNotes={versionNotes} onClose={handleClose} />
          ) : !isConnected ? (
            <Connect />
          ) : (
            <Disconnect />
          )}
        </DialogPanel>
      </Dialog>
      {currentPage ? (
        isConnected && isMobileDevice() ? (
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
        )
      ) : (
        <LoadingDot />
      )}
    </>
  );
}
