'use client';

import { FC, ReactNode, createContext, useContext, useState } from 'react';

interface LoadingContextState {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextState>({} as LoadingContextState);

export const LoadingProvider: FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider
      value={{
        isLoading: isLoading,
        startLoading: () => setIsLoading(true),
        stopLoading: () => setIsLoading(false),
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export function useLoading(): LoadingContextState {
  //   const context = useContext(LoadingContext);
  //   if (!context) {
  //     throw new Error('useLoading must be used within a LoadingProvider');
  //   }
  //   return context;
  return useContext(LoadingContext);
}

export interface LoadingProviderProps {
  children: ReactNode;
}
