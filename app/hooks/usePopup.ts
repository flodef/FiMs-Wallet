import { ReactNode, createContext, useContext } from 'react';

export interface PopupContextState {
  isPopupOpen: boolean;
  openPopup: () => void;
  closePopup: () => void;
}

export const PopupContext = createContext<PopupContextState>({} as PopupContextState);

export function usePopup(): PopupContextState {
  return useContext(PopupContext);
}
