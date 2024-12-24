'use client';

import { IconCurrencyEuro } from '@tabler/icons-react';
import { PublicKey } from '@solana/web3.js';
import {
  Button,
  Card,
  DatePicker,
  Divider,
  Flex,
  Grid,
  NumberInput,
  Select,
  SelectItem,
  Switch,
  Tab,
  TabGroup,
  TabList,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  TextInput,
} from '@tremor/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { PortfolioToken, Transaction, TransactionType } from '../hooks/useData';
import Loading from '../loading';
import { getTransactionType } from '../pages/transactions';
import { DBUser } from '../pages/users';
import { getShortAddress } from '../utils/constants';
import {} from '../utils/extensions';
import { DataName, loadData } from '../utils/processData';
import { MinMax } from '../utils/types';
import { message } from 'antd';
import { Title } from '../components/typography';

const transactionCost = 0.5;
const nameLimit: MinMax = { min: 5, max: 25 };
const addressLimit: MinMax = { min: 32, max: 44 };
const actions = ['Add', 'Edit', 'Delete'];

const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  if (e.target.value === '0') e.target.value = '';
};

interface HeliusTransaction {
  from: string;
  to: string;
  amount: number;
  symbol: string;
  fee: number;
  feePayer: string;
  timestamp: number;
}

