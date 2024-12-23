import { Button } from '@tremor/react';
import { useCallback, useEffect, useRef } from 'react';
import { usePopup } from '../hooks/usePopup';
import { useUser } from '../hooks/useUser';
import { Dataset } from '../utils/types';
import { Title } from './typography';
import { Flex } from 'antd';

const t: Dataset = {
  disconnect: 'Se déconnecter ?',
  goodBye: 'Bye Bye !',
};

export default function Disconnect() {
  const { closePopup, isPopupOpen } = usePopup();
  const { disconnect } = useUser();

  const handleDisconnect = useCallback(() => {
    disconnect();
    closePopup();
  }, [closePopup, disconnect]);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    // Focus the input when the popup is opened
    if (isPopupOpen && buttonRef.current) {
      setTimeout(() => buttonRef.current?.focus(), 100);
    }
  }, [isPopupOpen]);

  return (
    <Flex
      className="w-full space-y-6 text-theme-content-emphasis dark:text-dark-theme-content-emphasis"
      align="center"
      vertical
    >
      <Title>{t.disconnect}</Title>
      <Button ref={buttonRef} className="flex font-bold" style={{ borderRadius: 24 }} onClick={handleDisconnect}>
        {t.goodBye}
      </Button>
    </Flex>
  );
}
