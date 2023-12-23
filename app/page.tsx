'use client';

import Dashboard from './components/dashboard';
import { usePopup } from './hooks/usePopup';
import { useIsWindowReady } from './hooks/useWindowParam';
import Loading from './loading';

export default function IndexPage() {
  const { isPopupOpen } = usePopup();

  return (
    <main className={'space-y-6 p-4 md:p-10 mx-auto max-w-7xl ' + (isPopupOpen ? 'blur-sm' : '')}>
      {useIsWindowReady() ? <Dashboard /> : Loading()}
    </main>
  );
}
