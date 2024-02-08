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
    );

    const getSymbol = (description: string) => description.split(' ')[3];

    const result = (await response.json()) as HeliusData[];
    const data = result
      .filter(
        d =>
          !d.transactionError &&
          d.tokenTransfers.length === 1 &&
          d.tokenTransfers[0].tokenStandard === 'Fungible' &&
          d.tokenTransfers[0].mint !== getSymbol(d.description),
      )
      .map(d => {
        return {
          from: d.tokenTransfers[0].fromUserAccount,
          to: d.tokenTransfers[0].toUserAccount,
          amount: d.tokenTransfers[0].tokenAmount,
          symbol: getSymbol(d.description),
          fee: d.fee,
          feePayer: d.feePayer,
          timestamp: d.timestamp,
        };
      });

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(error);
  }
}