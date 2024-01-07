import { DocumentDuplicateIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {
  Card,
  Flex,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  TextInput,
  Title,
} from '@tremor/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { User, useUser } from '../hooks/useUser';
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

  const [users, setUsers] = useState<User[] | undefined>();

  useEffect(() => {
    loadData(DataName.portfolio)
      .then(setUsers)
      .catch((error) => {
        console.error(error);
        setUsers([]);
      });
  }, []);

  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  const [search, setSearch] = useState('');
  const result = useMemo(() => {
    return users
      ? users
          .filter(
            (user) => (!search || user.name.toLowerCase().includes(search.toLowerCase())) && user.address !== user.name
          )
          .sort((a, b) => a.name.localeCompare(b.name))
          .sort((a, _) => (a.name === currentUser?.name ? -1 : 0)) // Put the current user on top
      : undefined;
  }, [currentUser, search, users]);

  return (
    <>
      <Title>{t['usersList']}</Title>
      <Flex className="relative mt-5 max-w-md">
        <label htmlFor="search" className="sr-only">
          {t.searchByName}
        </label>
        <TextInput
          autoFocus
          ref={inputRef}
          icon={MagnifyingGlassIcon}
          type="text"
          name="search"
          id="search"
          placeholder={t.searchByName}
          spellCheck={false}
          autoComplete="off"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Flex>
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
