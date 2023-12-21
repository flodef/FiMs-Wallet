import { Button, Flex, TextInput, Title } from '@tremor/react';
import { useCallback, useState } from 'react';
import { usePopup } from '../hooks/usePopup';
import { useUser } from '../hooks/useUser';
import { dataset } from '../utils/types';

const t: dataset = {
  connect: 'Se connecter',
  userName: "Nom d'utilisateur",
  wrongUserName: "Nom d'utilisateur incorrect",
  letsGo: "C'est parti !",
};

export default function Connect() {
  const { closePopup } = usePopup();
  const { connect } = useUser();

  const [userName, setUserName] = useState(''); // TODO : load username from local storage
  const [currentUserName, setCurrentUserName] = useState('');
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = useCallback(() => {
    setUserName(currentUserName);
    setIsConnecting(true);
    fetch(`./api/database?user=${currentUserName}`)
      .then((result) =>
        result.json().then((data) => {
          console.log(data);
          setIsConnecting(false);
          if (data.error || data.length !== 1) {
            setHasConnectionError(true);
          } else {
            connect(data[0]);
            closePopup();
          }
        })
      )
      .catch((error) => {
        console.log(error);
        setIsConnecting(false);
        setHasConnectionError(true);
      });
  }, [currentUserName, closePopup, connect]);

  const changeUserName = useCallback(
    (value: string) => {
      setCurrentUserName(value);
      setHasConnectionError(value !== '' && value === userName);
    },
    [userName]
  );

  return (
    <Flex flexDirection="col">
      <Title className="mb-6">{t['connect']}</Title>
      <TextInput
        error={hasConnectionError}
        errorMessage={t['wrongUserName']}
        placeholder={t['userName']}
        defaultValue={currentUserName}
        onValueChange={changeUserName}
      />
      <Button
        className="flex font-bold mt-6"
        loading={isConnecting}
        disabled={currentUserName === '' || hasConnectionError}
        style={{ borderRadius: 24 }}
        onClick={handleConnect}
      >
        {t['letsGo']}
      </Button>
    </Flex>
  );
}
