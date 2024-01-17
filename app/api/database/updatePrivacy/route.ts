import { sql } from '@vercel/postgres';
import { log } from 'console';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { isPublic, address } = body;

  log(isPublic, address);

  try {
    const result = await sql`UPDATE users SET isPublic = ${isPublic} WHERE Address = ${address}`;

    console.log(result);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(error);
  }
}
