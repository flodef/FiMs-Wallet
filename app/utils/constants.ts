import { PublicKey, clusterApiUrl } from '@solana/web3.js';
import { SyntheticEvent } from 'react';
import { Data } from './types';
import { DeltaType } from '@tremor/react';

export const handleEvent = (event: SyntheticEvent) => {
  if (event instanceof KeyboardEvent) {
    if (event.key !== 'Enter') return false;
    event.preventDefault();
  }
  return true;
};

export const findValue = (data: Data[], label: string | undefined) => {
  return label ? data.find(d => d.label.toLowerCase().includes(label.toLowerCase())) : undefined;
};
export const getCurrency = (data: Data[], label: string | undefined, defaultValue = 0) => {
  return (findValue(data, label)?.value ?? defaultValue).toLocaleCurrency();
};
export const getRatio = (data: Data[], label: string | undefined, defaultValue = 0) => {
  return (findValue(data, label)?.ratio ?? defaultValue).toRatio();
};
export const getDeltaType = (ratio: number | string | undefined) => {
  const r = parseFloat(String(ratio ?? 0));
  const decrease = r < 10 ? 'decrease' : 'moderateDecrease';
  const increase = r > 10 ? 'increase' : 'moderateIncrease';
  const delta = r > 0 ? increase : decrease;
  return (r ? delta : 'unchanged') as DeltaType;
};

export const getFormattedDate = (date = new Date(), precision = 3) =>
  !isNaN(date.getTime())
    ? date.getFullYear() +
      (precision > 1 ? '-' + ('0' + (date.getMonth() + 1)).slice(-2) : '') +
      (precision > 2 ? '-' + ('0' + date.getDate()).slice(-2) : '')
    : '';
export const cls = (...classes: string[]) => classes.filter(Boolean).join(' ');

// UI
export const EMAIL = 'flo@fims.fi';
export const TRANSACTION_TIME_OUT = 60; // Time out in seconds
export const IS_LOCAL = !process.env.NEXT_PUBLIC_VERCEL_ENV;

// Solana
export const FIMS_TOKEN_PATH = 'https://raw.githubusercontent.com/flodef/FiMs-Token/main/';
export const SPL_TOKEN_PATH = 'https://raw.githubusercontent.com/sonarwatch/token-lists/main/images/solana/';
export const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
export const IS_DEV = process.env.NEXT_PUBLIC_IS_DEV === 'true';
export const SPL_TOKEN = new PublicKey(
  IS_DEV ? 'J99D2TvHcev22FF8rNfdUXQx31qzuoVdXRpRiPzJCH6c' : 'Pnsjp9dbenPeFZWqqPHDygzkCZ4Gr37G8mgdRK2KjQp',
);
export const ENDPOINT = IS_DEV
  ? clusterApiUrl('devnet')
  : process.env.NEXT_PUBLIC_CLUSTER_ENDPOINT || 'https://solana-mainnet.rpc.extrnode.com';
export const getShortAddress = (address: string) => address.slice(0, 4) + '...' + address.slice(-4);
