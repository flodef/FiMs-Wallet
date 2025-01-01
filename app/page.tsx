'use client';

import { FiMsLogo } from '@/public/FiMsLogo';
import { IconLogout } from '@tabler/icons-react';
import { Button, ConfigProvider, Flex, Tabs, TabsProps, theme } from 'antd';
import { ReactNode, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Connect from './components/connect';
import Disconnect from './components/disconnect';
import { BigTitle } from './components/typography';
import VersionNotes, { VersionNote } from './components/versionNotes';
import { Page, pages, useNavigation } from './hooks/useNavigation';
import { usePopup } from './hooks/usePopup';
import { useUser } from './hooks/useUser';
import { useWindowParam } from './hooks/useWindowParam';
import { LoadingDot } from './loading';
import Dashboard from './pages/dashboard';
import Portfolio from './pages/portfolio';
import Transactions from './pages/transactions';
import Users from './pages/users';
import { useLocalStorage } from './utils/localStorage';
import { useIsMobile } from './utils/mobile';
import { Dataset } from './utils/types';

// import Swiper and modules styles
// import 'swiper/css';
// import 'swiper/css/effect-creative';
// import 'swiper/css/pagination';

const { defaultAlgorithm, darkAlgorithm } = theme;

const t: Dataset = {
  connect: 'Se connecter',
  disconnect: 'Se déconnecter',
  dashboard: 'FiMs',
  portfolio: 'Mon Compte',
  transactions: 'Mes Transactions',
  users: 'Mon Profil',
};

export default function IndexPage() {
  const { isPopupOpen, openPopup, closePopup } = usePopup();
  const { isConnected, user } = useUser();
  const { page: currentPage, setPage, setNeedRefresh } = useNavigation();
  const { isDark } = useWindowParam();

  const [version, setVersion] = useLocalStorage('version', '0.0');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  const isMobile = useIsMobile(640);

  useEffect(() => {
    const interval = setInterval(() => {
      setNeedRefresh(true);
    }, 60000); // Refresh every minute

    return () => {
      clearInterval(interval);
    };
  }, [setNeedRefresh]);

  useEffect(() => {
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

  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (isMenuOpen) {
        e.preventDefault();
        window.scrollTo(0, scrollPosition);
      } else {
        setScrollPosition(window.scrollY);
        setIsScrolled(window.scrollY > 0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: false });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuOpen, isPopupOpen, scrollPosition]);

  // const MainScreen = () => {
  //   return isConnected && isMobileDevice() ? (
  //     <Swiper
  //       pagination={true}
  //       modules={[Pagination, EffectCube, EffectCreative]}
  //       effect={'creative'}
  //       creativeEffect={SwiperEffect(SwipingType.Rotate)}
  //       onSlideChange={swiper => setPage(pages[swiper.activeIndex])}
  //       className={rootClassName}
  //     >
  //       {pages.map(page => (
  //         <SwiperSlide key={page} className={pageClassName} style={{ overflowY: 'auto', overflowX: 'hidden' }}>
  //           <MainPage page={page} />
  //         </SwiperSlide>
  //       ))}
  //     </Swiper>
  //   );
  // };

  const genericHamburgerLine = `h-1 w-6 my-[3px] rounded-full bg-black dark:bg-white transition ease transform`;
  const menuButton = (
    <Flex className="items-end self-center cursor-pointer m-4" vertical onClick={() => setIsMenuOpen(!isMenuOpen)}>
      <div
        className={twMerge(
          genericHamburgerLine,
          isMenuOpen
            ? 'rotate-45 translate-y-[10px] opacity-100 group-hover:opacity-100'
            : 'opacity-100 group-hover:opacity-100',
        )}
      />
      <div
        className={twMerge(genericHamburgerLine, isMenuOpen ? 'opacity-0' : 'opacity-100 group-hover:opacity-100')}
      />
      <div
        className={twMerge(
          genericHamburgerLine,
          isMenuOpen
            ? '-rotate-45 -translate-y-[10px] opacity-100 group-hover:opacity-100'
            : 'opacity-100 group-hover:opacity-100',
        )}
      />
    </Flex>
  );

  const logoButton = (
    <a
      className={twMerge(
        'flex flex-shrink-0 p-4 items-center',
        !isMobile && 'mr-3',
        isConnected && currentPage !== Page.Dashboard ? 'cursor-pointer' : 'cursor-default',
      )}
      onClick={() => isConnected && currentPage !== Page.Dashboard && setPage(Page.Dashboard)}
    >
      <FiMsLogo />
    </a>
  );

  const connectButton = (
    <Button
      type="primary"
      size="large"
      style={{
        borderRadius: 24,
        marginLeft: !isMobile ? 16 : 0,
        marginRight: 16,
        marginTop: 12,
        marginBottom: 12,
        paddingLeft: !isMobile ? 16 : 12,
        paddingRight: !isMobile ? 16 : 8,
      }}
      onClick={() => {
        setIsMenuOpen(false);
        openPopup(!isConnected ? <Connect /> : <Disconnect />, !isConnected);
      }}
    >
      {!isConnected ? t.connect : isMobile ? <IconLogout /> : user?.name}
    </Button>
  );

  const getPageComponent = (page: Page) => {
    return {
      Portfolio: <Portfolio />,
      Transactions: <Transactions />,
      Users: <Users />,
      Dashboard: <Dashboard />,
    }[page];
  };

  const items: TabsProps['items'] = pages.map(page => ({
    key: page,
    label: <div className={currentPage === page ? 'cursor-default' : 'cursor-pointer'}>{t[page.toLowerCase()]}</div>,
    children: (
      <div
        className={twMerge(
          'space-y-6 pt-20 px-4 pb-4 md:pt-[88px] md:px-6 md:pb-6 mx-auto w-full max-w-7xl',
          'bg-theme-background-subtle dark:bg-dark-theme-background-subtle',
          'text-theme-content-emphasis dark:text-dark-theme-content-emphasis',
        )}
      >
        {getPageComponent(page)}
      </div>
    ),
  }));

  const renderTabBar: TabsProps['renderTabBar'] = (props, DefaultTabBar) => (
    <div
      className={twMerge(
        'fixed top-0 left-0 right-0 z-10 transition-all duration-200',
        isScrolled && !isMenuOpen
          ? 'bg-theme-background-subtle/80 dark:bg-dark-theme-background-subtle/80 backdrop-blur-sm shadow-md'
          : 'bg-theme-background-subtle dark:bg-dark-theme-background-subtle',
      )}
    >
      {!isMobile ? (
        <DefaultTabBar className="w-full max-w-7xl justify-self-center" {...props} />
      ) : (
        <>
          <Flex justify="space-between" className="w-full max-w-7xl justify-self-center">
            {operationsSlot.left}
            <BigTitle className={twMerge('self-center transition-opacity', !isMenuOpen ? 'opacity-100' : 'opacity-0')}>
              {currentPage && t[currentPage.toLowerCase()]}
            </BigTitle>
            <Flex justify="end">
              {isConnected && menuButton}
              {operationsSlot.right}
            </Flex>
          </Flex>
          <div
            className={twMerge(
              'fixed inset-0 h-screen bg-black/30 transition-all duration-200 mt-16',
              isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
            )}
            onClick={() => setIsMenuOpen(false)}
          />
          <DefaultTabBar
            className={twMerge(
              'transition-all relative shadow-md bg-theme-background-subtle dark:bg-dark-theme-background-subtle',
              isMenuOpen ? 'h-56' : 'h-0',
            )}
            {...props}
          />
        </>
      )}
    </div>
  );

  type PositionType = 'left' | 'right';
  const operationsSlot: Record<PositionType, ReactNode> = {
    left: logoButton,
    right: connectButton,
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
        components: {
          Card: {
            headerFontSize: 20,
            headerHeight: 80,
          },
          Form: {
            labelFontSize: 16,
          },
          Tabs: {
            horizontalMargin: '0 0 0 0',
            titleFontSize: 16,
          },
        },
      }}
    >
      {currentPage ? (
        <div className={twMerge('flex flex-grow w-[99%] lg:w-full justify-center', isPopupOpen ? 'blur-sm' : '')}>
          <Tabs
            className="w-full"
            renderTabBar={renderTabBar}
            defaultActiveKey={isConnected ? Page.Portfolio : Page.Dashboard}
            activeKey={currentPage?.toString()}
            items={isConnected ? items : items.slice(-1)}
            tabBarExtraContent={!isMobile && operationsSlot}
            size="large"
            onChange={activeKey => {
              setPage(activeKey as Page);
              setIsMenuOpen(false);
            }}
            tabPosition={isMobile ? 'right' : 'top'}
            more={{ icon: null, trigger: 'hover' }}
          />
        </div>
      ) : (
        <LoadingDot />
      )}
    </ConfigProvider>
  );
}
