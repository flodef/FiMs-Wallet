'use client';

import { ReactNode, createContext, useContext, useState } from 'react';

export interface PopupContextState {
  isPopupOpen: boolean;
  openPopup: () => void;
  closePopup: () => void;
}

export const PopupContext = createContext<PopupContextState>({} as PopupContextState);

export const PopupProvider = ({ children }: { children: ReactNode }) => {
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
