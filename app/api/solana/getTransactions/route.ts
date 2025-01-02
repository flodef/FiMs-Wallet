import { NextResponse } from 'next/server';

type tokenStandard = 'Fungible' | 'NonFungible' | 'FungibleAsset';

interface HeliusData {
  description: string;
  fee: number;
  feePayer: string;
  timestamp: number;
  transactionError: string | null;
  tokenTransfers: {
    fromUserAccount: string;
    toUserAccount: string;
    tokenAmount: number;
    mint: string;
    tokenStandard: tokenStandard;
  }[];
  nativeTransfers: {
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }[];
}

export async function GET(request: Request) {
  if (!process.env.HELIUS_API_KEY)
    return NextResponse.json({ error: 'Missing required environment variables.' }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) return NextResponse.json({ error: 'Missing required parameter: address.' }, { status: 500 });

  try {
    const response = await fetch(
      `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${process.env.HELIUS_API_KEY}&type=TRANSFER`,
      { cache: 'no-store' },
    );

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.statusText}`);
    }

    const result = (await response.json()) as HeliusData[];

    const getSymbol = (description: string) => description.split(' ')[3].trim().slice(0, 4);

    const data = result
      .filter(
        d =>
          !d.transactionError &&
          ((d.tokenTransfers.length === 1 &&
            d.tokenTransfers[0].tokenStandard === 'Fungible' &&
            d.tokenTransfers[0].mint !== getSymbol(d.description)) ||
            d.nativeTransfers.length === 1),
      )
      .map(d => {
        return {
          from: d.tokenTransfers.length ? d.tokenTransfers[0].fromUserAccount : d.nativeTransfers[0].fromUserAccount,
          to: d.tokenTransfers.length ? d.tokenTransfers[0].toUserAccount : d.nativeTransfers[0].toUserAccount,
          amount: d.tokenTransfers.length
            ? d.tokenTransfers[0].tokenAmount
            : d.nativeTransfers[0].amount / Math.pow(10, 9),
          symbol: getSymbol(d.description),
          fee: d.fee / Math.pow(10, 9),
          feePayer: d.feePayer,
          timestamp: d.timestamp,
        };
      })
      .filter(d => d.amount * 1000 >= 1);

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 },
    );
  }
}
