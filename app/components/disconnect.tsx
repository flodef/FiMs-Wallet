import { Button, Flex, Title } from '@tremor/react';
import { useCallback, useEffect, useRef } from 'react';
import { usePopup } from '../hooks/usePopup';
import { useUser } from '../hooks/useUser';
import { dataset } from '../utils/types';

const t: dataset = {
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
    <Flex flexDirection="col">
      <Title className="mb-6">{t['disconnect']}</Title>
      <Button ref={buttonRef} className="flex font-bold" style={{ borderRadius: 24 }} onClick={handleDisconnect}>
        {t['goodBye']}
      </Button>
    </Flex>
  );
}
