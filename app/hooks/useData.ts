'use client';

import { createContext, useContext } from 'react';
import { Data, MinMax } from '../utils/types';
import { User } from './useUser';

export interface DashboardToken extends Data {
  available: number;
  duration: number;
  yearlyYield: number;
}

export interface Historic {
  date: number;
  stringDate: string;
  Investi: number;
  Trésorerie: number;
}

export interface TokenHistoric {
  date: string;
  Montant: number;
}

export interface PortfolioToken extends Data {
  symbol: string;
  address: string;
}

export interface Portfolio {
  id: number;
  address: string;
  token: number[];
  total: number;
  invested: number;
  profitValue: number;
  profitRatio: number;
  yearlyYield: number;
  solProfitPrice: number;
}

export interface Token {
  image: string;
  name: string;
  symbol: string;
  balance: number;
  value: number;
  total: number;
}

export interface UserHistoric {
  date: number;
  stringDate: string;
  Investi: number;
  Total: number;
}

export enum TransactionType {
  deposit,
  withdrawal,
  donation,
  payment,
}

export interface Transaction {
  [key: string]: string | number | Date | TransactionType | undefined;
  id?: number;
  date: Date;
  address: string;
  movement: number;
  cost: number;
  userid?: number;
  type?: TransactionType;
  token: string;
  amount?: number;
  rate?: number | string;
  price?: number;
  profit?: number;
}

export interface DataContextState {
  // Dashboard data
  dashboard: Data[];
  token: DashboardToken[];
  historic: Historic[];
  tokenHistoric: TokenHistoric[][];
  tokenHistoricLimit: MinMax | undefined;
  setDashboard: (data: Data[]) => void;
  setToken: (data: DashboardToken[]) => void;
  setHistoric: (data: Historic[]) => void;
  setTokenHistoric: (data: TokenHistoric[][]) => void;
  setTokenHistoricLimit: (data: MinMax | undefined) => void;

  // Portfolio data
  wallet: Token[] | undefined;
  setWallet: (data: Token[] | undefined) => void;
  portfolio: Portfolio | undefined;
  setPortfolio: (data: Portfolio | undefined) => void;
  userHistoric: UserHistoric[];
  setUserHistoric: (data: UserHistoric[]) => void;

  // Transaction data
  transactions: Transaction[] | undefined;
  setTransactions: (data: Transaction[] | undefined) => void;

  // User data
  users: User[] | undefined;
  setUsers: (data: User[] | undefined) => void;

  // Public mode
  isPublic: boolean | undefined;
  setIsPublic: (isPublic: boolean | undefined) => void;
}

export const DataContext = createContext<DataContextState>({} as DataContextState);

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
}
