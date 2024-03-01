import { NextResponse } from 'next/server';

interface HeliusData {
  total: number;
  limit: number;
  cursor: string;
  nativeBalance: {
    lamports: number;
  };
  items: {
    id: string;
    content: { metadata: { name: string; symbol: string } };
    token_info: { name: string; symbol: string; balance: number; decimals: number };
    creators: { address: string }[];
  }[];
}

const solanaTokenId = 'So11111111111111111111111111111111111111112';

export async function GET(request: Request) {
  if (!process.env.HELIUS_API_KEY)
    return NextResponse.json({ error: 'Missing required environment variables.' }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const creator = searchParams.get('creator');
  const tokens = searchParams.get('tokens')?.split(',');

  if (!address) return NextResponse.json({ error: 'Missing required parameter: address.' }, { status: 500 });

  try {
    const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`, {
      method: 'POST',
      headers: {
        Referer: 'https://www.fims.fi',
        ContentType: 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'fims-wallet',
        method: 'searchAssets',
        params: {
          ownerAddress: address,
          tokenType: 'fungible',
          displayOptions: {
            showNativeBalance: true,
            showGrandTotal: true,
          },
        },
      }),
    });
    const { result } = (await response.json()) as { result: HeliusData };

    const data = result?.items
      .filter(d => !creator || d.creators.some(c => c.address === creator))
      .filter(d => !tokens?.length || tokens?.includes(d.id))
      .map(d => {
        return {
          id: d.id,
          name: d.content.metadata.name ?? d.token_info.name,
          symbol: d.content.metadata.symbol ?? d.token_info.symbol,
          balance: d.token_info.balance / Math.pow(10, d.token_info.decimals),
        };
      })
      .concat(
        result?.nativeBalance.lamports && (!tokens?.length || tokens?.includes(solanaTokenId))
          ? {
              id: solanaTokenId,
              name: 'Solana',
              symbol: 'SOL',
              balance: result?.nativeBalance.lamports / Math.pow(10, 9),
            }
          : [],
      );

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(error);
  }
}
