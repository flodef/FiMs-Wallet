import { Button, Flex, Title } from '@tremor/react';
import { useCallback } from 'react';
import { usePopup } from '../hooks/usePopup';
import { useUser } from '../hooks/useUser';
import { dataset } from '../utils/types';

const t: dataset = {
  disconnect: 'Se déconnecter ?',
  goodBye: 'Bye Bye !',
};

export default function Disconnect() {
  const { closePopup } = usePopup();
  const { disconnect } = useUser();

  const handleDisconnect = useCallback(() => {
    disconnect();
    closePopup();
  }, [closePopup, disconnect]);

  return (
    <Flex flexDirection="col">
      <Title className="mb-6">{t['disconnect']}</Title>
      <Button className="flex font-bold" style={{ borderRadius: 24 }} onClick={handleDisconnect}>
        {t['goodBye']}
      </Button>
    </Flex>
  );
}
