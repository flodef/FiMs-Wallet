import { Button, Flex, TextInput, Title } from '@tremor/react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const { closePopup, isPopupOpen } = usePopup();
  const { connect } = useUser();

  const [userName, setUserName] = useState(''); // TODO : load username from local storage
  const [currentUserName, setCurrentUserName] = useState('');
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const isValidationDisabled = currentUserName === '' || hasConnectionError;

  const setFocus = useCallback(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  const handleConnect = useCallback(() => {
    if (isConnecting || isValidationDisabled) return;

    setIsConnecting(true);
    setUserName(currentUserName);
    fetch(`./api/database?user=${currentUserName}`)
      .then((result) =>
        result.json().then((data) => {
          console.log(data);
          setIsConnecting(false);
          if (data.error || data.length !== 1) {
            setHasConnectionError(true);
            setFocus();
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
        setFocus();
      });
  }, [currentUserName, closePopup, connect, setFocus, isConnecting, isValidationDisabled]);

  const changeUserName = useCallback(
    (value: string) => {
      setCurrentUserName(value);
      setHasConnectionError(value !== '' && value === userName);
    },
    [userName]
  );

  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    // Focus the input when the popup is opened
    if (isPopupOpen) {
      setFocus();
    }
  }, [isPopupOpen, setFocus]);

  return (
    <Flex flexDirection="col">
      <Title className="mb-6">{t['connect']}</Title>
      <TextInput
        autoFocus
        ref={inputRef}
        error={hasConnectionError}
        errorMessage={t['wrongUserName']}
        placeholder={t['userName']}
        defaultValue={currentUserName}
        onValueChange={changeUserName}
        onKeyDown={(event) => {
          event.key === 'Enter' && handleConnect();
        }}
      />
      <Button
        className="flex font-bold mt-6"
        loading={isConnecting}
        disabled={isValidationDisabled}
        style={{ borderRadius: 24 }}
        onClick={handleConnect}
      >
        {t['letsGo']}
      </Button>
    </Flex>
  );
}
