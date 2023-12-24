import { Keypair } from '@solana/web3.js';
// import { Parameters } from '../contexts/ConfigProvider';
// import { InventoryItem, Mercurial, Role } from '../hooks/useConfig';
// import { EMAIL } from './constants';

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

// interface DataName {
//   json: string;
//   sheet: string;
// }

// const dataNames: { [key: string]: DataName } = {
//   dashboard: { json: 'parameters', sheet: 'Dashboard' },
//   paymentMethods: { json: 'paymentMethods', sheet: 'Historic' },
//   currencies: { json: 'currencies', sheet: '_Monnaies' },
//   products: { json: 'products', sheet: '_Produits' },
//   users: { json: 'users', sheet: 'Utilisateurs' },
// };

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

  let convert: (response: void | Response) => Promise<any>;
  switch (name) {
    case DataName.dashboard:
      convert = convertDashboardData;
      break;
    case DataName.historic:
      convert = convertHistoricData;
      break;
    case DataName.token:
      convert = convertTokenData;
      break;
    default:
      throw new Error('Unknown data name');
  }

  return (
    (isOutOfLocalHost
      ? await fetch(`./api/spreadsheet?sheetName=${name}&isRaw=true`)
          .catch((error) => {
            console.error(error);
          })
          .then(convert)
      : []) ?? []
  );

  //   const param = await fetchData(dataNames.parameters, id, false).then(
  //     convertParametersData
  //   );
  //   if (!param?.length) return;

  //   const users = await fetchData(dataNames.users, id, false)
  //     .then(convertUsersData)
  //     .catch(() => undefined); // That's fine if there is no user data
  //   const publicKey = users?.length ? getPublicKey() : undefined;
  //   const user = users?.length
  //     ? users.filter(({ key }) => key === publicKey).at(0)
  //     : { name: '', role: Role.cashier };
  //   if (!user || user.role === Role.none)
  //     throw new UserNotFoundError(param.at(1));

  //   const parameters: Parameters = {
  //     shopName: param.at(0) ?? '',
  //     shopEmail: param.at(1) ?? EMAIL,
  //     thanksMessage: param.at(2) ?? 'Merci de votre visite !',
  //     mercurial: (param.at(3) ?? Mercurial.none) as Mercurial,
  //     lastModified: param.at(4) ?? new Date('0').toLocaleString(),
  //     user: user
  //   };

  //   const paymentMethods = await fetchData(dataNames.paymentMethods, id).then(
  //     convertPaymentMethodsData
  //   );
  //   if (!paymentMethods?.length) return;

  //   const allCurrencies = await fetchData(dataNames.currencies, id).then(
  //     convertCurrenciesData
  //   );
  //   if (!allCurrencies?.length) return;

  //   const data = await fetchData(dataNames.products, id).then(
  //     convertProductsData
  //   );
  //   if (!data?.products?.length || !data?.currencies?.length) return;

  //   const currencies = data.currencies.map((item) => {
  //     const currency = allCurrencies.find(({ label }) => label === item);
  //     if (!currency) throw new Error('currency not found');
  //     return currency;
  //   });

  //   const inventory: InventoryItem[] = [];
  //   data.products.forEach((item) => {
  //     const category = inventory.find(
  //       ({ category }) => category === item.category
  //     );
  //     if (category) {
  //       category.products.push({
  //         label: item.label,
  //         prices: item.prices
  //       });
  //     } else {
  //       inventory.push({
  //         category: item.category,
  //         rate: item.rate,
  //         products: [
  //           {
  //             label: item.label,
  //             prices: item.prices
  //           }
  //         ]
  //       });
  //     }
  //   });

  //   return {
  //     parameters,
  //     currencies,
  //     paymentMethods,
  //     inventory
  //   };
}

// async function fetchData(dataName: DataName, id: string | undefined, isRaw = true) {
//   return await fetch(
//     id !== undefined
//       ? `./api/spreadsheet?sheetName=${dataName.sheet}&id=${id}&isRaw=${isRaw.toString()}`
//       : `./api/json?fileName=${dataName.json}`
//   ).catch((error) => {
//     console.error(error);
//   });
// }

function checkData(data: any, minCol: number, maxCol = minCol, minRow = 1, maxRow = 100000) {
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

async function convertDashboardData(response: void | Response) {
  if (typeof response === 'undefined') return;
  return await response.json().then((data: { values: string[][]; error: { message: string } }) => {
    checkData(data, 4);

    return data.values
      .filter((_, i) => i !== 0)
      .map((item) => {
        checkColumn(item, 4);
        return {
          label: String(item.at(0)).trim(),
          // sol: Number(item.at(1)), //not used
          value: Number(item.at(2)),
          ratio: Number(item.at(3)),
        };
      });
  });
}

async function convertTokenData(response: void | Response) {
  if (typeof response === 'undefined') return;
  return await response.json().then((data: { values: string[][]; error: { message: string } }) => {
    checkData(data, 9);

    return data.values
      .filter((_, i) => i !== 0)
      .filter((item) => item.at(0) !== '€' && item.at(0) !== 'SOL') // TODO : remove this line when Euro is removed from the spreadsheet
      .map((item) => {
        checkColumn(item, 4);
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
      });
  });
}

async function convertHistoricData(response: void | Response) {
  if (typeof response === 'undefined') return;
  return await response.json().then((data: { values: string[][]; error: { message: string } }) => {
    checkData(data, 12);

    return data.values
      .filter((_, i) => i !== 0)
      .map((item) => {
        checkColumn(item, 12);
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
      });
  });
}

function NormalizedString(value: any) {
  const label = String(value).trim();
  return label.charAt(0).toUpperCase() + label.slice(1);
}
