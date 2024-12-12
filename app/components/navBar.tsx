'use client';

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button, Tab, TabGroup, TabList } from '@tremor/react';
import { useEffect, useState } from 'react';
import { FiMsLogo } from '../../public/FiMsLogo';
import { Page, useNavigation } from '../hooks/useNavigation';
import { usePopup } from '../hooks/usePopup';
import { useUser } from '../hooks/useUser';
import { cls } from '../utils/constants';
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

  return (
    <Disclosure
      as="nav"
      className={cls(
        'bg-tremor-background dark:bg-dark-tremor-background shadow-sm flex-shrink-0 z-10',
        isPopupOpen ? 'blur-sm' : '',
      )}
    >
      {({ open }) => (
        <>
          {!isAdmin ? (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <a
                    className={cls(
                      'flex flex-shrink-0 items-center',
                      isConnected && currentPage !== Page.Dashboard ? 'cursor-pointer' : '',
                    )}
                    onClick={goToDashboard}
                    onKeyDown={goToDashboard}
                  >
                    <FiMsLogo />
                  </a>
                  <div className={cls('contents', isConnected ? 'animate-display' : 'hidden')}>
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
                            className={cls(
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
                        className={cls(
                          'inline-flex items-center justify-center rounded-md p-2 focus:outline-none',
                          'bg-tremor-background dark:bg-dark-tremor-background',
                          'text-tremor-content-subtle dark:text-dark-tremor-content-subtle',
                          'hover:bg-tremor-background-subtle dark:hover:bg-dark-tremor-background-subtle',
                          'hover:text-tremor-content dark:hover:text-dark-tremor-content',
                        )}
                      >
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XMarkIcon
                            className="block h-8 w-8 font-bold focus:border-0 focus:ring-0 focus:outline-0"
                            aria-hidden="true"
                          />
                        ) : (
                          <Bars3Icon
                            className="block h-8 w-8 font-bold focus:border-0 focus:ring-0 focus:outline-0"
                            aria-hidden="true"
                          />
                        )}
                      </DisclosureButton>
                    </div>
                  </div>
                </div>

                <div className={cls('ml-6 flex items-center', currentPage ? 'animate-display' : 'hidden')}>
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
                className={cls(
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
                    className={cls(
                      page === currentPage
                        ? 'bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle ' +
                            'border-tremor-content dark:border-dark-tremor-content ' +
                            'text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis'
                        : 'border-transparent text-tremor-content dark:text-dark-tremor-content ' +
                            'hover:bg-tremor-background-subtle dark:hover:bg-dark-tremor-background-subtle ' +
                            'hover:border-tremor-content-subtle dark:hover:border-dark-tremor-content-subtle' +
                            'hover:text-tremor-content-strong dark:hover:text-dark-tremor-content-strong',
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
