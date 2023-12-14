import { PublicKey, clusterApiUrl } from '@solana/web3.js';

// UI
export const EMAIL = 'flo@fims.fi';
export const TRANSACTION_TIME_OUT = 60; // Time out in seconds
export const IS_LOCAL = !process.env.NEXT_PUBLIC_VERCEL_ENV;
/**
 * Formats a date object into a string representation in the format "YYYY-MM-DD" based on the precision value.
 * @param date - The date object to be formatted. If not provided, the current date is used.
 * @param precision - An integer value indicating the level of precision in the formatted date. The default value is 3.
 * @returns A formatted string representing the date in the format "YYYY-MM-DD" based on the precision value.
 */
export const GET_FORMATTED_DATE = (date = new Date(), precision = 3) =>
  !isNaN(date.getTime())
    ? date.getFullYear() +
      (precision > 1 ? '-' + ('0' + (date.getMonth() + 1)).slice(-2) : '') +
      (precision > 2 ? '-' + ('0' + date.getDate()).slice(-2) : '')
    : '';

// Solana
export const MEMO_PROGRAM_ID = new PublicKey(
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
);
export const IS_DEV = process.env.NEXT_PUBLIC_IS_DEV === 'true';
export const SPL_TOKEN = new PublicKey(
  IS_DEV
    ? 'J99D2TvHcev22FF8rNfdUXQx31qzuoVdXRpRiPzJCH6c'
    : 'Pnsjp9dbenPeFZWqqPHDygzkCZ4Gr37G8mgdRK2KjQp'
);
export const ENDPOINT = IS_DEV
  ? clusterApiUrl('devnet')
  : process.env.NEXT_PUBLIC_CLUSTER_ENDPOINT ||
    'https://solana-mainnet.rpc.extrnode.com';
