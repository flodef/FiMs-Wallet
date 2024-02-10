import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user');

  try {
    const { rows } = await (user
      ? sql`SELECT * FROM users WHERE name ILIKE ${user}`
      : sql`SELECT * FROM users ORDER BY id ASC`);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
