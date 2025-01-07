import { NextRequest, NextResponse } from 'next/server';

interface JupiterPriceResponse {
  data: {
    [key: string]: {
      id: string;
      type: string;
      price: string;
    };
  };
  timeTaken: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.get('ids');
    const rate = Number(searchParams.get('rate') ?? 1); // Default to 1 if no currency conversion needed

    if (!ids) {
      return NextResponse.json({ error: 'Missing token ids' }, { status: 400 });
    }

    const response = await fetch(`https://api.jup.ag/price/v2?ids=${ids}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.statusText}`);
    }

    const jupiterData = (await response.json()) as JupiterPriceResponse;

    // Convert prices to the requested currency
    const convertedData: { [key: string]: number } = {};
    Object.entries(jupiterData.data).forEach(([tokenId, tokenData]) => {
      if (tokenId && tokenData) convertedData[tokenId] = Number(tokenData.price) * rate;
    });

    return NextResponse.json({ data: convertedData });
  } catch (error) {
    console.error('Error fetching Jupiter prices:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 },
    );
  }
}
