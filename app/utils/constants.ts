import { PublicKey, clusterApiUrl } from '@solana/web3.js';
import { SyntheticEvent } from 'react';

export const handleEvent = (event: SyntheticEvent) => {
  if (event instanceof KeyboardEvent) {
    const keyEvent = event as KeyboardEvent;
    if (keyEvent.key !== 'Enter') return false;
    keyEvent.preventDefault();
  }
  return true;
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
export const TOKEN_PATH = 'https://raw.githubusercontent.com/flodef/FiMs-Token/main/';
export const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
export const IS_DEV = process.env.NEXT_PUBLIC_IS_DEV === 'true';
export const SPL_TOKEN = new PublicKey(
  IS_DEV ? 'J99D2TvHcev22FF8rNfdUXQx31qzuoVdXRpRiPzJCH6c' : 'Pnsjp9dbenPeFZWqqPHDygzkCZ4Gr37G8mgdRK2KjQp',
);
export const ENDPOINT = IS_DEV
  ? clusterApiUrl('devnet')
  : process.env.NEXT_PUBLIC_CLUSTER_ENDPOINT || 'https://solana-mainnet.rpc.extrnode.com';
export const getShortAddress = (address: string) => address.slice(0, 4) + '...' + address.slice(-4);
