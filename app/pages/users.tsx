import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { Card, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text, Title } from '@tremor/react';
import { useEffect, useMemo, useState } from 'react';
import Search from '../components/search';
import { User, useUser } from '../hooks/useUser';
import { useIsWindowReady } from '../hooks/useWindowParam';
import { getShortAddress } from '../utils/constants';
import { DataName, loadData } from '../utils/processData';
import { Dataset } from '../utils/types';

const t: Dataset = {
  usersList: 'Liste des utilisateurs',
  noUserFound: 'Aucun utilisateur trouvé',
  userLoading: 'Chargement des utilisateurs...',
  name: 'Nom',
  address: 'Adresse',
  copy: 'Copier',
};

export default function Users() {
  const { user: currentUser } = useUser();

  const isWindowReady = useIsWindowReady();

  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[] | undefined>();

  useEffect(() => {
    loadData(DataName.portfolio)
      .then(setUsers)
      .catch((error) => {
        console.error(error);
        setUsers([]);
      })
      .then(() => {
        if (!isWindowReady) return;

        const urlSearchParams = new URLSearchParams(window.location.search);
        setSearch(urlSearchParams.get('q') ?? '');
      });
  }, [isWindowReady]);

  const result = useMemo(() => {
    return users
      ? users
          .filter((user) => user.name.toLowerCase().includes(search.toLowerCase()) && user.address)
          .sort((a, b) => a.name.localeCompare(b.name))
          .sort((a, _) => (a.name === currentUser?.name ? -1 : 0)) // Put the current user on top
      : undefined;
  }, [search, users, currentUser?.name]);

  return (
    <>
      <Title>{t['usersList']}</Title>
      <Search defaultValue={search} />
      <Card className="mt-6">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell className="w-1/3">{t['name']}</TableHeaderCell>
              <TableHeaderCell className="w-1/3">{t['address']}</TableHeaderCell>
              <TableHeaderCell className="w-1/3">{t['copy']}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {result?.length ? (
              result.map((user) => (
                <TableRow
                  key={user.name}
                  className={
                    'hover:bg-gray-50 cursor-pointer' + (user.name === currentUser?.name ? ' bg-gray-100' : '')
                  }
                  onClick={() => {
                    navigator.clipboard.writeText(user.address);
                  }}
                >
                  <TableCell>{user.name}</TableCell>
                  <TableCell>
                    <Text>{getShortAddress(user.address)}</Text>
                  </TableCell>
                  <TableCell>
                    <DocumentDuplicateIcon
                      className="h-5 w-5 ml-3 text-gray-400 hover:text-gray-500 cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(user.address);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  {t[result ? 'noUserFound' : 'userLoading']}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
