import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, address, isPublic, id } = body;

  if (!id && (!name || !address))
    return NextResponse.json({ error: 'Missing required parameter: id or one of the update fields.' }, { status: 500 });

  try {
    const result = await sql`
      UPDATE users
      SET Name = ${String(name)},
        Address = ${String(address)},
        Ispublic = ${Boolean(isPublic)} 
      WHERE Id = ${Number(id)}`;

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
