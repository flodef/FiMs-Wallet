import { IconInfoCircle, IconSearch } from '@tabler/icons-react';
import { MultiSelect, MultiSelectItem, Table, TableBody, TableCell, TableRow } from '@tremor/react';
import { Card, Flex, message, Switch, Tooltip } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { CopyButton } from '../components/copyButton';
import SortTableHead from '../components/sortTableHead';
import { Subtitle, Text, Title } from '../components/typography';
import { TransactionType, useData } from '../hooks/useData';
import { Page, useNavigation } from '../hooks/useNavigation';
import { User, useUser } from '../hooks/useUser';
import { getShortAddress } from '../utils/constants';
import { isMobileSize } from '../utils/mobile';
import { DataName, loadData } from '../utils/processData';
import { Dataset } from '../utils/types';

const DONATION_RATIO = 0.1; // Donation ratio is 10%

const t: Dataset = {
  myInfo: 'Mes informations',
  usersList: 'Liste des FiMseurs•es',
  noUserFound: 'Aucun FiMseur•se trouvée',
  shouldBecomePublic: 'Pour pouvoir voir les autres FiMseurs•es, votre profil doit être public',
  userLoading: 'Chargement des FiMseurs•es',
  selectUser: 'Sélectionner un FiMseur•se',
  search: 'Rechercher',
  name: 'Pseudo',
  address: 'Adresse Solana',
  copy: 'Copier',
  private: 'Privé',
  public: 'Public',
  yes: 'Oui',
  no: 'Non',
  appearance: 'Visible des autres FiMseurs•es',
  duration: 'FiMseur•se depuis',
  donated: 'Montant des dons',
  remainingToDonate: 'Restant à donner',
  remainingToDonateTooltip:
    '% des gains correspondent à la rémunération pour mon travail. Il peuvent être :\n- soit versés sur le compte de la Tontine.\n- soit donnés à une association de votre choix (déduction sur justificatifs).',
  transferCost: 'Frais à rembourser',
};

export interface DBUser extends User {
  ispublic: boolean;
  profitValue?: number;
  transferCost?: number;
  duration?: number;
  donated?: number;
}

const thisPage = Page.Users;

