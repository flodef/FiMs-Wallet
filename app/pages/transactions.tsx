import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ArrowDownRightIcon, ArrowUpRightIcon, ExclamationCircleIcon, HeartIcon } from '@heroicons/react/24/solid';
import {
  Card,
  Flex,
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
  Text,
  Title,
} from '@tremor/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import SortTableHead from '../components/sortTableHead';
import { Page, useNavigation } from '../hooks/useNavigation';
import { useUser } from '../hooks/useUser';
import { cls } from '../utils/constants';
import {} from '../utils/extensions';
import { isMobileSize } from '../utils/mobile';
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
  search: 'Rechercher',
};

export enum TransactionType {
  deposit,
  withdrawal,
  donation,
  swap,
  payment,
}

enum TransactionFilter {
  date,
  movement,
  type,
}

export interface Transaction {
  id?: number;
  date: string;
  address?: string;
  movement: number;
  cost: number;
  userid?: number;
  type?: TransactionType;
  token?: string;
  amount?: number;
}

const thisPage = Page.Transactions;

export default function Transactions() {
  const { user } = useUser();
  const { page, needRefresh, setNeedRefresh } = useNavigation();

  const [transactions, setTransactions] = useState<Transaction[] | undefined>();
  const [selectedType, setSelectedType] = useState<string>();
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedMovements, setSelectedMovements] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<number[]>();
  const [movementFilter, setMovementFilter] = useState<number[]>();
  const [typeFilter, setTypeFilter] = useState<Transaction[]>();
  const [costFilter, setCostFilter] = useState(false);

  const processTransactions = useCallback(
    (data: Transaction[]) => {
      // WARNING: Properties must be in the same order as the table headers in order to be able to sort them
      setTransactions(
        data
          .filter(d => d.userid === user?.id)
          .map(d => ({
            date: new Date(d.date).toLocaleDateString(),
            movement: Number(d.movement),
            type:
              Number(d.movement) > 0
                ? TransactionType.deposit
                : Number(d.cost) <= 0
                  ? TransactionType.withdrawal
                  : TransactionType.donation,
            cost: Number(d.cost),
          })),
      );
    },
    [user],
  );

  const isLoading = useRef(false);
  useEffect(() => {
    if (isLoading.current || !needRefresh || page !== thisPage) return;

    isLoading.current = true;
    setNeedRefresh(false);

    // const data = fetch('/api/solana/getTransactions?address=' + user.address)
    //   .then(res => res.json())
    //   .then(data => {
    //     console.log(data);

    // return data.map((d: any) => ({
    //   date: d.date,
    //   movement: d.movement,
    //   type:
    //     d.movement > 0
    //       ? TransactionType.deposit
    //       : d.cost <= 0
    //         ? TransactionType.withdrawal
    //         : TransactionType.donation,
    //   stringDate: d.stringDate,
    //   cost: d.cost,
    // }));
    // });

    loadData(DataName.transactions)
      .then(processTransactions)
      .then(() => fetch('/api/database/getTransactions'))
      .then(result => (result.ok ? result.json() : undefined))
      .then(processTransactions)
      .catch(console.error)
      .finally(() => (isLoading.current = false));
  }, [needRefresh, setNeedRefresh, page, processTransactions]);

  const getFilteredTransactions = useCallback(
    (filters: TransactionFilter[]) => {
      const isTypeSelected = (t: Transaction) => selectedType === TransactionType[t.type ?? -1] || !selectedType;
      const isDateSelected = (t: Transaction) =>
        selectedDates.includes(new Date(t.date).getFullYear().toString()) || !selectedDates.length;
      const isMovementSelected = (t: Transaction) =>
        selectedMovements.includes(String(t.movement.toClosestPowerOfTen())) || !selectedMovements.length;
      return filters.reduce(
        (filteredTransactions, filter) =>
          filteredTransactions?.filter(
            filter === TransactionFilter.date
              ? isDateSelected
              : filter === TransactionFilter.movement
                ? isMovementSelected
                : filter === TransactionFilter.type
                  ? isTypeSelected
                  : () => true,
          ),
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

  return (
    <>
      {transactions?.length ? (
        <Card>
          <Title className="text-left whitespace-nowrap">{t.transactionSummary}</Title>
          <Table>
            <TableBody>
              {Object.values(TransactionType)
                .filter(v => typeof v !== 'number')
                .map(
                  (type, index) =>
                    transactions?.filter(t => t.type === index).length !== 0 && (
                      <TableRow
                        className="hover:bg-tremor-background-subtle dark:hover:bg-dark-tremor-background-subtle cursor-pointer"
                        onClick={() => {
                          setSelectedType(TransactionType[index]);
                          setCostFilter(false);
                        }}
                        key={index}
                      >
                        <TableCell>{t[type]}</TableCell>
                        <TableCell className="ml-4">{transactions?.filter(t => t.type === index).length}</TableCell>
                        <TableCell className="ml-4">
                          {transactions
                            ?.filter(t => t.type === index)
                            .reduce((a, b) => a + b.movement, 0)
                            .toLocaleCurrency()}
                        </TableCell>
                      </TableRow>
                    ),
                )}
              {transactions?.filter(t => t.cost < 0).length !== 0 && (
                <TableRow
                  className="hover:bg-tremor-background-subtle dark:hover:bg-dark-tremor-background-subtle cursor-pointer"
                  onClick={() => {
                    setSelectedType(undefined);
                    setCostFilter(true);
                  }}
                >
                  <TableCell>{t.cost}</TableCell>
                  <TableCell className="ml-4">{transactions?.filter(t => t.cost < 0).length}</TableCell>
                  <TableCell className="ml-4">
                    {transactions
                      ?.filter(t => t.cost < 0)
                      .reduce((a, b) => a + b.cost, 0)
                      .toLocaleCurrency()}
                  </TableCell>
                </TableRow>
              )}
              <TableRow
                className="font-bold hover:bg-tremor-background-subtle dark:hover:bg-dark-tremor-background-subtle cursor-pointer"
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
                  className={cls(
                    'font-bold',
                    transactions?.reduce((a, b) => a + b.movement, 0) ?? 0 >= 0 ? 'text-green-400' : 'text-red-400',
                  )}
                >
                  {transactions?.reduce((a, b) => a + b.movement, 0).toLocaleCurrency()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      ) : null}
      <Card>
        <Title className="text-left whitespace-nowrap">
          {!transactions || transactions.length ? t.transactionsHistoric : t.noTransactionFound}
        </Title>
        {!transactions || transactions?.length ? (
          <>
            <Grid style={{ gap: '16px' }} className="mt-4" numItemsSm={2} numItemsLg={3}>
              <label htmlFor="searchDate" className="sr-only">
                {t.searchByDate}
              </label>
              {(dateFilter?.length ?? 0) > 1 ? (
                <MultiSelect
                  id="searchDate"
                  icon={MagnifyingGlassIcon}
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
                  icon={MagnifyingGlassIcon}
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
                  icon={MagnifyingGlassIcon}
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
              <SortTableHead labels={[t.date, t.movement, t.type]} table={transactions} setTable={setTransactions} />
              <TableBody>
                {transactions ? (
                  getFilteredTransactions([
                    TransactionFilter.date,
                    TransactionFilter.movement,
                    TransactionFilter.type,
                  ])?.map((transaction, index) => (
                    <TableRow
                      key={index}
                      className="hover:bg-tremor-background-subtle dark:hover:bg-dark-tremor-background-subtle"
                    >
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell
                        className={cls('font-bold', transaction.movement >= 0 ? 'text-green-400' : 'text-red-400')}
                      >
                        <Flex justifyContent="start" alignItems="center" className="flex-col sm:flex-row">
                          {transaction.movement.toLocaleCurrency()}
                          {transaction.type === TransactionType.withdrawal && transaction.cost < 0 && (
                            <Icon
                              className="self-center"
                              icon={ExclamationCircleIcon}
                              color="gray"
                              tooltip={t.withdrawalCost + ' : ' + transaction.cost.toLocaleCurrency()}
                            />
                          )}
                        </Flex>
                      </TableCell>
                      <TableCell>
                        <Flex justifyContent="start" alignItems="start" className="flex-col sm:flex-row">
                          <Icon
                            className="sm:hover:animate-pulse cursor-pointer"
                            icon={
                              transaction.type === TransactionType.deposit
                                ? ArrowDownRightIcon
                                : transaction.type === TransactionType.withdrawal
                                  ? ArrowUpRightIcon
                                  : HeartIcon
                            }
                            tooltip={
                              isMobileSize()
                                ? transaction.type === TransactionType.deposit
                                  ? t.deposit
                                  : transaction.type === TransactionType.withdrawal
                                    ? t.withdrawal
                                    : t.donation
                                : undefined
                            }
                            size="lg"
                            color={transaction.type === TransactionType.deposit ? 'green' : 'red'}
                          />
                          {!isMobileSize() && (
                            <Text className="self-center sm:ml-4">
                              {transaction.type === TransactionType.deposit
                                ? t.deposit
                                : transaction.type === TransactionType.withdrawal
                                  ? t.withdrawal
                                  : t.donation}
                            </Text>
                          )}
                        </Flex>
                      </TableCell>
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
