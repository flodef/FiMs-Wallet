'use client';

import { ReactNode, createContext, useContext } from 'react';
import { useLocalStorage } from '../utils/localStorage';

interface PrivacyContextState {
  hasPrivacy: boolean;
  setHasPrivacy: (hasPrivacy: boolean) => void;
}

const PrivacyContext = createContext<PrivacyContextState>({} as PrivacyContextState);

export const PrivacyProvider = ({ children }: { children: ReactNode }) => {
  const [hasPrivacy, setHasPrivacy] = useLocalStorage('hasPrivacy', false);

  return (
    <PrivacyContext.Provider
      value={{ hasPrivacy: hasPrivacy, setHasPrivacy: (hasPrivacy: boolean) => setHasPrivacy(hasPrivacy) }}
    >
      {children}
    </PrivacyContext.Provider>
  );
};

export function usePrivacy(): PrivacyContextState {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
}
