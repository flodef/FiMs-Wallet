import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { date, address, movement, cost, userId, token, amount } = body;

  if (!date || !address || !movement || !userId)
    return NextResponse.json({ error: 'Missing required parameter: date, address, movement or id.' }, { status: 500 });

  try {
    const d = new Date(date);
    const dateString = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const result = await sql`
      INSERT INTO transactions (Date, Address, Movement, Cost, UserId, Token, Amount)
      VALUES (${dateString}, ${String(address)}, ${Number(movement)}, ${Number(cost)}, ${Number(userId)}, ${String(token)}, ${Number(amount)})`;

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
