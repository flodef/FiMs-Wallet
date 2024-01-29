import { Keypair } from '@solana/web3.js';

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
    super(`user not found: ${email}`, { cause: email });
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

// Set a value that return all parameters needed to process data (convertFunction, hasFilter, minColInRow, minColInHeader)
const dataNameParameters = new Map<
  DataName,
  { convert: (item: string[]) => any; hasHeader: boolean; range: string; minColInRow?: number }
>([
  [DataName.dashboard, { convert: convertDashboardData, hasHeader: true, range: 'A:D' }],
  [DataName.historic, { convert: convertHistoricData, hasHeader: false, range: 'A:L' }],
  [DataName.token, { convert: convertTokenData, hasHeader: true, range: 'A:I', minColInRow: 4 }],
  [DataName.portfolio, { convert: convertPortfolioData, hasHeader: true, range: 'A:M' }],
  [DataName.userHistoric, { convert: convertUserHistoricData, hasHeader: true, range: 'A:I' }],
  [DataName.transactions, { convert: convertTransactionsData, hasHeader: true, range: 'A:D' }],
]);

const dataCache = new Map<DataName, { data: any[]; expire: number }>();

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

export async function loadData(name: DataName | string, isOutOfLocalHost = true) {
  if (isOutOfLocalHost && !navigator.onLine) throw new Error('The web app is offline');

  const dataName = Object.values(DataName).includes(name as DataName) ? (name as DataName) : DataName.userHistoric;

  const parameters = dataNameParameters.get(dataName);
  if (!parameters) throw new Error('data name not found');

  const cache = dataCache.get(dataName);
  if (cache && cache.expire > Date.now()) return cache.data;

  const numberOfColumns = getNumberOfColumns(parameters.range);

  const data =
    (isOutOfLocalHost
      ? await fetch(`./api/spreadsheet?sheetName=${name}&range=${parameters.range}&isRaw=true`)
          .then(async (response) => {
            if (typeof response === 'undefined') return;
            return await response
              .json()
              .then((data: { values: string[][]; error: string }) => {
                checkData(data, numberOfColumns);

                return data.values
                  .filter((_, i) => (parameters.hasHeader ? i !== 0 : true))
                  .map((item) => {
                    checkColumn(item, parameters.minColInRow ?? numberOfColumns);
                    return parameters.convert(item);
                  });
              })
              .catch((error) => {
                if (error instanceof WrongDataPatternError) {
                  console.error(error);
                  return [];
                }
                throw error;
              });
          })
          .catch((error) => {
            console.error(error);
          })
      : []) ?? [];

  dataCache.set(dataName, { data: data, expire: Date.now() + 1000 * 60 });

  return data;
}

function checkData(data: any, minCol: number, maxCol = minCol, minRow = 1, maxRow = 100000) {
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

function checkColumn(item: any[], minCol: number) {
  if (item.length < minCol) throw new WrongDataPatternError();
}

function convertDashboardData(item: string[]) {
  return {
    label: String(item.at(0)).trim(),
    // sol: Number(item.at(1)), //not used
    value: Number(item.at(2)),
    ratio: Number(item.at(3)),
  };
}

function convertTokenData(item: string[]) {
  return {
    symbol: String(item.at(0)).trim(), // token symbol
    label: String(item.at(1)).trim(), // token name
    value: Number(item.at(2)),
    // mintAddress: String(item.at(3)).trim(), //not used
    // available: Number(item.at(4)), //not used
    // yearlyYield: Number(item.at(5)),  //not used
    ratio: Number(item.at(6)), // inception yield
    // inceptionPrice: Number(item.at(7)), //not used
    duration: Number(item.at(8)),
  };
}

function convertHistoricData(item: string[]) {
  return {
    date: Number(item.at(0)),
    stringDate: Number(item.at(0)).toLocaleDate(),
    Investi: Number(item.at(1)),
    // transferCost: Number(item.at(2)), //not used
    // strategyCost: Number(item.at(3)), //not used
    // priceChange: Number(item.at(4)), //not used
    Trésorerie: Number(item.at(5)),
    // boughtPrice: Number(item.at(6)), //not used
    // price: Number(item.at(7)), //not used
    // profit: Number(item.at(8)), //not used
    // profitRate: Number(item.at(9)), //not used
    // progress: Number(item.at(10)), //not used
    // ratio: Number(item.at(11)), //not used
  };
}

function convertPortfolioData(item: string[]) {
  return {
    name: String(item.at(1)).trim(),
    address: String(item.at(2)).trim(),
    // isPublic: String(item.at(3)).trim() === 'true', // not used
    token: [Number(item.at(4)), Number(item.at(5)), Number(item.at(6))],
    total: Number(item.at(7)),
    invested: Number(item.at(8)),
    profitValue: Number(item.at(9)),
    profitRatio: Number(item.at(10)),
    yearlyYield: Number(item.at(11)),
    solProfitPrice: Number(item.at(12)),
  };
}

function convertUserHistoricData(item: string[]) {
  return {
    date: Number(item.at(0)),
    stringDate: Number(item.at(0)).toLocaleDate(),
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

function convertTransactionsData(item: string[]) {
  return {
    date: item.at(0),
    stringDate: Number(item.at(0)).toLocaleDate(),
    user: String(item.at(1)).trim(),
    movement: Number(item.at(2)),
    cost: Number(item.at(3)),
  };
}
