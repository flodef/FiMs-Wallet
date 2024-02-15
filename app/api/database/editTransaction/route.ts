import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { date, address, movement, cost, userId, token, amount, id } = body;

  if (!id && (!date || !address || !movement || !cost || !userId || !token || !amount))
    return NextResponse.json({ error: 'Missing required parameter: id or one of the update fields.' }, { status: 500 });

  try {
    const d = new Date(date);
    const dateString = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const result = await sql`
      UPDATE transactions 
      SET Date = ${dateString},
        Address = ${String(address)},
        Movement = ${Number(movement)},
        Cost = ${Number(cost)},
        UserId = ${Number(userId)},
        Token = ${String(token)},
        Amount = ${Number(amount)}
      WHERE Id = ${Number(id)}`;

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
