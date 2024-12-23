import { Button, TextInput } from '@tremor/react';
import { Flex } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePopup } from '../hooks/usePopup';
import { useUser } from '../hooks/useUser';
import { transitionDuration } from '../utils/functions';
import { Dataset } from '../utils/types';
import { Title } from './typography';

const t: Dataset = {
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

  const isValidationDisabled = currentUserName.length < 5 || hasConnectionError;

  const setFocus = useCallback(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), transitionDuration + 100);
    }
  }, []);

  const handleConnect = useCallback(() => {
    if (isConnecting || isValidationDisabled) return;

    setIsConnecting(true);
    setUserName(currentUserName);

    connect(currentUserName)
      .then(user => {
        setHasConnectionError(user === undefined);
        if (user) closePopup();
        else setFocus();
      })
      .catch(error => {
        console.error(error);
        setHasConnectionError(true);
        setFocus();
      })
      .finally(() => setIsConnecting(false));
  }, [currentUserName, closePopup, connect, setFocus, isConnecting, isValidationDisabled]);

  const changeUserName = useCallback(
    (value: string) => {
      setCurrentUserName(value.trim());
      setHasConnectionError(value.trim() !== '' && value.trim() === userName);
    },
    [userName],
  );

  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    // Focus the input when the popup is opened
    if (isPopupOpen) {
      setFocus();
    }
  }, [isPopupOpen, setFocus]);

  return (
    <Flex
      className="w-full space-y-6 text-theme-content-emphasis dark:text-dark-theme-content-emphasis"
      align="center"
      vertical
    >
      <Title>{t.connect}</Title>
      <TextInput
        className="max-w-xs"
        autoFocus
        ref={inputRef}
        error={hasConnectionError}
        errorMessage={t.wrongUserName}
        placeholder={t.userName}
        defaultValue={currentUserName}
        onValueChange={changeUserName}
        onKeyDown={event => {
          if (event.key === 'Enter') handleConnect();
        }}
      />
      <Button
        className="flex font-bold mt-6"
        loading={isConnecting}
        disabled={isValidationDisabled}
        style={{ borderRadius: 24 }}
        onClick={handleConnect}
      >
        {t.letsGo}
      </Button>
    </Flex>
  );
}
