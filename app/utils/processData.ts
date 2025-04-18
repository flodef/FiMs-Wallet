import {
  DashboardToken,
  Historic,
  Portfolio,
  PortfolioToken,
  Price,
  Transaction,
  UserHistoric,
} from '../hooks/useData';
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
  tokens = 'Tokens',
  portfolio = 'Portfolio',
  userHistoric = 'UserHistoric',
  transactions = 'Transactions',
  price = 'Price',
}

type extractedData = { values: string[][]; error: string };
export type TokenData = DashboardToken & PortfolioToken;
export type PortfolioData = Portfolio & DBUser;
export type convertedData = Data | TokenData | Historic | PortfolioData | UserHistoric | Transaction | Price;

// Set a value that return all parameters needed to process data (convertFunction, hasFilter, minColInRow, minColInHeader)
type Parameter = {
  convert: (item: string[]) => convertedData;
  range: string;
  isHeaderLess?: boolean;
  minColInRow?: number;
};
const dataNameParameters = new Map<DataName, Parameter>([
  [DataName.dashboard, { convert: convertDashboardData, range: 'A:C' }],
  [DataName.historic, { convert: convertHistoricData, range: 'A:D' }],
  [DataName.tokens, { convert: convertTokenData, range: 'A:J' }],
  [DataName.portfolio, { convert: convertPortfolioData, range: 'A:O' }],
  [DataName.userHistoric, { convert: convertUserHistoricData, range: 'A:I' }],
  [DataName.transactions, { convert: convertTransactionsData, range: 'A:H' }],
  [DataName.price, { convert: convertPriceData, range: 'A1:R368', isHeaderLess: true }],
]);

const dataCache = new Map<DataName, { data: convertedData[]; expire: number }>();

function getNumberOfColumns(range: string): number {
  const [start, end] = range.split(':').map(columnNameToNumber);
  return end - start + 1;
}

function columnNameToNumber(columnName: string): number {
  const letters = columnName.replace(/[0-9]/g, ''); // Remove any digits from the column name
  let number = 0;
  for (let i = 0; i < letters.length; i++) {
    number = number * 26 + (letters.charCodeAt(i) - 64);
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
      .then(result => result.ok && result.json())
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
    value: Number(item.at(1)),
    ratio: Number(item.at(2)),
  };
}

function convertTokenData(item: string[]): TokenData {
  return {
    symbol: String(item.at(0)).trim(), // token symbol
    label: String(item.at(1)).trim(), // token name
    address: String(item.at(2)).trim(),
    value: Number(item.at(3)),
    yearlyYield: Number(item.at(4)), //yearly yield
    ratio: Number(item.at(5)), // inception yield
    inceptionPrice: Number(item.at(6)),
    duration: Number(item.at(7)),
    volatility: Number(item.at(8)),
    description: String(item.at(9)),
  };
}

function convertHistoricData(item: string[]): Historic {
  return {
    date: Number(item.at(0)),
    stringDate: Number(item.at(0)).toLocaleDateString(),
    Investi: Number(item.at(1)), // TO FIX: Should have the translated term already
    // Gains: Number(item.at(2)), // not used
    Trésorerie: Number(item.at(3)), // TO FIX: Should have the translated term already
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
    transferCost: Number(item.at(12)),
    duration: Number(item.at(13)),
    donated: Number(item.at(14)),
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

function convertPriceData(item: string[]): Price {
  const isHeader = item.at(0) === 'Date';
  const date = isHeader ? new Date(0) : new Date((Number(item.at(0)) - 25569) * 86400 * 1000);
  return {
    date,
    stringDate: date.toLocaleDateString(),
    prices: item.slice(1).map(price => (isHeader ? String(price).trim() : Number(price))),
  };
}
