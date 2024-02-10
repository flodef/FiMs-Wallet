import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, address, isPublic } = body;

  if (!name || !address)
    return NextResponse.json({ error: 'Missing required parameter: name or address.' }, { status: 500 });

  try {
    const result = await sql`
      INSERT INTO users (Name, Address, Ispublic)
      VALUES (${String(name)}, ${String(address)}, ${Boolean(isPublic)})`;

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
