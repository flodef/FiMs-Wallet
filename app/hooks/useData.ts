'use client';

import { createContext, useContext } from 'react';
import { Data, MinMax } from '../utils/types';
import { User } from './useUser';
import { TokenData } from '../utils/processData';

export interface DashboardToken extends Data {
  yearlyYield: number;
  duration: number;
  volatility: number;
  description: string;
  inceptionPrice: number;
}

export interface PortfolioToken extends Data {
  symbol: string;
  address: string;
  duration: number;
  volatility: number;
  description: string;
  inceptionPrice: number;
}

export interface Token extends TokenData {
  image: string;
  balance: number;
  value: number;
  total: number;
  movement: number;
  profit: number;
  transactions: Transaction[];
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

export interface Portfolio {
  id: number;
  address: string;
  token: number[];
  total: number;
  invested: number;
  profitValue: number;
  profitRatio: number;
  yearlyYield: number;
  transferCost: number;
}

export interface UserHistoric {
  date: number;
  stringDate: string;
  Investi: number;
  Total: number;
}

export enum TransactionType {
  deposit = 'deposit',
  withdrawal = 'withdrawal',
  donation = 'donation',
  payment = 'payment',
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

export interface Price {
  date: string;
  prices: (number | string)[];
}

export interface DataContextState {
  // Dashboard data
  dashboard: Data[];
  tokens: DashboardToken[];
  historic: Historic[];
  tokenHistoric: TokenHistoric[][];
  tokenHistoricLimit: MinMax | undefined;
  setDashboard: (data: Data[]) => void;
  setTokens: (data: DashboardToken[]) => void;
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

  // Token
  prices: Price[] | undefined;
  setPrices: (data: Price[] | undefined) => void;
}

export const DataContext = createContext<DataContextState>({} as DataContextState);

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
}
