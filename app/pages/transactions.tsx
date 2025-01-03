import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconExclamationCircleFilled,
  IconHeartFilled,
  IconSearch,
} from '@tabler/icons-react';
import {
  Grid,
  Icon,
  MultiSelect,
  MultiSelectItem,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@tremor/react';
import { Card, Flex } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Privacy, PrivacyButton } from '../components/privacy';
import SortTableHead from '../components/sortTableHead';
import { TransactionDetails } from '../components/transactionDetails';
import { Text, Title } from '../components/typography';
import { PortfolioToken, Transaction, TransactionType, useData } from '../hooks/useData';
import { Page, useNavigation } from '../hooks/useNavigation';
import { usePopup } from '../hooks/usePopup';
import { useUser } from '../hooks/useUser';
import { useIsMobile } from '../utils/mobile';
import { DataName, loadData } from '../utils/processData';
import { Dataset } from '../utils/types';

const t: Dataset = {
  transactionSummary: 'Résumé des transactions',
  cost: 'Frais',
  total: 'Total',
  transactionsHistoric: 'Historique des transactions',
  date: 'Date',
  movement: 'Mouvement',
  type: 'Type',
  token: 'Tokens',
  profit: 'Profit',
  rate: "Taux d'échange",
  price: 'Taux courant',
  deposit: 'Dépôt',
  withdrawal: 'Retrait',
  donation: 'Don',
  swap: 'Échange',
  payment: 'Paiement',
  noTransactionFound: 'Aucune transaction trouvé',
  transactionLoading: 'Chargement des transactions...',
  withdrawalCost: 'Frais de retrait',
  selectTransactionDate: 'Sélectionner une date',
  selectTransactionMovement: 'Sélectionner un mouvement',
  selectTransactionType: 'Sélectionner un type',
  to: 'à',
  from: 'du',
  search: 'Rechercher',
};

enum TransactionFilter {
  date,
  movement,
  type,
}

export const getTransactionType = (transaction: Transaction | { movement: number | string; cost: number | string }) => {
  const depositType = Number(transaction.cost) > 0 ? TransactionType.donation : TransactionType.deposit;
  return Number(transaction.movement) > 0 ? depositType : TransactionType.withdrawal;
};
const getTransactionIcon = (transaction: Transaction) => {
  const transactionIcon = transaction.type === TransactionType.deposit ? IconArrowDownRight : IconArrowUpRight;
  return transaction.type === TransactionType.donation ? IconHeartFilled : transactionIcon;
};
export const getTokenLabel = (transaction: Transaction) =>
  transaction.token && `${transaction.amount} ${transaction.token}`;
export const getTokenRate = (transaction: Transaction) =>
  transaction.token &&
  `1 ${transaction.token} = ${Math.abs(Number(transaction.movement) / Number(transaction.amount)).toLocaleCurrency()}`;
export const getTokenCurrentRate = (transaction: Transaction) =>
  getTokenRate({ ...transaction, movement: transaction.price ?? 0, amount: 1 });

const getTokenPrice = (transaction: Transaction, tokenData: PortfolioToken[]) =>
  tokenData.find(t => t.symbol === transaction.token)?.value;
const getTokenProfit = (transaction: Transaction) =>
  transaction.cost > 0 || !transaction.token
    ? 0
    : (transaction.price ?? 0) * (transaction.amount ?? 0) - transaction.movement - transaction.cost;

const thisPage = Page.Transactions;

