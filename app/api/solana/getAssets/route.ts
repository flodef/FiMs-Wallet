import { NextResponse } from 'next/server';

interface HeliusItem {
  id: string;
  interface: string;
  content: { metadata: { name: string; symbol: string } };
  token_info?: { name: string; symbol: string; balance: number; decimals: number };
  creators?: { address: string }[];
}

interface HeliusData {
  total: number;
  limit: number;
  nativeBalance?: {
    lamports: number;
  };
  items: HeliusItem[];
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'fims-wallet',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: address,
          page: 1,
          limit: 1000,
          options: {
            showFungible: true,
            showNativeBalance: true,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.statusText}`);
    }

    const { result, error } = (await response.json()) as { result?: HeliusData; error?: { message: string } };

    if (error) {
      throw new Error(`Helius API error: ${error.message}`);
    }

    const items = result?.items ?? [];
    const nativeLamports = result?.nativeBalance?.lamports;

    const fungibleItems = items.filter(
      d => d.token_info && (d.interface === 'FungibleToken' || d.interface === 'FungibleAsset'),
    );

    const data = !tokens?.length
      ? fungibleItems
          .filter(d => !creators || (d.creators?.some(c => creators.includes(c.address)) ?? false))
          .map(d => ({
            id: d.id,
            name: d.content.metadata.name ?? d.token_info!.name,
            symbol: d.content.metadata.symbol ?? d.token_info!.symbol,
            balance: d.token_info!.balance / Math.pow(10, d.token_info!.decimals),
          }))
          .concat(
            nativeLamports
              ? {
                  id: solanaTokenId,
                  name: 'Solana',
                  symbol: 'SOL',
                  balance: nativeLamports / Math.pow(10, 9),
                }
              : [],
          )
          .sort((a, b) => (tokens?.length ? tokens.indexOf(a.id) - tokens.indexOf(b.id) : 0))
      : tokens
          .map(token => {
            const item =
              token !== solanaTokenId
                ? fungibleItems.find(
                    d =>
                      d.id === token && (!creators || (d.creators?.some(c => creators.includes(c.address)) ?? false)),
                  )
                : nativeLamports
                  ? {
                      token_info: {
                        name: 'Solana',
                        symbol: 'SOL',
                        decimals: 9,
                        balance: nativeLamports,
                      },
                      content: { metadata: { name: '', symbol: '' } },
                    }
                  : undefined;

            return {
              id: token,
              name: item ? item.content.metadata.name || item.token_info!.name : '',
              symbol: item ? item.content.metadata.symbol || item.token_info!.symbol : '',
              balance: item ? item.token_info!.balance / Math.pow(10, item.token_info!.decimals) : 0,
            };
          })
          .filter(token => showEmptyBalance || (token.name && token.symbol && token.balance > 0));

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 },
    );
  }
}
