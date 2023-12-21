import { ReactNode, createContext, useContext } from 'react';

export interface PopupContextState {
  isPopupOpen: boolean;
  openPopup: (content: ReactNode, hasTextInput?: boolean) => void;
  closePopup: () => void;
  popupContent: ReactNode;
  hasTextInput: boolean;
}

export const PopupContext = createContext<PopupContextState>({} as PopupContextState);

export function usePopup(): PopupContextState {
  return useContext(PopupContext);
}
