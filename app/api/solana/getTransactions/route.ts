import { NextResponse } from 'next/server';

interface TransferData {
  fromUserAccount: string | null;
  toUserAccount: string | null;
  mint: string | null;
  amount: string;
  decimals: number;
  uiAmount: string | null;
  type: string;
  blockTime: number;
}

interface HeliusResult {
  data: TransferData[];
  paginationToken: string | null;
}

export async function GET(request: Request) {
  if (!process.env.HELIUS_API_KEY)
    return NextResponse.json({ error: 'Missing required environment variables.' }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

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
        method: 'getTransfersByAddress',
        params: [address],
      }),
    });

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.statusText}`);
    }

    const { result } = (await response.json()) as { result: HeliusResult };

    const data = (result?.data ?? [])
      .filter(d => d.type === 'transfer' && d.fromUserAccount && d.toUserAccount)
      .map(d => ({
        from: d.fromUserAccount as string,
        to: d.toUserAccount as string,
        amount: Number(d.uiAmount ?? Number(d.amount) / Math.pow(10, d.decimals)),
        symbol: d.mint === null ? 'SOL' : d.mint,
        fee: 0,
        feePayer: '',
        timestamp: d.blockTime,
      }))
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
