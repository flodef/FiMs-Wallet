import { Keypair } from '@solana/web3.js';
import { DashboardToken, Historic, Portfolio, PortfolioToken, Transaction, UserHistoric } from '../hooks/useData';
import { DBUser } from '../pages/users';
import { Data } from './types';

class MissingDataError extends Error {
  name = 'MissingDataError';
  message = 'missing data';
}

class WrongDataPatternError extends Error {
  name = 'WrongDataPatternError';
  message = 'wrong data pattern';
}

export class UserNotFoundError extends Error {
  name = 'UserNotFoundError';
  message = 'user not found';
  constructor(email: string | undefined) {
    super(`user not found: ${email}`);
  }
}

export enum DataName {
  dashboard = 'Dashboard',
  historic = 'Historic',
  token = 'Token',
  portfolio = 'Portfolio',
  userHistoric = 'UserHistoric',
  transactions = 'Transactions',
}

type extractedData = { values: string[][]; error: string };
export type TokenData = DashboardToken & PortfolioToken;
export type PortfolioData = Portfolio & DBUser;
export type convertedData = Data | TokenData | Historic | PortfolioData | UserHistoric | Transaction;

// Set a value that return all parameters needed to process data (convertFunction, hasFilter, minColInRow, minColInHeader)
type Parameter = {
  convert: (item: string[]) => convertedData;
  range: string;
  isHeaderLess?: boolean;
  minColInRow?: number;
};
const dataNameParameters = new Map<DataName, Parameter>([
  [DataName.dashboard, { convert: convertDashboardData, range: 'A:D' }],
  [DataName.historic, { convert: convertHistoricData, range: 'A:C' }],
  [DataName.token, { convert: convertTokenData, range: 'A:I', minColInRow: 4 }],
  [DataName.portfolio, { convert: convertPortfolioData, range: 'A:L' }],
  [DataName.userHistoric, { convert: convertUserHistoricData, range: 'A:I' }],
  [DataName.transactions, { convert: convertTransactionsData, range: 'A:H' }],
]);

const dataCache = new Map<DataName, { data: convertedData[]; expire: number }>();

export function getPublicKey() {
  let publicKey = localStorage.getItem('PublicKey');
  if (!publicKey) {
    publicKey = Keypair.generate().publicKey.toString();
    localStorage.setItem('PublicKey', publicKey);
  }
  return publicKey;
}

function getNumberOfColumns(range: string): number {
  const [start, end] = range.split(':').map(columnNameToNumber);
  return end - start + 1;
}

function columnNameToNumber(columnName: string): number {
  let number = 0;
  for (let i = 0; i < columnName.length; i++) {
    number = number * 26 + (columnName.charCodeAt(i) - 64);
  }
  return number;
}

export async function loadData(name: DataName | string) {
  if (!navigator.onLine) throw new Error('The web app is offline');

  const dataName = Object.values(DataName).includes(name as DataName) ? (name as DataName) : DataName.userHistoric;

  const parameter = dataNameParameters.get(dataName);
  if (!parameter) throw new Error('data name not found');

  const cache = dataCache.get(dataName);
  let data = cache?.data;
  if (!cache?.data.length) {
    data = await cacheData(name, dataName, parameter); // If the data is not in the cache, fetch it synchronously and wait for the cache to be updated
  } else if (cache.expire < Date.now()) {
    cacheData(name, dataName, parameter); // If the data is expired, fetch it again asynchronously and update the cache
  }

  if (!data) throw new Error('data not loaded');

  return data;
}

export async function forceData(name: DataName | string) {
  let data: convertedData[] = [];
  while (!data.length) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    data = await loadData(name);
  }
  return data;
}

export function clearData() {
  [DataName.userHistoric].forEach(name => {
    dataCache.set(name, { data: [], expire: 0 });
  });
}

