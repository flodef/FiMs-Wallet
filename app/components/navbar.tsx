'use client';

import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button, Tab, TabGroup, TabList } from '@tremor/react';
import { usePathname } from 'next/navigation';
import { Page, useNavigation } from '../hooks/useNavigation';
import { usePopup } from '../hooks/usePopup';
import { useUser } from '../hooks/useUser';
import { FiMsLogo } from '../images/FiMsLogo';
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

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { openPopup, isPopupOpen } = usePopup();
  const { page: currentPage, setPage } = useNavigation();
  const { user } = useUser();
  const pathname = usePathname();

  const pages = Object.keys(Page).map((page) => Page[page as keyof typeof Page]);

  return (
    <Disclosure as="nav" className={'bg-white shadow-sm ' + (isPopupOpen ? 'blur-sm' : '')}>
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <a className="flex flex-shrink-0 items-center" href={!user || pathname === '/' ? undefined : '/'}>
                  <FiMsLogo />
                </a>
                <div className={(user ? 'animate-display' : 'hidden') + ' contents'}>
                  <TabGroup
                    className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8"
                    style={{ marginTop: '15px' }}
                    defaultIndex={pages.indexOf(currentPage ?? Page.Dashboard)}
                    index={pages.indexOf(currentPage ?? Page.Dashboard)}
                    onIndexChange={(i) => setPage(pages[i])}
                  >
                    <TabList>
                      {pages.map((page) => (
                        <Tab key={page} aria-current={page === currentPage ? 'page' : undefined}>
                          {t[page.toLowerCase()]}
                        </Tab>
                      ))}
                    </TabList>
                  </TabGroup>
                  <div className="-mr-2 ml-2 flex items-center sm:hidden">
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none">
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
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <div className={(currentPage ? 'animate-display' : 'hidden') + ' ml-6 flex items-center'}>
                <Button
                  className="flex font-bold"
                  style={{ borderRadius: 24 }}
                  onClick={() => openPopup(!user ? <Connect /> : <Disconnect />, !user)}
                >
                  {!user ? t['connect'] : user.name}
                </Button>
              </div>
            </div>
          </div>

          {user && (
            <Disclosure.Panel className="sm:hidden animate-display">
              <div className="space-y-1 pt-2 pb-3">
                {pages.map((page) => (
                  <Disclosure.Button
                    key={page}
                    className={classNames(
                      page === currentPage
                        ? 'bg-slate-50 border-slate-500 text-slate-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
                      'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                    )}
                    onClick={() => setPage(page)}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {t[page.toLowerCase()]}
                  </Disclosure.Button>
                ))}
              </div>
            </Disclosure.Panel>
          )}
        </>
      )}
    </Disclosure>
  );
}
