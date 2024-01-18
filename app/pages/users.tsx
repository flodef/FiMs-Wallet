import { DocumentDuplicateIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {
  Card,
  Flex,
  MultiSelect,
  MultiSelectItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Text,
  Title,
} from '@tremor/react';
import { useEffect, useRef, useState } from 'react';
import SortTableHead from '../components/sortTableHead';
import { User, useUser } from '../hooks/useUser';
import { getShortAddress } from '../utils/constants';
import { Dataset } from '../utils/types';

const t: Dataset = {
  usersList: 'Liste des utilisateurs',
  noUserFound: 'Aucun utilisateur trouvé',
  userLoading: 'Chargement des utilisateurs...',
  selectUser: 'Sélectionner un utilisateur',
  search: 'Rechercher',
  name: 'Nom',
  address: 'Adresse',
  copy: 'Copier',
  private: 'Privé',
  public: 'Public',
  appearance: 'Etre visible des autres utilisateurs FiMs ?',
};

interface DBUser extends User {
  ispublic: boolean;
}

export default function Users() {
  const { user: currentUser } = useUser();

  const [users, setUsers] = useState<User[] | undefined>();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState<boolean>();

  useEffect(() => {
    fetch('/api/database/getUsers')
      .then((result) => {
        if (result.ok) {
          result.json().then((users: DBUser[]) => {
            setIsPublic(users.find((user) => user.name === currentUser?.name)?.ispublic);
            setUsers(
              users
                ? users
                    .filter((user) => (user.ispublic || user.name === currentUser?.name) && user.address !== user.name)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .sort((a, _) => (a.name === currentUser?.name ? -1 : 0)) // Put the current user on top
                    .map((user) => ({ name: user.name, address: user.address }))
                : undefined
            );
          });
        }
      })
      .catch((error) => {
        console.error(error);
        setUsers([]);
      });
  }, [currentUser?.name]);

  const isUserSelected = (user: User) => selectedUsers.includes(user.name) || selectedUsers.length === 0;

  const isUpdatingUserPrivacy = useRef(false);
  const handleSwitchChange = (value: boolean) => {
    if (!currentUser || isUpdatingUserPrivacy.current) return;

    isUpdatingUserPrivacy.current = true;

    console.log('Updating privacy to', value);

    fetch('/api/database/updatePrivacy', {
      method: 'POST',
      body: JSON.stringify({ address: currentUser.address, isPublic: value }),
    })
      .then((result) => {
        console.log(result);

        if (result.ok) {
          setIsPublic(value);
        }
      })
      .finally(() => {
        isUpdatingUserPrivacy.current = false;
      });
  };

  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef.current && users?.length) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [users]);

  return (
    <>
      <Flex justifyContent="between">
        <Title className="text-left whitespace-nowrap">{t.usersList}</Title>
        {isPublic !== undefined && (
          <Flex justifyContent="end">
            <Text className="mr-2">{isPublic ? t.public : t.private}</Text>
            <Switch
              id="switch"
              name="switch"
              disabled={isUpdatingUserPrivacy.current}
              tooltip={t.appearance}
              checked={isPublic}
              onChange={handleSwitchChange}
            />
          </Flex>
        )}
      </Flex>
      {users?.length && (
        <Flex className="relative mt-5 max-w-md">
          <label htmlFor="search" className="sr-only">
            {t.searchByName}
          </label>
          <MultiSelect
            autoFocus
            ref={inputRef}
            icon={MagnifyingGlassIcon}
            id="search"
            className="max-w-full sm:max-w-xs"
            placeholder={t.selectUser}
            placeholderSearch={t.search}
            spellCheck={false}
            value={selectedUsers}
            onValueChange={setSelectedUsers}
          >
            {users?.map((item) => (
              <MultiSelectItem key={item.name} value={item.name}>
                {item.name}
              </MultiSelectItem>
            ))}
          </MultiSelect>
        </Flex>
      )}
      <Card className="mt-6">
        <Table>
          <SortTableHead labels={[t.name, t.address, t.copy]} table={users} setTable={setUsers} />
          <TableBody>
            {users?.length ? (
              users.filter(isUserSelected).map((user) => (
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
                  {users ? t.noUserFound : t.userLoading}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