export default function AdminPage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [date, setDate] = useState(new Date());
  const [hasCost, setHasCost] = useState(false);
  const [transactionType, setTransactionType] = useState(TransactionType[TransactionType.deposit]);
  const [movement, setMovement] = useState(0);
  const [users, setUsers] = useState<DBUser[]>();
  const [transactions, setTransactions] = useState<Transaction[]>();
  const [transactionAddress, setTransactionAddress] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [tokens, setTokens] = useState<PortfolioToken[]>();
  const [selectedToken, setSelectedToken] = useState('');
  const [tokenAmount, setTokenAmount] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [userTabIndex, setUserTabIndex] = useState(0);
  const [transactionTabIndex, setTransactionTabIndex] = useState(0);
  const [userIndex, setUserIndex] = useState('0');
  const [transactionIndex, setTransactionIndex] = useState('0');
  const [transactionFilter, setTransactionFilter] = useState('0');
  const [cryptoTransactions, setCryptoTransactions] = useState<Transaction[]>();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const initUser = useCallback(() => {
    setName('');
    setAddress('');
    setIsPublic(false);
    if (userTabIndex && users?.length) setUserIndex(users?.at(0)?.id.toString() ?? '1'); // Init users on edit/delete only
  }, [userTabIndex, users]);

  const initTransaction = useCallback(() => {
    setDate(new Date());
    setTransactionAddress('');
    setTransactionType(TransactionType[TransactionType.deposit]);
    setSelectedToken('');
    setMovement(0);
    setTokenAmount(0);
    setTokenPrice(0);
    setHasCost(false);
    if (transactionTabIndex && transactions?.length)
      setTransactionIndex(transactions?.at(transactions.length - 1)?.id?.toString() ?? '1');
  }, [transactionTabIndex, transactions]);

  const loadUsers = () => {
    fetch('/api/database/getUsers')
      .then(result => (result.ok ? result.json() : undefined))
      .then(setUsers)
      .catch(console.error)
      .finally(initUser);
  };

  const loadTransactions = () => {
    fetch('/api/database/getTransactions')
      .then(result => (result.ok ? result.json() : undefined))
      .then(setTransactions)
      .catch(console.error)
      .finally(initTransaction);
  };

  useEffect(() => {
    if (location.hostname !== 'localhost') {
      location.href = `/`;
      return;
    }

    loadUsers();
    loadTransactions();
    loadData(DataName.token).then(tokens => setTokens(tokens as PortfolioToken[]));
    setIsAuthorized(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (transactions && tokens && !transactionTabIndex) {
      const token = tokens.find(token => token.symbol === selectedToken);
      setTokenPrice(token?.value.toDecimalPlace(2, 'down') ?? 0);
    }
  }, [selectedToken, tokens, transactions, transactionTabIndex]);

  useEffect(() => {
    const user = users?.find(user => user.id === Number(userIndex));
    if (!!user && !!userTabIndex) {
      setName(user.name);
      setAddress(user.address);
      setIsPublic(Boolean(user.ispublic));
    } else if (!userTabIndex) {
      initUser();
    }
  }, [userIndex, users, userTabIndex, initUser]);

  useEffect(() => {
    const transaction = transactions?.find(transaction => transaction.id === Number(transactionIndex));
    if (!!transaction && !!transactionTabIndex) {
      setDate(new Date(transaction.date));
      setTransactionAddress(transaction.address);
      setTransactionType(TransactionType[getTransactionType(transaction)]);
      setSelectedToken(transaction.token);
      setMovement(Number(transaction.movement));
      setTokenAmount(Number(transaction.amount ?? 0));
      setTokenPrice(
        Number(transaction.amount) ? Math.abs(Number(transaction.movement) / Number(transaction.amount)) : 0,
      );
      setHasCost(Number(transaction.cost) < 0);
    } else if (!transactionTabIndex) {
      initTransaction();
    }
  }, [transactionIndex, transactions, transactionTabIndex, initTransaction]);

  useEffect(() => {
    const filteredTransactions = transactions
      ?.filter(transaction => transactionFilter === '0' || transaction.userid === Number(transactionFilter))
      .sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    setTransactionIndex(filteredTransactions?.at(0)?.id?.toString() ?? '');

    const userAddress = users?.find(
      user => user.id === Number(transactionFilter) && user.name !== user.address,
    )?.address;
    setCryptoTransactions(userAddress ? [] : undefined);
    if (userAddress) {
      fetch('/api/solana/getTransactions?address=' + userAddress)
        .then(res => res.json())
        .then((data: HeliusTransaction[]) => {
          setCryptoTransactions(
            data.map((d: HeliusTransaction) => ({
              date: new Date(d.timestamp * 1000),
              address: [
                users.find(user => user.address === d.from)?.name ?? getShortAddress(d.from),
                users.find(user => user.address === d.to)?.name ?? getShortAddress(d.to),
              ].join(' -> '),
              movement: 0,
              cost: d.fee * (tokens?.find(token => token.symbol === 'SOL')?.value ?? 1),
              type: d.from === userAddress ? TransactionType.withdrawal : TransactionType.deposit,
              token: d.symbol,
              amount: d.amount,
            })),
          );
        })
        .catch(console.error);
    }
  }, [transactionFilter, transactions, users, tokens, transactionTabIndex]);

  const isTransactionType = useCallback(
    (type: TransactionType) => TransactionType[transactionType as keyof typeof TransactionType] === type,
    [transactionType],
  );

  const getTransactionDetails = useCallback(() => {
    const value = tokenAmount * tokenPrice;
    const isDonation = isTransactionType(TransactionType.donation);
    const cost = hasCost ? -((Math.abs(value) * transactionCost) / 100).toDecimalPlace(2, 'down') : 0;
    return {
      value: isDonation ? movement : value - cost,
      cost: isDonation ? movement : cost,
    };
  }, [hasCost, isTransactionType, tokenAmount, tokenPrice, movement]);

  const isValidName = useMemo(
    () =>
      name.testLimit(nameLimit) &&
      (!users?.find(user => user.name.toLowerCase() === name.toLowerCase()) ||
        (userTabIndex &&
          name.toLowerCase() === users?.find(user => user.id === Number(userIndex))?.name.toLowerCase())),
    [name, users, userTabIndex, userIndex],
  );
  const isValidAddress = useMemo(() => {
    if (
      !(
        address.testLimit(addressLimit) &&
        (!users?.find(user => user.address === address) ||
          (userTabIndex && address === users?.find(user => user.id === Number(userIndex))?.address))
      )
    )
      return false;
    try {
      const pubkey = new PublicKey(address);
      return PublicKey.isOnCurve(pubkey.toBuffer());
    } catch {
      return false;
    }
  }, [address, users, userTabIndex, userIndex]);
  const isValidTransaction = useMemo(
    () =>
      getTransactionDetails().value &&
      transactionAddress &&
      getTransactionDetails().value * tokenAmount >= 0 &&
      ((!!tokenPrice && !!tokenAmount) || (!tokenPrice && !tokenAmount)) &&
      ((!!selectedToken && !!tokenAmount) || (!selectedToken && !tokenAmount)),
    [getTransactionDetails, transactionAddress, tokenAmount, tokenPrice, selectedToken],
  );

  const updateUser = () => {
    if (!isValidName || !isValidAddress) return;

    setUserLoading(true);

    const action = actions[userTabIndex].toLowerCase();

    fetch(`/api/database/${action}User`, {
      method: 'POST',
      body: JSON.stringify({ name: name.toFirstUpperCase(), address: address, isPublic: isPublic, id: userIndex }),
    })
      .then(result => {
        if (result.ok) {
          messageApi.open({
            type: 'success',
            content: `User ${action}ed`,
          });

          loadUsers();
        }
      })
      .catch(console.error)
      .finally(() => setUserLoading(false));
  };

  const updateTransaction = () => {
    if (!isValidTransaction) return;

    setTransactionLoading(true);

    const action = actions[transactionTabIndex].toLowerCase();

    const { value, cost } = getTransactionDetails();
    const isDonation = isTransactionType(TransactionType.donation);

    fetch(`/api/database/${action}Transaction`, {
      method: 'POST',
      body: JSON.stringify({
        date: date,
        address: transactionAddress,
        movement: value.toFixed(2),
        cost: cost,
        userId: users?.find(user => user.address === transactionAddress)?.id,
        token: !isDonation ? selectedToken : '',
        amount: !isDonation ? tokenAmount : 0,
        id: transactionIndex,
      }),
    })
      .then(result => {
        if (result.ok) {
          messageApi.open({
            type: 'success',
            content: `Transaction ${action}ed`,
          });

          loadTransactions();
        }
      })
      .catch(console.error)
      .finally(() => setTransactionLoading(false));
  };

  return isAuthorized ? (
    <Grid style={{ gap: 24, margin: 24 }} numItemsSm={2} className="w-full max-w-7xl self-center px-6">
      {contextHolder}
      <Card>
        <Title>User</Title>
        <TabGroup
          className={twMerge('mt-4', users?.length ? 'visible' : 'hidden')}
          index={userTabIndex}
          onIndexChange={setUserTabIndex}
        >
          <TabList>
            {actions.map(action => (
              <Tab key={action}>{action}</Tab>
            ))}
          </TabList>
        </TabGroup>
        <Flex className={twMerge('mt-4', userTabIndex ? 'visible' : 'hidden')} flexDirection="col">
          <Select value={userIndex} onValueChange={setUserIndex} enableClear={false}>
            {users
              ?.sort((a, b) => a.id - b.id)
              .map(({ id, name }) => (
                <SelectItem key={id} value={String(id)}>
                  {id + ' - ' + name}
                </SelectItem>
              ))}
          </Select>
          <Divider />
        </Flex>
        <Flex
          style={{ gap: 16 }}
          className={!userTabIndex ? 'mt-4' : ''}
          flexDirection="col"
          justifyContent="start"
          alignItems="start"
        >
          <TextInput
            className="max-w-xs"
            value={name}
            onValueChange={setName}
            placeholder="Name"
            disabled={userTabIndex === 2}
            error={!isValidName && name.length >= nameLimit.min}
            errorMessage={name.length <= nameLimit.max ? 'The name is already taken!' : 'The name is too long!'}
          />
          <TextInput
            className="max-w-md"
            value={address}
            onValueChange={setAddress}
            placeholder="Address"
            disabled={userTabIndex === 2}
            error={!isValidAddress && address.length >= addressLimit.min}
            errorMessage={
              address.length <= addressLimit.max
                ? users?.find(user => user.address === address)
                  ? 'The address is already taken!'
                  : 'The address is not a valid Solana Address!'
                : 'The address is too long!'
            }
          />
          <Flex
            className={twMerge(userTabIndex !== 2 ? 'visible' : 'hidden', 'space-x-2')}
            flexDirection="row"
            justifyContent="start"
            alignItems="center"
          >
            <Switch checked={isPublic} onChange={setIsPublic} disabled={userTabIndex === 2} />
            <Text>{isPublic ? 'Public' : 'Private'}</Text>
          </Flex>

          <Button
            className="flex font-bold self-center"
            disabled={!isValidName || !isValidAddress}
            style={{ borderRadius: 24 }}
            loading={userLoading}
            onClick={updateUser}
          >
            {actions[userTabIndex]} User
          </Button>
        </Flex>
      </Card>

      <Card>
        <Title>Transaction</Title>
        <TabGroup
          className={twMerge('mt-4', transactions?.length ? 'visible' : 'hidden')}
          index={transactionTabIndex}
          onIndexChange={setTransactionTabIndex}
        >
          <TabList>
            {actions.map(action => (
              <Tab key={action}>{action}</Tab>
            ))}
          </TabList>
        </TabGroup>
        <Flex style={{ gap: 16 }} className={twMerge('mt-4', transactionTabIndex ? 'visible' : 'hidden')}>
          <Select
            style={{ minWidth: 125, maxWidth: 125, width: 125 }}
            value={transactionFilter}
            onValueChange={setTransactionFilter}
            enableClear={false}
          >
            {users
              ?.concat({ id: 0, name: 'All', address: '', ispublic: false })
              .sort((a, b) => a.id - b.id)
              .map(({ id, name }) => (
                <SelectItem key={id} value={String(id)}>
                  {name}
                </SelectItem>
              ))}
          </Select>
          <Select
            className={transactionIndex ? 'visible' : 'hidden'}
            value={transactionIndex}
            onValueChange={setTransactionIndex}
            enableClear={false}
          >
            {transactions
              ?.filter(transaction => transactionFilter === '0' || transaction.userid === Number(transactionFilter))
              .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
              .map(({ id, movement, cost }) => (
                <SelectItem key={id} value={String(id)}>
                  {id +
                    ' - ' +
                    TransactionType[getTransactionType({ movement, cost })].toFirstUpperCase() +
                    ' - ' +
                    Math.abs(movement).toCurrency()}
                </SelectItem>
              ))}
          </Select>
        </Flex>
        <Divider className={transactionTabIndex && transactionIndex ? 'visible' : 'hidden'} />
        <Grid
          style={{ gap: 16 }}
          className={twMerge(
            !transactionTabIndex ? 'mt-4' : '',
            transactionIndex || !transactionTabIndex ? 'visible' : 'hidden',
          )}
          numItemsSm={1}
          numItemsLg={1}
          numItemsMd={1}
        >
          <DatePicker
            className="max-w-sm min-w-32"
            value={date}
            onValueChange={value => setDate(new Date(value ?? ''))}
            minDate={new Date(2022, 1, 14)}
            maxDate={new Date()}
            displayFormat="dd/MM/yyyy"
            enableClear={false}
            enableYearNavigation={true}
            weekStartsOn={1}
            disabled={transactionTabIndex === 2}
          />
          <Select
            className="max-w-sm min-w-32"
            value={transactionAddress}
            onValueChange={setTransactionAddress}
            enableClear={false}
            disabled={transactionTabIndex === 2}
          >
            {users?.map(({ name, address }) => (
              <SelectItem key={name} value={address}>
                {name.toFirstUpperCase()}
              </SelectItem>
            ))}
          </Select>
          <Select
            className="max-w-sm min-w-32"
            value={transactionType}
            onValueChange={setTransactionType}
            enableClear={false}
            disabled={transactionTabIndex === 2}
          >
            {Object.keys(TransactionType)
              .filter(key => isNaN(Number(key)))
              .map(type => (
                <SelectItem key={type} value={type}>
                  {type.toFirstUpperCase()}
                </SelectItem>
              ))}
          </Select>
          <NumberInput
            className={twMerge('max-w-sm min-w-32', isTransactionType(TransactionType.donation) ? 'visible' : 'hidden')}
            value={movement}
            onValueChange={setMovement}
            onFocus={handleFocus}
            placeholder="Movement"
            error={isTransactionType(TransactionType.donation) && movement <= 0}
            errorMessage={`The movement should be positive!`}
            icon={IconCurrencyEuro}
            step={1}
            min={0}
            max={100000}
            disabled={transactionTabIndex === 2}
          />
          <Select
            className={twMerge(
              'max-w-sm min-w-32',
              !isTransactionType(TransactionType.donation) ? 'visible' : 'hidden',
            )}
            value={selectedToken}
            onValueChange={setSelectedToken}
            enableClear={false}
            disabled={transactionTabIndex === 2}
            error={(!!tokenAmount || !!tokenPrice) && !selectedToken}
            errorMessage="The token should be set!"
          >
            {tokens?.map(({ symbol }) => (
              <SelectItem key={symbol} value={symbol}>
                {symbol.toFirstUpperCase()}
              </SelectItem>
            ))}
          </Select>
          <NumberInput
            className={twMerge(
              'max-w-sm min-w-32',
              !isTransactionType(TransactionType.donation) ? 'visible' : 'hidden',
            )}
            value={tokenAmount}
            onValueChange={setTokenAmount}
            onFocus={handleFocus}
            placeholder="Token Amount"
            error={
              (transactionType === 'deposit' && tokenAmount < 0) ||
              (transactionType === 'withdrawal' && tokenAmount > 0)
            }
            errorMessage={`The token amount should be ${tokenAmount > 0 ? 'negative' : 'positive'}!`}
            step={1}
            min={-100000}
            max={100000}
            disabled={transactionTabIndex === 2}
          />
          <NumberInput
            className={twMerge(
              'max-w-sm min-w-32',
              !isTransactionType(TransactionType.donation) ? 'visible' : 'hidden',
            )}
            value={tokenPrice.toFixed(3)}
            onValueChange={setTokenPrice}
            onFocus={handleFocus}
            placeholder="Token Price"
            icon={IconCurrencyEuro}
            step={0.001}
            min={0}
            max={10000}
            disabled={transactionTabIndex === 2}
            error={(!!tokenAmount && !tokenPrice) || (!tokenAmount && !!tokenPrice)}
            errorMessage="The token price / amount should be set!"
          />
          <Flex
            className={twMerge(
              'max-w-sm min-w-32 space-x-2',
              !isTransactionType(TransactionType.donation) ? 'visible' : 'hidden',
            )}
            flexDirection="row"
            justifyContent="start"
            alignItems="center"
          >
            <Switch
              className={transactionTabIndex !== 2 ? 'visible' : 'hidden'}
              checked={hasCost}
              onChange={setHasCost}
            />
            <Text>{hasCost ? `Costs ${getTransactionDetails().cost.toLocaleCurrency()}` : 'Free'}</Text>
          </Flex>
          <Title className={isValidTransaction ? 'visible' : 'hidden'}>
            {!isNaN(getTransactionDetails().value) ? getTransactionDetails().value.toCurrency() : 'Error'}
          </Title>
          <Button
            className="flex font-bold col-span-2"
            disabled={!isValidTransaction}
            style={{ borderRadius: 24, justifySelf: 'center' }}
            loading={transactionLoading}
            onClick={updateTransaction}
          >
            {actions[transactionTabIndex]} Transaction
          </Button>
        </Grid>
      </Card>
      <Card className={twMerge('col-span-2', cryptoTransactions ? 'visible' : 'hidden')}>
        <Title>Crypto Transactions</Title>
        <Table className="w-full">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Address</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Token</TableHeaderCell>
              <TableHeaderCell>Cost</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cryptoTransactions?.length ? (
              cryptoTransactions.map(({ date, address, type, token, amount, cost }) => (
                <TableRow key={new Date(date).getTime()}>
                  <TableCell>{date.toLocaleString()}</TableCell>
                  <TableCell>{address}</TableCell>
                  <TableCell>{type !== undefined ? TransactionType[type].toFirstUpperCase() : ''}</TableCell>
                  <TableCell>
                    {amount?.toFixed(2)} {token}
                  </TableCell>
                  <TableCell>{cost.toLocaleCurrency()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="text-center" colSpan={5}>
                  Loading ...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </Grid>
  ) : (
    <Loading />
  );
}
