import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconCreditCardPay,
  IconHeartFilled,
  IconSearch,
} from '@tabler/icons-react';
import {
  Grid,
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
import { TransactionsTable } from '../components/transactionsTable';
import { Title } from '../components/typography';
import { PortfolioToken, Transaction, TransactionType, useData } from '../hooks/useData';
import { Page, useNavigation } from '../hooks/useNavigation';
import { useUser } from '../hooks/useUser';
import { convertedData, DataName, loadData } from '../utils/processData';
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
  selectTransactionToken: 'Sélectionner un jeton',
  to: 'à',
  from: 'du',
  search: 'Rechercher',
};

enum TransactionFilter {
  date,
  movement,
  type,
  token,
}

export const getTransactionType = (transaction: Transaction | { movement: number | string; cost: number | string }) => {
  const isSpecialTransaction = Math.abs(Number(transaction.movement) - Number(transaction.cost)) < 0.01;
  const depositType = isSpecialTransaction ? TransactionType.donation : TransactionType.deposit;
  const withdrawalType = isSpecialTransaction ? TransactionType.payment : TransactionType.withdrawal;
  return Number(transaction.movement) > 0 ? depositType : withdrawalType;
};
export const isDonationOrPayment = (transactionType: TransactionType) =>
  transactionType === TransactionType.donation || transactionType === TransactionType.payment;
export const getTransactionIcon = (transaction: Transaction) => {
  return {
    deposit: IconArrowDownRight,
    withdrawal: IconArrowUpRight,
    donation: IconHeartFilled,
    payment: IconCreditCardPay,
  }[transaction.type || 'deposit'];
};
export const getTokenLabel = (transaction: Transaction) =>
  transaction.token && `${transaction.amount} ${transaction.token}`;
export const getTokenRate = (transaction: Transaction) =>
  transaction.token && transaction.movement && transaction.amount
    ? `1 ${transaction.token} = ${Math.abs(Number(transaction.movement) / Number(transaction.amount)).toLocaleCurrency()}`
    : undefined;
export const getTokenCurrentRate = (transaction: Transaction) =>
  getTokenRate({ ...transaction, movement: transaction.price ?? 0, amount: 1 });

const getTokenPrice = (transaction: Transaction, tokens: PortfolioToken[]) =>
  tokens.find(t => t.symbol === transaction.token)?.value;
const getTokenProfit = (transaction: Transaction) =>
  isDonationOrPayment(getTransactionType(transaction)) || !transaction.token
    ? 0
    : (transaction.price ?? 0) * (transaction.amount ?? 0) - transaction.movement - transaction.cost;

export const loadTransactionData = async (
  tokens: PortfolioToken[],
  userId: number,
  transactions: Transaction[] | undefined,
  setTransactions: (transactions: Transaction[] | undefined) => void,
) => {
  const storeTransactions = (data: convertedData[]) => {
    const tx = (data as Transaction[]).filter(d => d.userid === userId);

    if (!transactions || tx.length > transactions.length)
      setTransactions(
        tx
          .map(d => ({
            // WARNING: Properties must be in the same order as the table headers in order to be able to sort them
            date: new Date(d.date), // Date is a string, so we need to convert it to a Date object to be able to use it in the table
            movement: Number(d.movement),
            type: getTransactionType(d),
            amount: Number(d.amount),
            profit: getTokenProfit({
              ...d,
              price: getTokenPrice(d, tokens),
            }),
            rate: Math.abs(Number(d.movement) / Number(d.amount)),
            token: d.token,
            address: d.address,
            userid: d.userid,
            cost: !isDonationOrPayment(getTransactionType(d)) ? Number(d.cost) : 0,
            price: !isDonationOrPayment(getTransactionType(d)) ? getTokenPrice(d, tokens) : 0,
          }))
          .sort((a, b) => b.date.getTime() - a.date.getTime()),
      );
  };

  // Only load initial data if transactions are empty
  const loadInitialData = !transactions?.length
    ? loadData(DataName.transactions).then(storeTransactions)
    : Promise.resolve();

  // Then load transactions from the api (most recent)
  return loadInitialData
    .then(() => fetch('/api/database/getTransactions'))
    .then(result => result.ok && result.json())
    .then(data => storeTransactions(data))
    .catch(console.error);
};

