'use client';

import { ReactNode, useState } from 'react';
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
import { User } from '../hooks/useUser';
import { Data, MinMax } from '../utils/types';

export function DataProvider({ children }: { children: ReactNode }) {
  // Dashboard
  const [dashboard, setDashboard] = useState<Data[]>([]);
  const [tokens, setTokens] = useState<DashboardToken[]>([]);
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
        tokens,
        historic,
        tokenHistoric,
        tokenHistoricLimit,
        setDashboard,
        setTokens,
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
