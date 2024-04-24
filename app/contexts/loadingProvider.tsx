'use client';

import { ReactNode, createContext, useContext, useMemo, useState } from 'react';

interface LoadingContextState {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextState>({} as LoadingContextState);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const contextValue = useMemo(
    () => ({
      isLoading,
      startLoading: () => setIsLoading(true),
      stopLoading: () => setIsLoading(false),
    }),
    [isLoading, setIsLoading],
  );

  return <LoadingContext.Provider value={contextValue}>{children}</LoadingContext.Provider>;
};

export function useLoading(): LoadingContextState {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
