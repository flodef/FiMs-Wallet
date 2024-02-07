'use client';

import { FC, ReactNode, createContext, useContext, useState } from 'react';

export interface PopupContextState {
  isPopupOpen: boolean;
  openPopup: () => void;
  closePopup: () => void;
}

export const PopupContext = createContext<PopupContextState>({} as PopupContextState);

export const PopupProvider: FC<PopupProviderProps> = ({ children }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <PopupContext.Provider
      value={{
        isPopupOpen,
        openPopup: () => setIsPopupOpen(true),
        closePopup: () => setIsPopupOpen(false),
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};

export function usePopup(): PopupContextState {
  return useContext(PopupContext);
}

export interface PopupProviderProps {
  children: ReactNode;
}
