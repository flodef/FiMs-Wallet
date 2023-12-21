'use client';

import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@tremor/react';
import { signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { usePopup } from '../hooks/usePopup';
import { useUser } from '../hooks/useUser';
import { FiMsLogo } from '../images/FiMsLogo';
import { dataset } from '../utils/types';
import Connect from './connect';
import Disconnect from './disconnect';

const t: dataset = {
  connect: 'Se connecter',
  disconnect: 'Se déconnecter',
};

const navigation = [
  { name: 'Mon compte', href: '/account' },
  { name: 'Utilisateurs', href: '/users' },
  { name: 'Transactions', href: '/transactions' },
  { name: 'FiMs', href: '/' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { openPopup, isPopupOpen } = usePopup();
  const { user } = useUser();
  const pathname = usePathname();

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
                {user && (
                  <>
                    <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={pathname === item.href ? undefined : item.href} // Prevent double navigation
                          className={classNames(
                            pathname === item.href
                              ? 'border-slate-500 text-gray-900'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                          )}
                          aria-current={pathname === item.href ? 'page' : undefined}
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
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
                  </>
                )}
              </div>

              <div className="ml-6 flex items-center">
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
            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 pt-2 pb-3">
                {navigation
                  .filter((item) => (!user ? item.href === '/' : true))
                  .map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={pathname === item.href ? undefined : item.href} // Prevent double navigation
                      className={classNames(
                        pathname === item.href
                          ? 'bg-slate-50 border-slate-500 text-slate-700'
                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
                        'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                      )}
                      aria-current={pathname === item.href ? 'page' : undefined}
                    >
                      {item.name}
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
