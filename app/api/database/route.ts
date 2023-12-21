import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user');

  console.log('Handler');
  try {
    const { rows } = await (user ? sql`SELECT * FROM users WHERE name = ${user}` : sql`SELECT * FROM users`);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
  }
}