async function cacheData(sheetName: string, dataName: DataName, parameter: Parameter) {
  const numberOfColumns = getNumberOfColumns(parameter.range);

  const data =
    (await fetch(`./api/spreadsheet?sheetName=${sheetName}&range=${parameter.range}&isRaw=true`)
      .then(result => (result.ok ? result.json() : undefined))
      .then((data: extractedData) => {
        checkData(data, numberOfColumns);

        return data.values
          .filter((_, i) => (parameter.isHeaderLess ? true : i !== 0))
          .map(item => {
            checkColumn(item, parameter.minColInRow ?? numberOfColumns);
            return parameter.convert(item);
          });
      })
      .catch(error => {
        console.error(error);
        if (error instanceof WrongDataPatternError) {
          return;
        }
      })) ?? [];

  dataCache.set(dataName, { data: data, expire: Date.now() + 1000 * 60 });

  return data;
}

function checkData(data: extractedData, minCol: number, maxCol = minCol, minRow = 1, maxRow = 100000) {
  if (!data) throw new Error('data not fetched');
  if (data.error) throw new Error(data.error);
  if (!data.values?.length) throw new MissingDataError();
  if (
    data.values &&
    (data.values.length < minRow ||
      data.values.length > maxRow ||
      data.values[0].length < minCol ||
      data.values[0].length > maxCol)
  )
    throw new WrongDataPatternError();
}

function checkColumn(item: string[], minCol: number) {
  if (item.length < minCol) throw new WrongDataPatternError();
}

function convertDashboardData(item: string[]): Data {
  return {
    label: String(item.at(0)).trim(),
    // sol: Number(item.at(1)), //not used
    value: Number(item.at(2)),
    ratio: Number(item.at(3)),
  };
}

function convertTokenData(item: string[]): TokenData {
  return {
    symbol: String(item.at(0)).trim(), // token symbol
    label: String(item.at(1)).trim(), // token name
    // mintAddress: String(item.at(2)).trim(), //not used
    value: Number(item.at(3)),
    available: Number(item.at(4)),
    yearlyYield: Number(item.at(5)), //yearly yield
    ratio: Number(item.at(6)), // inception yield
    // inceptionPrice: Number(item.at(7)), //not used
    duration: Number(item.at(8)),
  };
}

function convertHistoricData(item: string[]): Historic {
  return {
    date: Number(item.at(0)),
    stringDate: Number(item.at(0)).toLocaleDateString(),
    Trésorerie: Number(item.at(1)), // TO FIX: Should have the translated term already
    Investi: Number(item.at(2)), // TO FIX: Should have the translated term already
  };
}

function convertPortfolioData(item: string[]): PortfolioData {
  return {
    id: Number(item.at(0)),
    name: String(item.at(1)).trim(),
    address: String(item.at(2)).trim(),
    ispublic: String(item.at(3)).trim() === 'true',
    token: [Number(item.at(4)), Number(item.at(5)), Number(item.at(6))],
    total: Number(item.at(7)),
    invested: Number(item.at(8)),
    profitValue: Number(item.at(9)),
    profitRatio: Number(item.at(10)),
    yearlyYield: Number(item.at(11)),
    solProfitPrice: Number(item.at(12)),
  };
}

function convertUserHistoricData(item: string[]): UserHistoric {
  return {
    date: Number(item.at(0)),
    stringDate: Number(item.at(0)).toLocaleDateString(),
    // movement: Number(item.at(1)), // not used
    Investi: Number(item.at(2)),
    // monthlyRate: Number(item.at(3)), //not used
    // averageRate: Number(item.at(4)), //not used
    // yearlyRate: Number(item.at(5)), //not used
    // monthlyGain: Number(item.at(6)), //not used
    // totalGain: Number(item.at(7)), //not used
    Total: Number(item.at(8)),
  };
}

function convertTransactionsData(item: string[]): Transaction {
  return {
    id: Number(item.at(0)),
    date: new Date(String(item.at(1)).trim()),
    userid: Number(item.at(2)),
    address: String(item.at(3)).trim(),
    movement: Number(item.at(4)),
    cost: Number(item.at(5)),
    token: String(item.at(6)).trim(),
    amount: Number(item.at(7)),
  };
}