export default function Users() {
  const { user: currentUser } = useUser();
  const { page, needRefresh, setNeedRefresh } = useNavigation();
  const { users, setUsers, isPublic, setIsPublic, transactions } = useData();
  const [messageApi, contextHolder] = message.useMessage();
  const [myProfile, setMyProfile] = useState<DBUser>();

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

      const myProfile = users.find(user => user.name === currentUser?.name);
      if (myProfile?.duration) {
        if (transactions)
          myProfile.donated = transactions
            .filter(t => t.userid === myProfile.id && t.type === TransactionType.donation)
            .reduce((a, b) => a + b.movement, 0);
        setMyProfile(myProfile);
      }
    },
    [currentUser?.name, setIsPublic, setUsers, transactions],
  );

  const isLoading = useRef(false);
  useEffect(() => {
    if (isLoading.current || !needRefresh || page !== thisPage) return;

    isLoading.current = true;
    setNeedRefresh(false);

    loadData(DataName.portfolio)
      .then(users => processUsers(users as DBUser[]))
      .then(() => fetch('/api/database/getUsers'))
      .then(result => result.ok && result.json())
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

  return (
    <Flex vertical className="gap-6">
      {contextHolder}
      <Card>
        {(() => {
          const donated = myProfile?.donated;
          const profitValue = myProfile?.profitValue;
          const donationRatio = donated !== undefined && profitValue !== undefined ? donated / profitValue : undefined;
          const isBelowThreshold = donationRatio !== undefined && donationRatio < DONATION_RATIO;

          return (
            <>
              <Title className="text-left whitespace-nowrap">{t.myInfo}</Title>
              <Flex justify="space-between" align="center">
                <Subtitle className="truncate whitespace-nowrap">{t.name}</Subtitle>
                <Text>{currentUser?.name}</Text>
              </Flex>
              <Flex justify="space-between" align="center">
                <Subtitle className="truncate whitespace-nowrap">{t.address}</Subtitle>
                <Flex>
                  <Text>{isMobileSize() ? getShortAddress(currentUser?.address ?? '') : currentUser?.address}</Text>
                  <CopyButton content={currentUser?.address} label={t.address} messageApi={messageApi} />
                </Flex>
              </Flex>
              <Flex justify="space-between" align="center">
                <Subtitle className="truncate whitespace-nowrap">{t.appearance}</Subtitle>
                {isPublic !== undefined ? (
                  <Flex justify="end" align="center">
                    <Text className="mx-2 whitespace-nowrap">{isPublic ? t.yes : t.no}</Text>
                    <Switch disabled={isUpdatingUserPrivacy.current} checked={isPublic} onChange={handleSwitchChange} />
                  </Flex>
                ) : (
                  <div className="bg-theme-border rounded-md w-[70px] h-5 mb-1" />
                )}
              </Flex>
              <Flex justify="space-between" align="center">
                <Subtitle className="truncate whitespace-nowrap">{t.duration}</Subtitle>
                {myProfile?.duration !== undefined ? (
                  <Text>{myProfile.duration.formatDuration()}</Text>
                ) : (
                  <div className="bg-theme-border rounded-md w-24 h-5 mb-1" />
                )}
              </Flex>
              <Flex justify="space-between" align="center">
                <Subtitle className="truncate whitespace-nowrap">{t.donated}</Subtitle>
                {donationRatio !== undefined && donated !== undefined ? (
                  <Text type={isBelowThreshold ? 'danger' : 'success'} className="font-bold">
                    {`${donated.toLocaleCurrency()} (${donationRatio.toRatio()})`}
                  </Text>
                ) : (
                  <div className="bg-theme-border rounded-md w-32 h-5 mb-1" />
                )}
              </Flex>
              {isBelowThreshold && (
                <Flex justify="space-between" align="center">
                  <Flex align="center" gap={4}>
                    <Subtitle className="truncate whitespace-nowrap">{t.remainingToDonate}</Subtitle>
                    <Tooltip
                      title={
                        <Flex vertical>
                          <Text className="text-theme-content-emphasis dark:text-dark-theme-content-emphasis">{`${DONATION_RATIO * 100}% des gains correspondent à la rémunération pour mon travail. Il peuvent être :`}</Text>
                          <Text className="text-theme-content-emphasis dark:text-dark-theme-content-emphasis">
                            - soit versés sur le compte de la Tontine.
                          </Text>
                          <Text className="text-theme-content-emphasis dark:text-dark-theme-content-emphasis">
                            - soit donnés à une association de votre choix (déduction sur justificatifs).
                          </Text>
                        </Flex>
                      }
                    >
                      <IconInfoCircle size={20} className="cursor-help text-gray-400" />
                    </Tooltip>
                  </Flex>
                  <Text className="font-bold">
                    {profitValue !== undefined && donated !== undefined
                      ? ((profitValue - donated) * DONATION_RATIO).toLocaleCurrency()
                      : ''}
                  </Text>
                </Flex>
              )}
              {!!myProfile?.transferCost && (
                <Flex justify="space-between" align="center">
                  <Subtitle className="truncate whitespace-nowrap">{t.transferCost}</Subtitle>
                  <Text className="font-bold">{myProfile?.transferCost?.toLocaleCurrency()}</Text>
                </Flex>
              )}
            </>
          );
        })()}
      </Card>
      <Card>
        <Flex justify="space-between">
          <Title className="text-left whitespace-nowrap">{t.usersList}</Title>
        </Flex>
        {isPublic === true ? (
          <>
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
                  icon={IconSearch}
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
                      className={twMerge(
                        'cursor-pointer',
                        'hover:bg-theme-background-subtle dark:hover:bg-dark-theme-background-subtle',
                        user.name === currentUser?.name ? 'bg-theme-border dark:bg-dark-theme-border' : '',
                      )}
                    >
                      <TableCell>{user.name}</TableCell>
                      <TableCell>
                        <Text>{getShortAddress(user.address)}</Text>
                      </TableCell>
                      <TableCell>
                        <CopyButton content={user.address} label={t.address} messageApi={messageApi} />
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
          </>
        ) : (
          <Text>{t.shouldBecomePublic}</Text>
        )}
      </Card>
    </Flex>
  );
}
