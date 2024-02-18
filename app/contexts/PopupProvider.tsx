'use client';

import { ReactNode, createContext, useContext, useState } from 'react';

export interface PopupContextState {
  isPopupOpen: boolean;
  openPopup: (popup: ReactNode, shouldCloseManually?: boolean) => void;
  closePopup: () => void;
  autoClosePopup: () => void;
  popup: ReactNode;
}

export const PopupContext = createContext<PopupContextState>({} as PopupContextState);

export const PopupProvider = ({ children }: { children: ReactNode }) => {
  const [popup, setPopup] = useState<ReactNode>();
  const [shouldCloseManually, setShouldCloseManually] = useState<boolean>();

  return (
    <PopupContext.Provider
      value={{
        isPopupOpen: !!popup,
        openPopup: (popup, shouldCloseManually) => {
          setPopup(popup);
          setShouldCloseManually(shouldCloseManually);
        },
        closePopup: () => setPopup(undefined),
        autoClosePopup: () => (!shouldCloseManually ? setPopup(undefined) : undefined),
        popup,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};

export function usePopup(): PopupContextState {
  return useContext(PopupContext);
}
