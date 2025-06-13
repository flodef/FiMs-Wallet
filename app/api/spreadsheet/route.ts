import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  if (!process.env.GOOGLE_API_KEY)
    return NextResponse.json({ error: 'Missing required environment variables.' }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const sheetName = searchParams.get('sheetName');
  if ((!process.env.GOOGLE_SPREADSHEET_ID && !id) || !sheetName)
    return NextResponse.json(
      { error: 'Missing required environment variables or parameters : id, sheetname.' },
      { status: 500 },
    );

  const range = searchParams.get('range') ?? 'A:ZZ';
  const isRaw = searchParams.get('isRaw') === 'true';

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${
        id || process.env.GOOGLE_SPREADSHEET_ID
      }/values/${sheetName}!${encodeURIComponent(range)}?${isRaw ? 'valueRenderOption=UNFORMATTED_VALUE&' : ''}key=${
        process.env.GOOGLE_API_KEY
      }`,
      {
        headers: {
          Referer: 'https://www.fims.fi',
          ContentType: 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 },
    );
  }
}
