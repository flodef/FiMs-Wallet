import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  try {
    const { rows } = await (address
      ? sql`SELECT * FROM transactions WHERE address=${address}`
      : sql`SELECT * FROM transactions ORDER BY date DESC`);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