const thisPage = Page.Transactions;

export default function Transactions() {
  const { user } = useUser();
  const { page, needRefresh, setNeedRefresh } = useNavigation();

  const { transactions, setTransactions } = useData();

  const [selectedType, setSelectedType] = useState<string>();
  const [selectedToken, setSelectedToken] = useState<string>();
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedMovements, setSelectedMovements] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<number[]>();
  const [movementFilter, setMovementFilter] = useState<number[]>();
  const [typeFilter, setTypeFilter] = useState<Transaction[]>();
  const [tokenFilter, setTokenFilter] = useState<Transaction[]>();
  const [costFilter, setCostFilter] = useState(false);

  const isLoading = useRef(false);
  useEffect(() => {
    if (!user || isLoading.current || !needRefresh || page !== thisPage) return;

    isLoading.current = true;
    setNeedRefresh(false);

    loadData(DataName.tokens)
      .then(tokens => {
        loadTransactionData(tokens as PortfolioToken[], user.id, transactions, setTransactions);
      })
      .catch(console.error)
      .finally(() => (isLoading.current = false));
  }, [needRefresh, setNeedRefresh, page, setTransactions, user, transactions]);

  const getFilteredTransactions = useCallback(
    (
      tx: Transaction[] | undefined = transactions,
      filters = [TransactionFilter.date, TransactionFilter.movement, TransactionFilter.type, TransactionFilter.token],
    ) => {
      const isDateSelected = (t: Transaction) =>
        selectedDates.includes(new Date(t.date).getFullYear().toString()) || !selectedDates.length;
      const isMovementSelected = (t: Transaction) =>
        selectedMovements.includes(String(t.movement.toClosestPowerOfTen())) || !selectedMovements.length;
      const isTypeSelected = (t: Transaction) => selectedType === t.type || !selectedType;
      const isTokenSelected = (t: Transaction) => selectedToken === t.token || !selectedToken;

      const dateFilter = (filter: TransactionFilter) =>
        filter === TransactionFilter.date ? isDateSelected : () => true;
      const movementFilter = (filter: TransactionFilter) =>
        filter === TransactionFilter.movement ? isMovementSelected : () => true;
      const typeFilter = (filter: TransactionFilter) =>
        filter === TransactionFilter.type ? isTypeSelected : () => true;
      const tokenFilter = (filter: TransactionFilter) =>
        filter === TransactionFilter.token ? isTokenSelected : () => true;
      return filters.reduce(
        (filteredTransactions, filter) =>
          filteredTransactions
            ?.filter(dateFilter(filter))
            .filter(movementFilter(filter))
            .filter(typeFilter(filter))
            .filter(tokenFilter(filter)),
        tx?.filter(t => (costFilter ? t.cost < 0 : true)),
      );
    },
    [selectedDates, selectedMovements, selectedType, selectedToken, costFilter, transactions],
  );

  useEffect(() => {
    setDateFilter(
      getFilteredTransactions(transactions, [
        TransactionFilter.movement,
        TransactionFilter.type,
        TransactionFilter.token,
      ])
        ?.map(({ date }) => new Date(date).getFullYear())
        .filter((v, i, a) => a.findIndex(t => t === v) === i),
    );
    setMovementFilter(
      getFilteredTransactions(transactions, [TransactionFilter.date, TransactionFilter.type, TransactionFilter.token])
        ?.map(({ movement }) => movement.toClosestPowerOfTen())
        .filter((v, i, a) => a.findIndex(t => t === v) === i),
    );
    setTypeFilter(
      getFilteredTransactions(transactions, [
        TransactionFilter.date,
        TransactionFilter.movement,
        TransactionFilter.token,
      ])?.filter((v, i, a) => a.findIndex(t => t.type === v.type) === i),
    );
    setTokenFilter(
      getFilteredTransactions(transactions, [
        TransactionFilter.date,
        TransactionFilter.movement,
        TransactionFilter.type,
      ])?.filter((v, i, a) => a.findIndex(t => t.token === v.token) === i),
    );
  }, [getFilteredTransactions, transactions]);

  return (
    <Flex vertical className="gap-6">
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
                  type =>
                    getFilteredTransactions()?.filter(t => t.type === type).length !== 0 && (
                      <TableRow
                        className="hover:bg-theme-background-subtle dark:hover:bg-dark-theme-background-subtle cursor-pointer"
                        onClick={() => {
                          setSelectedType(type);
                          setCostFilter(false);
                        }}
                        key={type}
                      >
                        <TableCell>{t[type]}</TableCell>
                        <TableCell>{getFilteredTransactions()?.filter(t => t.type === type).length}</TableCell>
                        <TableCell>
                          <Privacy
                            amount={getFilteredTransactions()
                              ?.filter(t => t.type === type)
                              .reduce((a, b) => a + b.movement, 0)}
                            currencyType="strict"
                          />
                        </TableCell>
                      </TableRow>
                    ),
                )}
              {selectedType !== TransactionType.donation && (
                <TableRow className="hover:bg-theme-background-subtle dark:hover:bg-dark-theme-background-subtle">
                  <TableCell>{t.profit}</TableCell>
                  <TableCell>{getFilteredTransactions()?.length}</TableCell>
                  <TableCell
                    className={twMerge(
                      'font-bold',
                      (getFilteredTransactions()?.reduce((a, b) => a + (b.profit ?? 0), 0) ?? 0) >= 0
                        ? 'text-ok'
                        : 'text-error',
                    )}
                  >
                    <Privacy
                      amount={getFilteredTransactions()?.reduce((a, b) => a + (b.profit ?? 0), 0)}
                      currencyType="strict"
                    />
                  </TableCell>
                </TableRow>
              )}
              {getFilteredTransactions()?.filter(t => t.cost < 0).length !== 0 && (
                <TableRow
                  className="hover:bg-theme-background-subtle dark:hover:bg-dark-theme-background-subtle cursor-pointer"
                  onClick={() => {
                    setSelectedType(undefined);
                    setCostFilter(true);
                  }}
                >
                  <TableCell>{t.cost}</TableCell>
                  <TableCell>{getFilteredTransactions()?.filter(t => t.cost < 0).length}</TableCell>
                  <TableCell>
                    <Privacy
                      amount={getFilteredTransactions()
                        ?.filter(t => t.cost < 0)
                        .reduce((a, b) => a + b.cost, 0)}
                      currencyType="strict"
                    />
                  </TableCell>
                </TableRow>
              )}
              <TableRow
                className={twMerge(
                  'font-bold cursor-pointer',
                  'text-theme-content-emphasis dark:text-dark-theme-content-emphasis',
                  'hover:bg-theme-background-subtle dark:hover:bg-dark-theme-background-subtle',
                )}
                onClick={() => {
                  setCostFilter(false);
                  setSelectedType('');
                  setSelectedDates([]);
                  setSelectedMovements([]);
                  setSelectedToken('');
                }}
              >
                <TableCell>{t.total}</TableCell>
                <TableCell>{getFilteredTransactions()?.length}</TableCell>
                <TableCell>
                  <Privacy
                    amount={getFilteredTransactions()
                      ?.filter(t => selectedType === TransactionType.donation || t.cost <= 0)
                      .reduce(
                        (a, b) =>
                          a + b.movement + (b.profit ?? 0) + (selectedType !== TransactionType.donation ? b.cost : 0),
                        0,
                      )}
                    currencyType="strict"
                  />
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

              <label htmlFor="searchToken" className="sr-only">
                {t.searchByToken}
              </label>
              {(tokenFilter?.length ?? 0) > 1 ? (
                <Select
                  id="searchToken"
                  icon={IconSearch}
                  enableClear={true}
                  placeholder={t.selectTransactionToken}
                  spellCheck={false}
                  value={selectedToken}
                  onValueChange={setSelectedToken}
                >
                  {tokenFilter?.map(
                    item =>
                      item.token !== undefined && (
                        <SelectItem key={item.token} value={item.token}>
                          {item.token}
                        </SelectItem>
                      ),
                  )}
                </Select>
              ) : null}
            </Grid>
            <TransactionsTable getFilteredTransactions={getFilteredTransactions} />
          </>
        ) : null}
      </Card>
    </Flex>
  );
}
