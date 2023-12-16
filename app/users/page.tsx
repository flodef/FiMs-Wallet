import { Card, Table, Text, Title } from '@tremor/react';
import { sql } from '@vercel/postgres';
import Search from '../search';
import { TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@tremor/react';

interface User {
  name: string;
  address: string;
}

export default async function IndexPage({ searchParams }: { searchParams: { q: string } }) {
  const search = searchParams.q ?? '';
  const result = await sql`
    SELECT name, address
    FROM users
    WHERE name ILIKE ${'%' + search + '%'};
  `;
  const users = result.rows as User[];

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Users</Title>
      <Text>A list of users retrieved from a Postgres database.</Text>
      <Search />
      <Card className="mt-6">
        {/* <UsersTable users={users} /> */}
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Address</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.name}>
                <TableCell>{user.name}</TableCell>
                <TableCell>
                  <Text>{user.address}</Text>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </main>
  );
}