export default function Transactions() {
  const { user } = useUser();
  const { page, needRefresh, setNeedRefresh } = useNavigation();
  const { openPopup } = usePopup();

  const { transactions, setTransactions } = useData();

  const [selectedType, setSelectedType] = useState<string>();
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedMovements, setSelectedMovements] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<number[]>();
  const [movementFilter, setMovementFilter] = useState<number[]>();
  const [typeFilter, setTypeFilter] = useState<Transaction[]>();
  const [costFilter, setCostFilter] = useState(false);

  const processTransactions = useCallback(
    (data: Transaction[], tokenData: PortfolioToken[]) => {
      setTransactions(
        data
          .filter(d => d.userid === user?.id)
          .map(d => ({
            // WARNING: Properties must be in the same order as the table headers in order to be able to sort them
            date: new Date(d.date),
            movement: Number(d.movement),
            type: getTransactionType(d),
            amount: Number(d.amount),
            profit: getTokenProfit({
              ...d,
              price: getTokenPrice(d, tokenData),
            }),
            rate: Math.abs(Number(d.movement) / Number(d.amount)),
            token: d.token,
            address: d.address,
            cost: Number(d.cost),
            price: getTokenPrice(d, tokenData),
          }))
          .sort((a, b) => b.date.getTime() - a.date.getTime()),
      );
    },
    [user, setTransactions],
  );

  const isLoading = useRef(false);
  useEffect(() => {
    if (isLoading.current || !needRefresh || page !== thisPage) return;

    isLoading.current = true;
    setNeedRefresh(false);

    // First load tokens
    loadData(DataName.token)
      .then(tokenData => {
        // Then load and process transactions with token data
        loadData(DataName.transactions)
          .then(data => processTransactions(data as Transaction[], tokenData as PortfolioToken[]))
          .then(() => fetch('/api/database/getTransactions'))
          .then(result => result.ok && result.json())
          .then(data => processTransactions(data, tokenData as PortfolioToken[]));
      })
      .catch(console.error)
      .finally(() => (isLoading.current = false));
  }, [needRefresh, setNeedRefresh, page, processTransactions]);

  const getFilteredTransactions = useCallback(
    (filters: TransactionFilter[]) => {
      const isDateSelected = (t: Transaction) =>
        selectedDates.includes(new Date(t.date).getFullYear().toString()) || !selectedDates.length;
      const isMovementSelected = (t: Transaction) =>
        selectedMovements.includes(String(t.movement.toClosestPowerOfTen())) || !selectedMovements.length;
      const isTypeSelected = (t: Transaction) => selectedType === TransactionType[t.type ?? -1] || !selectedType;

      const dateFilter = (filter: TransactionFilter) =>
        filter === TransactionFilter.date ? isDateSelected : () => true;
      const movementFilter = (filter: TransactionFilter) =>
        filter === TransactionFilter.movement ? isMovementSelected : () => true;
      const typeFilter = (filter: TransactionFilter) =>
        filter === TransactionFilter.type ? isTypeSelected : () => true;
      return filters.reduce(
        (filteredTransactions, filter) =>
          filteredTransactions?.filter(dateFilter(filter)).filter(movementFilter(filter)).filter(typeFilter(filter)),
        transactions?.filter(t => (costFilter ? t.cost < 0 : true)),
      );
    },
    [selectedDates, selectedMovements, selectedType, costFilter, transactions],
  );

  useEffect(() => {
    setDateFilter(
      getFilteredTransactions([TransactionFilter.movement, TransactionFilter.type])
        ?.map(({ date }) => new Date(date).getFullYear())
        .filter((v, i, a) => a.findIndex(t => t === v) === i),
    );
    setMovementFilter(
      getFilteredTransactions([TransactionFilter.date, TransactionFilter.type])
        ?.map(({ movement }) => movement.toClosestPowerOfTen())
        .filter((v, i, a) => a.findIndex(t => t === v) === i),
    );
    setTypeFilter(
      getFilteredTransactions([TransactionFilter.date, TransactionFilter.movement])?.filter(
        (v, i, a) => a.findIndex(t => t.type === v.type) === i,
      ),
    );
  }, [getFilteredTransactions]);

  const isDesktop = !useIsMobile(1024);

  return (
    <>
      {transactions?.length ? (
        <Card>
          <Flex align="center">
            <Title className="text-left whitespace-nowrap">{t.transactionSummary}</Title>
            <PrivacyButton />
          </Flex>

          <Table>
            <TableBody>
              {Object.values(TransactionType)
                .filter(v => typeof v !== 'number')
                .map(
                  (type, index) =>
                    transactions?.filter(t => t.type === index).length !== 0 && (
                      <TableRow
                        className="hover:bg-theme-background-subtle dark:hover:bg-dark-theme-background-subtle cursor-pointer"
                        onClick={() => {
                          setSelectedType(TransactionType[index]);
                          setCostFilter(false);
                        }}
                        key={type}
                      >
                        <TableCell>{t[type]}</TableCell>
                        <TableCell className="ml-4">{transactions?.filter(t => t.type === index).length}</TableCell>
                        <TableCell className="ml-4">
                          <Privacy
                            amount={transactions?.filter(t => t.type === index).reduce((a, b) => a + b.movement, 0)}
                          />
                        </TableCell>
                      </TableRow>
                    ),
                )}
              {transactions?.filter(t => t.cost < 0).length !== 0 && (
                <TableRow
                  className="hover:bg-theme-background-subtle dark:hover:bg-dark-theme-background-subtle cursor-pointer"
                  onClick={() => {
                    setSelectedType(undefined);
                    setCostFilter(true);
                  }}
                >
                  <TableCell>{t.cost}</TableCell>
                  <TableCell className="ml-4">{transactions?.filter(t => t.cost < 0).length}</TableCell>
                  <TableCell className="ml-4">
                    <Privacy amount={transactions?.filter(t => t.cost < 0).reduce((a, b) => a + b.cost, 0)} />
                  </TableCell>
                </TableRow>
              )}
              <TableRow
                className="font-bold hover:bg-theme-background-subtle dark:hover:bg-dark-theme-background-subtle cursor-pointer"
                onClick={() => {
                  setCostFilter(false);
                  setSelectedType(undefined);
                  setSelectedDates([]);
                  setSelectedMovements([]);
                }}
              >
                <TableCell>{t.total}</TableCell>
                <TableCell className="ml-4">{transactions?.length}</TableCell>
                <TableCell
                  className={twMerge(
                    'font-bold',
                    (transactions?.reduce((a, b) => a + b.movement, 0) ?? 0) >= 0 ? 'text-green-400' : 'text-red-400',
                  )}
                >
                  <Privacy amount={transactions?.reduce((a, b) => a + b.movement, 0)} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      ) : null}
      <Card>
        <Flex align="center">
          <Title className="text-left whitespace-nowrap">
            {!transactions || transactions.length ? t.transactionsHistoric : t.noTransactionFound}
          </Title>
          {!transactions || transactions.length ? <PrivacyButton /> : null}
        </Flex>
        {!transactions || transactions?.length ? (
          <>
            <Grid style={{ gap: '16px' }} className="mt-4" numItemsSm={2} numItemsLg={3}>
              <label htmlFor="searchDate" className="sr-only">
                {t.searchByDate}
              </label>
              {(dateFilter?.length ?? 0) > 1 ? (
                <MultiSelect
                  id="searchDate"
                  icon={IconSearch}
                  placeholder={t.selectTransactionDate}
                  placeholderSearch={t.search}
                  spellCheck={false}
                  value={selectedDates}
                  onValueChange={setSelectedDates}
                >
                  {dateFilter?.map(item => (
                    <MultiSelectItem key={item} value={String(item)}>
                      {String(item)}
                    </MultiSelectItem>
                  ))}
                </MultiSelect>
              ) : null}

              <label htmlFor="searchMovement" className="sr-only">
                {t.searchByMovement}
              </label>
              {(movementFilter?.length ?? 0) > 1 ? (
                <MultiSelect
                  id="searchMovement"
                  icon={IconSearch}
                  placeholder={t.selectTransactionMovement}
                  placeholderSearch={t.search}
                  spellCheck={false}
                  value={selectedMovements}
                  onValueChange={setSelectedMovements}
                >
                  {movementFilter
                    ?.sort((a, b) => Math.abs(a) - Math.abs(b))
                    .map(item => (
                      <MultiSelectItem key={item} value={String(item)}>
                        {`${item.toShortCurrency(0, '')} ${t.to} ${(item * 10).toShortCurrency()}`}
                      </MultiSelectItem>
                    ))}
                </MultiSelect>
              ) : null}

              <label htmlFor="searchType" className="sr-only">
                {t.searchByType}
              </label>
              {(typeFilter?.length ?? 0) > 1 ? (
                <Select
                  id="searchType"
                  icon={IconSearch}
                  enableClear={true}
                  placeholder={t.selectTransactionType}
                  spellCheck={false}
                  value={selectedType}
                  onValueChange={setSelectedType}
                >
                  {typeFilter?.map(
                    item =>
                      item.type !== undefined && (
                        <SelectItem key={item.type} value={TransactionType[item.type]}>
                          {t[TransactionType[item.type]]}
                        </SelectItem>
                      ),
                  )}
                </Select>
              ) : null}
            </Grid>
            <Table>
              <SortTableHead
                labels={[t.date, t.movement, t.type, t.token, t.profit, t.rate, t.price]}
                table={transactions}
                setTable={setTransactions}
                sizes={{ xs: 4, sm: 5, md: 6, lg: 7 }}
              />
              <TableBody>
                {transactions ? (
                  getFilteredTransactions([
                    TransactionFilter.date,
                    TransactionFilter.movement,
                    TransactionFilter.type,
                  ])?.map((transaction, index) => (
                    <TableRow
                      key={index}
                      className="group hover:bg-theme-background-subtle dark:hover:bg-dark-theme-background-subtle cursor-pointer lg:cursor-default"
                      onClick={
                        !isDesktop ? () => openPopup(<TransactionDetails transaction={transaction} />) : undefined
                      }
                    >
                      <TableCell>{transaction.date.toShortDate()}</TableCell>
                      <TableCell
                        className={twMerge('font-bold', transaction.movement >= 0 ? 'text-green-400' : 'text-red-400')}
                      >
                        <Flex align="center" className="flex-col sm:flex-row">
                          <Privacy amount={transaction.movement} currencyType="strict" />
                          {transaction.type === TransactionType.withdrawal && transaction.cost < 0 && (
                            <Icon
                              className="self-center"
                              icon={IconExclamationCircleFilled}
                              color="gray"
                              tooltip={t.withdrawalCost + ' : ' + transaction.cost.toLocaleCurrency()}
                            />
                          )}
                        </Flex>
                      </TableCell>
                      <TableCell>
                        <Flex className="flex-col sm:flex-row">
                          <Icon
                            className="group-hover:animate-pulse"
                            icon={getTransactionIcon(transaction)}
                            size="lg"
                            color={transaction.type === TransactionType.deposit ? 'green' : 'red'}
                          />
                          <Text className="self-center sm:ml-2">{t[TransactionType[transaction?.type ?? 0]]}</Text>
                        </Flex>
                      </TableCell>
                      <TableCell className="hidden xs:table-cell">
                        <Flex>
                          <Privacy amount={transaction.amount} currencyType="none" hideZero />
                          &nbsp;
                          {transaction.token}
                        </Flex>
                      </TableCell>
                      <TableCell
                        className={twMerge(
                          'hidden sm:table-cell font-bold',
                          Number(transaction.profit) >= 0 ? 'text-green-400' : 'text-red-400',
                        )}
                      >
                        <Privacy amount={transaction.profit} currencyType="strict" hideZero />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{getTokenRate(transaction)}</TableCell>
                      <TableCell className="hidden lg:table-cell">{getTokenCurrentRate(transaction)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      {t.transactionLoading}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </>
        ) : null}
      </Card>
    </>
  );
}
