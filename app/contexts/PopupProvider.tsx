'use client';

import { FC, ReactNode, useCallback, useState } from 'react';
import { PopupContext, usePopup } from '../hooks/usePopup';

export interface PopupProviderProps {
  children: ReactNode;
}

export const PopupProvider: FC<PopupProviderProps> = ({ children }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState<ReactNode>(null);

  const setDocumentStyle = useCallback((isPopupOpen: boolean) => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.overflow = isPopupOpen ? 'hidden' : 'auto';
      document.documentElement.style.pointerEvents = isPopupOpen ? 'none' : 'auto';
    }
  }, []);

  const openPopup = useCallback(
    (content: ReactNode) => {
      setPopupContent(content);
      setDocumentStyle(true);
      setTimeout(() => {
        setIsPopupOpen(true);
      }, 100);
    },
    [setDocumentStyle]
  );

  const closePopup = useCallback(() => {
    setDocumentStyle(false);
    setTimeout(() => {
      setIsPopupOpen(false);
    }, 100);
  }, [setDocumentStyle]);

  return (
    <PopupContext.Provider
      value={{
        isPopupOpen,
        openPopup,
        closePopup,
        popupContent,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};
