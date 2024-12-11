import { collection, getDocs, query, where } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import { init } from '../../init';
import { Dataset } from '../../../../utils/types';

const usersOrder = ['id', 'name', 'address', 'isPublic', 'isPro'];
const transactionsOrder = ['id', 'date', 'userId', 'address', 'movement', 'cost', 'token', 'amount'];

// Function to process the data retrieved from Firebase
function processData(data: Dataset[], table: string) {
  const processedData: Dataset[] = [];
  let propertyOrder: string[];
  switch (table) {
    case 'users':
      propertyOrder = usersOrder;
      break;
    case 'transactions':
      propertyOrder = transactionsOrder;
      break;
    default:
      throw new Error('Invalid table name. Please add the table order in the api route function.');
  }
  data.forEach(item => {
    const processedItem: Dataset = {};
    propertyOrder.forEach((key: string) => {
      processedItem[key] = item[key];
    });
    processedData.push(processedItem);
  });

  return processedData;
}

export async function GET(request: Request, params: { params: { table: string } }) {
  const table = params.params.table;

  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const isPro = searchParams.get('isPro') ? searchParams.get('isPro') === 'true' : undefined;

  try {
    const db = init();
    const data: Dataset[] = [];
    const c = collection(db, table);
    const q = query(
      c,
      ...(name ? [where('name', '==', name.charAt(0).toUpperCase() + name.slice(1))] : []),
      ...(typeof isPro !== 'undefined' ? [where('isPro', '==', isPro)] : []),
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => data.push(doc.data()));

    return NextResponse.json(processData(data, table));
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
