import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { id } = body;

  if (!id) return NextResponse.json({ error: 'Missing required parameter: id.' }, { status: 500 });

  try {
    const result = await sql`
        DELETE FROM transactions
        WHERE Id = ${Number(id)}`;

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
