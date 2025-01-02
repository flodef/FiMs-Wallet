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
  const creators = searchParams.get('creators')?.split(',').filter(Boolean);
  const tokens = searchParams.get('tokens')?.split(',').filter(Boolean);
  const showEmptyBalance = searchParams.get('showEmptyBalance');

  if (!address) return NextResponse.json({ error: 'Missing required parameter: address.' }, { status: 500 });

  try {
    const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`, {
      method: 'POST',
      cache: 'no-store',
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

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.statusText}`);
    }

    const { result } = (await response.json()) as { result: HeliusData };

    const data = !tokens?.length
      ? result?.items
          .filter(d => !creators || d.creators.some(c => creators.includes(c.address)))
          .map(d => {
            return {
              id: d.id,
              name: d.content.metadata.name ?? d.token_info.name,
              symbol: d.content.metadata.symbol ?? d.token_info.symbol,
              balance: d.token_info.balance / Math.pow(10, d.token_info.decimals),
            };
          })
          .concat(
            result?.nativeBalance.lamports
              ? {
                  id: solanaTokenId,
                  name: 'Solana',
                  symbol: 'SOL',
                  balance: result?.nativeBalance.lamports / Math.pow(10, 9),
                }
              : [],
          )
          .sort((a, b) => (tokens?.length ? tokens.indexOf(a.id) - tokens.indexOf(b.id) : 0))
      : tokens
          .map(token => {
            const item =
              token !== solanaTokenId
                ? result?.items.find(
                    d => d.id === token && (!creators || d.creators.some(c => creators.includes(c.address))),
                  )
                : result?.nativeBalance.lamports
                  ? {
                      token_info: {
                        name: 'Solana',
                        symbol: 'SOL',
                        decimals: 9,
                        balance: result?.nativeBalance.lamports,
                      },
                      content: { metadata: { name: '', symbol: '' } },
                    }
                  : undefined;

            return {
              id: token,
              name: item ? item.content.metadata.name || item.token_info.name : '',
              symbol: item ? item.content.metadata.symbol || item.token_info.symbol : '',
              balance: item ? item.token_info.balance / Math.pow(10, item.token_info.decimals) : 0,
            };
          })
          .filter(token => showEmptyBalance || (token.name && token.symbol && token.balance > 0));

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(error);
  }
}
