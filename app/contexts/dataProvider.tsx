'use client';

import { ReactNode, useContext, useState } from 'react';
import { User } from '../hooks/useUser';
import { Data, MinMax } from '../utils/types';
import {
  DashboardToken,
  DataContext,
  Historic,
  Portfolio,
  Token,
  TokenHistoric,
  Transaction,
  UserHistoric,
} from '../hooks/useData';

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
