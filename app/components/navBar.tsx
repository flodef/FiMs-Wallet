'use client';

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Button, Tab, TabGroup, TabList } from '@tremor/react';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { FiMsLogo } from '../../public/FiMsLogo';
import { Page, useNavigation } from '../hooks/useNavigation';
import { usePopup } from '../hooks/usePopup';
import { useUser } from '../hooks/useUser';
import { Dataset } from '../utils/types';
import Connect from './connect';
import Disconnect from './disconnect';

const t: Dataset = {
  connect: 'Se connecter',
  disconnect: 'Se déconnecter',
  dashboard: 'FiMs',
  portfolio: 'Mon compte',
  transactions: 'Transactions',
  users: 'Utilisateurs',
};

export default function Navbar() {
  const { isPopupOpen, openPopup } = usePopup();
  const { page: currentPage, setPage, pages } = useNavigation();
  const { user, isConnected } = useUser();

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(window.location.pathname === '/admin' && window.location.hostname === 'localhost');
  }, []);

  const goHome = () => (window.location.href = window.location.origin);
  const goToDashboard = () => isConnected && currentPage !== Page.Dashboard && setPage(Page.Dashboard);

  const genericHamburgerLine = `h-1 w-6 my-[3px] rounded-full bg-black dark:bg-white transition ease transform`;

  return (
    <Disclosure
      as="nav"
      className={twMerge(
        'z-10 shadow-sm flex-shrink-0 transition-all',
        'bg-theme-background dark:bg-dark-theme-background',
        isPopupOpen ? 'blur-sm' : 'blur-none',
      )}
    >
      {({ open }) => (
        <>
          {!isAdmin ? (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <a
                    className={twMerge(
                      'flex flex-shrink-0 items-center',
                      isConnected && currentPage !== Page.Dashboard ? 'cursor-pointer' : '',
                    )}
                    onClick={goToDashboard}
                    onKeyDown={goToDashboard}
                  >
                    <FiMsLogo />
                  </a>
                  <div className={twMerge('contents', isConnected ? 'animate-display' : 'hidden')}>
                    <TabGroup
                      className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8"
                      style={{ marginTop: '15px' }}
                      defaultIndex={pages.indexOf(currentPage ?? Page.Dashboard)}
                      index={pages.indexOf(currentPage ?? Page.Dashboard)}
                      onIndexChange={i => setPage(pages[i])}
                    >
                      <TabList>
                        {pages.map(page => (
                          <Tab
                            className={twMerge(
                              'text-sm hover:text-gray-700 hover:font-bold',
                              page === currentPage
                                ? 'cursor-default font-bold border-b-2 mb-0 border-b-blue-500 text-blue-500'
                                : 'cursor-pointer',
                            )}
                            key={page}
                            aria-current={page === currentPage ? 'page' : undefined}
                          >
                            {t[page.toLowerCase()]}
                          </Tab>
                        ))}
                      </TabList>
                    </TabGroup>
                    <div className="-mr-2 ml-2 flex items-center sm:hidden">
                      <DisclosureButton
                        className={twMerge(
                          'flex flex-col h-12 w-12 border-0 border-black dark:border-white',
                          'rounded justify-center items-center group ml-0 p-2 focus:outline-none bg-transparent',
                          'bg-theme-background dark:bg-dark-theme-background',
                          'text-theme-content-subtle dark:text-dark-theme-content-subtle',
                          'hover:bg-theme-background-subtle dark:hover:bg-dark-theme-background-subtle',
                          'hover:text-theme-content dark:hover:text-dark-theme-content',
                        )}
                      >
                        <span className="sr-only">Open main menu</span>
                        <div
                          className={twMerge(
                            genericHamburgerLine,
                            open
                              ? 'rotate-45 translate-y-[10px] opacity-100 group-hover:opacity-100'
                              : 'opacity-100 group-hover:opacity-100',
                          )}
                        />
                        <div
                          className={twMerge(
                            genericHamburgerLine,
                            open ? 'opacity-0' : 'opacity-100 group-hover:opacity-100',
                          )}
                        />
                        <div
                          className={twMerge(
                            genericHamburgerLine,
                            open
                              ? '-rotate-45 -translate-y-[10px] opacity-100 group-hover:opacity-100'
                              : 'opacity-100 group-hover:opacity-100',
                          )}
                        />
                      </DisclosureButton>
                    </div>
                  </div>
                </div>

                <div className={twMerge('ml-6 flex items-center', currentPage ? 'animate-display' : 'hidden')}>
                  <Button
                    className="flex font-bold"
                    style={{ borderRadius: 24 }}
                    onClick={() => openPopup(!isConnected ? <Connect /> : <Disconnect />, !isConnected)}
                  >
                    {!isConnected ? t.connect : user?.name}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 justify-between">
              <a
                className={twMerge(
                  'flex flex-shrink-0 items-center',
                  isConnected && currentPage !== Page.Dashboard ? 'cursor-pointer' : '',
                )}
                onClick={goHome}
                onKeyDown={goHome}
              >
                <FiMsLogo />
              </a>
            </div>
          )}

          {isConnected && !isAdmin && (
            <DisclosurePanel className="sm:hidden animate-display">
              <div className="space-y-1 pt-2 pb-3">
                {pages.map(page => (
                  <DisclosureButton
                    key={page}
                    className={twMerge(
                      page === currentPage
                        ? 'bg-theme-background-subtle dark:bg-dark-theme-background-subtle ' +
                            'border-theme-content dark:border-dark-theme-content ' +
                            'text-theme-content-emphasis dark:text-dark-theme-content-emphasis'
                        : 'border-transparent text-theme-content dark:text-dark-theme-content ' +
                            'hover:bg-theme-background-subtle dark:hover:bg-dark-theme-background-subtle ' +
                            'hover:border-theme-content-subtle dark:hover:border-dark-theme-content-subtle' +
                            'hover:text-theme-content-strong dark:hover:text-dark-theme-content-strong',
                      'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
                    )}
                    onClick={() => setPage(page)}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {t[page.toLowerCase()]}
                  </DisclosureButton>
                ))}
              </div>
            </DisclosurePanel>
          )}
        </>
      )}
    </Disclosure>
  );
}
