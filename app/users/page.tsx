import { sql } from '@vercel/postgres';
import { Card, Title, Text } from '@tremor/react';
import Search from '../search';
import UsersTable from '../table';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

export default async function IndexPage({ searchParams }: { searchParams: { q: string } }) {
  const search = searchParams.q ?? '';
  const result = await sql`
    SELECT name, address
    FROM users
    WHERE name ILIKE ${'%' + search + '%'};
  `;
  const users = result.rows as User[];
  // const users = [
  //   {
  //     id: 1,
  //     name: 'John Doe',
  //     username: 'johndoe',
  //     email: 'johndoe@email.com'
  //   }
  // ].filter((user) => user.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Users</Title>
      <Text>A list of users retrieved from a Postgres database.</Text>
      <Search />
      <Card className="mt-6">
        <UsersTable users={users} />
      </Card>
    </main>
  );
}
