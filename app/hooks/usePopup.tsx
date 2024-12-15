'use client';

import { ReactNode, createContext, useContext, useState } from 'react';

export interface PopupContextState {
  isPopupOpen: boolean;
  openPopup: (popup: ReactNode, hasTextInput?: boolean, shouldCloseManually?: boolean) => void;
  closePopup: () => void;
  autoClosePopup: () => void;
  popupContent: ReactNode;
  hasTextInput: boolean;
}

export const PopupContext = createContext<PopupContextState>({} as PopupContextState);

export const PopupProvider = ({ children }: { children: ReactNode }) => {
  const [popupContent, setPopupContent] = useState<ReactNode>();
  const [shouldCloseManually, setShouldCloseManually] = useState<boolean>();
  const [hasTextInput, setHasTextInput] = useState<boolean>(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <PopupContext.Provider
      value={{
        isPopupOpen,
        openPopup: (popupContent, hasTextInput = false, shouldCloseManually = false) => {
          setIsPopupOpen(true);
          setPopupContent(popupContent);
          setHasTextInput(hasTextInput);
          setShouldCloseManually(shouldCloseManually);
        },
        closePopup: () => setIsPopupOpen(false),
        autoClosePopup: () => (!shouldCloseManually ? setIsPopupOpen(false) : undefined),
        popupContent,
        hasTextInput,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};

export function usePopup(): PopupContextState {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
}
