import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { date, address, movement, cost } = body;

  if (!date || !address || !movement)
    return NextResponse.json({ error: 'Missing required parameter: date, address or movement.' }, { status: 500 });

  try {
    const d = new Date(date);
    const dateString = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const result = await sql`
      INSERT INTO transactions (Date, Address, Movement, Cost)
      VALUES (${dateString}, ${String(address)}, ${Number(movement)}, ${Number(cost)})`;

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
