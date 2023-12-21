import { ReactNode, createContext, useContext } from 'react';

export interface PopupContextState {
  isPopupOpen: boolean;
  openPopup: (content: ReactNode) => void;
  closePopup: () => void;
  popupContent: ReactNode;
}

export const PopupContext = createContext<PopupContextState>({} as PopupContextState);

export function usePopup(): PopupContextState {
  return useContext(PopupContext);
}
