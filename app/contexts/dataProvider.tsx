'use client';

import React, { createContext, ReactNode, useContext, useState } from 'react';
import { User } from '../hooks/useUser';
import { Data, MinMax } from '../utils/types';

export interface DashboardToken extends Data {
  available: number;
  duration: number;
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

interface Token {
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
  swap,
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
}

interface DataContextType {
  // Dashboard data
  dashboard: Data[];
  token: DashboardToken[];
  historic: Historic[];
  tokenHistoric: TokenHistoric[][];
  tokenHistoricLimit: MinMax | undefined;

  setDashboard: React.Dispatch<React.SetStateAction<Data[]>>;
  setToken: React.Dispatch<React.SetStateAction<DashboardToken[]>>;
  setHistoric: React.Dispatch<React.SetStateAction<Historic[]>>;
  setTokenHistoric: React.Dispatch<React.SetStateAction<TokenHistoric[][]>>;
  setTokenHistoricLimit: React.Dispatch<React.SetStateAction<MinMax | undefined>>;

  // Portfolio data
  wallet: Token[] | undefined;
  setWallet: React.Dispatch<React.SetStateAction<Token[] | undefined>>;
  portfolio: Portfolio | undefined;
  setPortfolio: React.Dispatch<React.SetStateAction<Portfolio | undefined>>;
  userHistoric: UserHistoric[];
  setUserHistoric: React.Dispatch<React.SetStateAction<UserHistoric[]>>;

  // Transactions data
  transactions: Transaction[] | undefined;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[] | undefined>>;

  // Users data
  users: User[] | undefined;
  setUsers: React.Dispatch<React.SetStateAction<User[] | undefined>>;
  isPublic: boolean | undefined;
  setIsPublic: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  // Dashboard
  const [dashboard, setDashboard] = useState<Data[]>([]);
  const [token, setToken] = useState<DashboardToken[]>([]);
  const [historic, setHistoric] = useState<Historic[]>([]);
  const [tokenHistoric, setTokenHistoric] = useState<TokenHistoric[][]>([]);
  const [tokenHistoricLimit, setTokenHistoricLimit] = useState<MinMax>();

  // Portfolio
  const [wallet, setWallet] = useState<Token[]>();
  const [portfolio, setPortfolio] = useState<Portfolio>();
  const [userHistoric, setUserHistoric] = useState<UserHistoric[]>([]);

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>();

  // Users
  const [users, setUsers] = useState<User[]>();
  const [isPublic, setIsPublic] = useState<boolean>();

  return (
    <DataContext.Provider
      value={{
        // Dashboard data
        dashboard,
        token,
        historic,
        tokenHistoric,
        tokenHistoricLimit,
        setDashboard,
        setToken,
        setHistoric,
        setTokenHistoric,
        setTokenHistoricLimit,

        // Portfolio data
        wallet,
        setWallet,
        portfolio,
        setPortfolio,
        userHistoric,
        setUserHistoric,

        // Transactions data
        transactions,
        setTransactions,

        // Users data
        users,
        setUsers,
        isPublic,
        setIsPublic,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
}
