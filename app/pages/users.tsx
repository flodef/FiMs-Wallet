import { DocumentDuplicateIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import {
  Card,
  Flex,
  Icon,
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
import { useCallback, useEffect, useRef, useState } from 'react';
import SortTableHead from '../components/sortTableHead';
import { useData } from '../hooks/useData';
import { Page, useNavigation } from '../hooks/useNavigation';
import { User, useUser } from '../hooks/useUser';
import { cls, getShortAddress } from '../utils/constants';
import { isMobileDevice } from '../utils/mobile';
import { DataName, loadData } from '../utils/processData';
import { Dataset } from '../utils/types';

const t: Dataset = {
  usersList: 'Liste des utilisateurs',
  noUserFound: 'Aucun utilisateur trouvée',
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

export interface DBUser extends User {
  ispublic: boolean;
}

const thisPage = Page.Users;

export default function Users() {
  const { user: currentUser } = useUser();
  const { page, needRefresh, setNeedRefresh } = useNavigation();
  const { users, setUsers, isPublic, setIsPublic } = useData();

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const isUserSelected = (user: User) => selectedUsers.includes(user.name) || !selectedUsers.length;

  const processUsers = useCallback(
    (users: DBUser[]) => {
      setIsPublic(users.find(user => user.name === currentUser?.name)?.ispublic);
      setUsers(
        users
          .filter(user => (user.ispublic || user.name === currentUser?.name) && user.address !== user.name)
          .sort((a, b) => a.name.localeCompare(b.name))
          .sort((a, _) => (a.name === currentUser?.name ? -1 : 0)), // Put the current user on top
      );
    },
    [currentUser?.name, setIsPublic, setUsers],
  );

  const isLoading = useRef(false);
  useEffect(() => {
    if (isLoading.current || !needRefresh || page !== thisPage) return;

    isLoading.current = true;
    setNeedRefresh(false);

    loadData(DataName.portfolio)
      .then(users => processUsers(users as DBUser[]))
      .then(() => fetch('/api/database/getUsers'))
      .then(result => (result.ok ? result.json() : undefined))
      .then(processUsers)
      .catch(console.error)
      .finally(() => (isLoading.current = false));
  }, [needRefresh, setNeedRefresh, page, processUsers]);

  const isUpdatingUserPrivacy = useRef(false);
  const handleSwitchChange = (value: boolean) => {
    if (!currentUser || isUpdatingUserPrivacy.current) return;

    isUpdatingUserPrivacy.current = true;

    fetch('/api/database/updatePrivacy', {
      method: 'POST',
      body: JSON.stringify({ address: currentUser.address, isPublic: value }),
    })
      .then(result => (result.ok ? setIsPublic(value) : undefined))
      .catch(console.error)
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

  const [tooltipText, setTooltipText] = useState(t.appearance + ' ');

  return (
    <Card>
      <Flex justifyContent="between">
        <Title className="text-left whitespace-nowrap">{t.usersList}</Title>
        {isPublic !== undefined && (
          <Flex justifyContent="end">
            <Icon
              icon={InformationCircleIcon}
              tooltip={tooltipText}
              color="gray"
              onClick={
                isMobileDevice() ? () => setTooltipText(tooltipText !== t.appearance ? t.appearance : '') : undefined
              }
            />
            <Text className="mr-2">{isPublic ? t.public : t.private}</Text>
            <Switch disabled={isUpdatingUserPrivacy.current} checked={isPublic} onChange={handleSwitchChange} />
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
            className="max-w-full sm:max-w-xs"
            id="search"
            icon={MagnifyingGlassIcon}
            placeholder={t.selectUser}
            placeholderSearch={t.search}
            spellCheck={false}
            value={selectedUsers}
            onValueChange={setSelectedUsers}
          >
            {users?.map(item => (
              <MultiSelectItem key={item.name} value={item.name}>
                {item.name}
              </MultiSelectItem>
            ))}
          </MultiSelect>
        </Flex>
      )}
      <Table>
        <SortTableHead labels={[t.name, t.address, t.copy]} table={users} setTable={setUsers} />
        <TableBody>
          {users?.length ? (
            users.filter(isUserSelected).map(user => (
              <TableRow
                key={user.name}
                className={cls(
                  'cursor-pointer',
                  'hover:bg-tremor-background-subtle dark:hover:bg-dark-tremor-background-subtle',
                  user.name === currentUser?.name ? 'bg-tremor-border dark:bg-dark-tremor-border' : '',
                )}
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
                    className={cls(
                      'h-5 w-5 ml-3 cursor-pointer',
                      'text-tremor-content-subtle dark:text-dark-tremor-content-subtle',
                      'hover:text-tremor-content dark:hover:text-dark-tremor-content',
                    )}
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
  );
}
