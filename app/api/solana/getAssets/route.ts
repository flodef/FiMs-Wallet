import { NextResponse } from 'next/server';

interface HeliusData {
  items: {
    id: string;
    content: { metadata: { name: string; symbol: string } };
    token_info: { balance: number; decimals: number };
    creators: { address: string }[];
  }[];
}

export async function GET(request: Request) {
  if (!process.env.HELIUS_API_KEY)
    return NextResponse.json({ error: 'Missing required environment variables.' }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const creator = searchParams.get('creator');
  const token = searchParams.get('token');

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

    const data =
      result?.items
        .filter(d => !creator || d.creators.some(c => c.address === creator))
        .filter(d => !token || d.id === token)
        .map(d => {
          return {
            name: d.content.metadata.name,
            symbol: d.content.metadata.symbol,
            balance: d.token_info.balance / Math.pow(10, d.token_info.decimals),
          };
        }) ?? [];

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(error);
  }
}
