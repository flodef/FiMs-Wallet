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
}

export function getPublicKey() {
  let publicKey = localStorage.getItem('PublicKey');
  if (!publicKey) {
    publicKey = Keypair.generate().publicKey.toString();
    localStorage.setItem('PublicKey', publicKey);
  }
  return publicKey;
}

export async function loadData(name: DataName, isOutOfLocalHost = true) {
  if (isOutOfLocalHost && !navigator.onLine) throw new Error('The web app is offline');

  let process: () => Promise<any>;
  switch (name) {
    case DataName.dashboard:
      process = () => processData(convertDashboardData, DataName.dashboard, true, 4, 4);
      break;
    case DataName.historic:
      process = () => processData(convertHistoricData, DataName.historic, true, 12, 12);
      break;
    case DataName.token:
      process = () => processData(convertTokenData, DataName.token, true, 4, 9);
      break;
    default:
      throw new Error('Unknown data name');
  }

  return (isOutOfLocalHost ? await process() : []) ?? [];
}

function checkData(data: any, minCol: number, maxCol: number, minRow: number, maxRow: number) {
  if (!data) throw new Error('data not fetched');
  if (data.error?.message) throw new Error(data.error.message);
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

async function processData(
  convert: (item: string[]) => any,
  name: DataName,
  hasHeader = true,
  minColInRow = 1,
  minColInHeader = 1,
  maxColInHeader = minColInHeader,
  minRow = 1,
  maxRow = 100000
) {
  return await fetch(`./api/spreadsheet?sheetName=${name}&isRaw=true`)
    .then(async (response) => {
      if (typeof response === 'undefined') return;
      return await response
        .json()
        .then((data: { values: string[][]; error: { message: string } }) => {
          checkData(data, minColInHeader, maxColInHeader, minRow, maxRow);

          return data.values
            .filter((_, i) => (hasHeader ? i !== 0 : true))
            .map((item) => {
              checkColumn(item, minColInRow);
              return convert(item);
            });
        })
        .catch((error) => {
          console.error(error);

          if (error instanceof WrongDataPatternError) {
            return [];
          }
          throw error;
        });
    })
    .catch((error) => {
      console.error(error);
    });
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
    // token: String(item.at(0)).trim(), //not used
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
    stringDate: new Date(Math.round((Number(item.at(0)) - 25569) * 86400 * 1000)).toLocaleDateString(),
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
