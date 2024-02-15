'use client';

import { CurrencyEuroIcon } from '@heroicons/react/24/solid';
import { PublicKey } from '@solana/web3.js';
import {
  Button,
  Card,
  DatePicker,
  Flex,
  Grid,
  NumberInput,
  Select,
  SelectItem,
  Switch,
  Tab,
  TabGroup,
  TabList,
  Text,
  TextInput,
  Title,
} from '@tremor/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { User } from '../hooks/useUser';
import { PortfolioToken } from '../pages/portfolio';
import { Transaction, TransactionType } from '../pages/transactions';
import { cls } from '../utils/constants';
import { DataName, loadData } from '../utils/processData';
import { MinMax } from '../utils/types';

const transactionCost = 0.5;
const nameLimit: MinMax = { min: 5, max: 25 };
const addressLimit: MinMax = { min: 32, max: 44 };

export default function AdminPage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [date, setDate] = useState(new Date());
  const [hasCost, setHasCost] = useState(false);
  const [transactionType, setTransactionType] = useState(TransactionType[TransactionType.deposit]);
  const [users, setUsers] = useState<User[]>();
  const [transactions, setTransactions] = useState<Transaction[]>();
  const [transactionAddress, setTransactionAddress] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [tokens, setTokens] = useState<PortfolioToken[]>();
  const [selectedToken, setSelectedToken] = useState('');
  const [tokenAmount, setTokenAmount] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(0);

  useEffect(() => {
    fetch('/api/database/getUsers')
      .then(result => (result.ok ? result.json() : undefined))
      .then(setUsers)
      .catch(console.error);

    fetch('/api/database/getTransactions')
      .then(result => (result.ok ? result.json() : undefined))
      .then(setTransactions)
      .catch(console.error);

    loadData(DataName.token).then(setTokens);
  }, []);

  useEffect(() => {
    if (transactions && tokens) {
      const token = tokens.find(token => token.symbol === selectedToken);
      if (token) {
        setTokenPrice(token.value.toDecimalPlace(2, 'down'));
      }
    }
  }, [selectedToken, tokens, transactions]);

  const isTransactionType = useCallback(
    (type: TransactionType) => TransactionType[transactionType as keyof typeof TransactionType] === type,
    [transactionType],
  );

  const getTransactionDetails = useCallback(() => {
    const movement = tokenAmount * tokenPrice;
    const value = isTransactionType(TransactionType.deposit) ? movement : -movement;
    return {
      value: value,
      cost: isTransactionType(TransactionType.donation)
        ? -value
        : hasCost
          ? ((-movement * transactionCost) / 100).toDecimalPlace(2, 'down')
          : 0,
    };
  }, [hasCost, isTransactionType, tokenAmount, tokenPrice]);

  const addUser = () => {
    if (!isValidName || !isValidAddress) return;

    setUserLoading(true);

    fetch('/api/database/addUser', {
      method: 'POST',
      body: JSON.stringify({ name: name.normalize(), address: address, isPublic: isPublic }),
    })
      .then(result => {
        if (result.ok) {
          console.log('User added');
          //TODO : Add a toast to notify the user

          setName('');
          setAddress('');
        }
      })
      .catch(console.error)
      .finally(() => setUserLoading(false));
  };

  const addTransaction = () => {
    if (!isValidTransaction) return;

    setTransactionLoading(true);

    const { value, cost } = getTransactionDetails();

    fetch('/api/database/addTransaction', {
      method: 'POST',
      body: JSON.stringify({
        date: date,
        address: transactionAddress,
        movement: value,
        cost: cost,
        token: selectedToken,
        amount: tokenAmount,
        id: users?.find(user => user.address === transactionAddress)?.id,
      }),
    })
      .then(result => {
        if (result.ok) {
          console.log('Transaction added');
          //TODO : Add a toast to notify the user

          setDate(new Date());
          setTransactionType(TransactionType[TransactionType.deposit]);
          setTransactionAddress('');
          setSelectedToken('');
          setTokenAmount(0);
          setTokenPrice(0);
        }
      })
      .catch(console.error)
      .finally(() => setTransactionLoading(false));
  };

  const editTransaction = () => {
    //TODO : Add the edit transaction function
  };

  const isValidName = useMemo(
    () => name.testLimit(nameLimit) && !users?.find(user => user.name.toLowerCase() === name.toLowerCase()),
    [name, users],
  );
  const isValidAddress = useMemo(() => {
    if (!address.testLimit(addressLimit) || users?.find(user => user.address === address)) return false;
    try {
      const pubkey = new PublicKey(address);
      return PublicKey.isOnCurve(pubkey.toBuffer());
    } catch (error) {
      return false;
    }
  }, [address, users]);
  const isValidTransaction = useMemo(
    () => getTransactionDetails().value && transactionAddress,
    [getTransactionDetails, transactionAddress],
  );

  // TODO : Reload users if modified

  return (
    <Grid numItemsSm={2} numItemsLg={2} className="w-full max-w-7xl self-center gap-6 mt-6 pr-12">
      <Card className="mx-6">
        <Title>User</Title>
        <TabGroup>
          <TabList className="mt-4">
            <Tab>Add</Tab>
            <Tab disabled>Edit</Tab>
            <Tab disabled>Delete</Tab>
          </TabList>
        </TabGroup>
        <Flex className="p-4" flexDirection="col" justifyContent="start" alignItems="start">
          <TextInput
            className="max-w-xs"
            value={name}
            onValueChange={setName}
            placeholder="Name"
            error={!isValidName && name.length >= nameLimit.min}
            errorMessage={name.length <= nameLimit.max ? 'The name is already taken!' : 'The name is too long!'}
          />
          <TextInput
            className="max-w-md mt-4"
            value={address}
            onValueChange={setAddress}
            placeholder="Address"
            error={!isValidAddress && address.length >= addressLimit.min}
            errorMessage={
              address.length <= addressLimit.max
                ? users?.find(user => user.address === address)
                  ? 'The address is already taken!'
                  : 'The address is not a valid Solana Address!'
                : 'The address is too long!'
            }
          />
          <Flex className="space-6 gap-6 mt-4" flexDirection="row" justifyContent="start" alignItems="center">
            <Switch checked={isPublic} onChange={setIsPublic} />
            <Text>{isPublic ? 'Public' : 'Private'}</Text>
          </Flex>

          <Button
            className="flex font-bold self-center mt-4"
            disabled={!isValidName || !isValidAddress}
            style={{ borderRadius: 24 }}
            loading={userLoading}
            onClick={addUser}
          >
            Add User
          </Button>
        </Flex>
      </Card>

      <Card className="mx-6">
        <Title>Transaction</Title>
        <TabGroup>
          <TabList className="mt-4">
            <Tab>Add</Tab>
            <Tab disabled>Edit</Tab>
            <Tab disabled>Delete</Tab>
          </TabList>
        </TabGroup>
        <Flex className="p-4" flexDirection="col" justifyContent="start" alignItems="start">
          <Grid numItemsLg={2} numItemsMd={2} className="w-full gap-6">
            <DatePicker
              className="max-w-sm"
              value={date}
              onValueChange={value => setDate(new Date(value ?? ''))}
              minDate={new Date(2022, 1, 14)}
              maxDate={new Date()}
              displayFormat="dd/MM/yyyy"
              enableClear={false}
              enableYearNavigation={true}
              weekStartsOn={1}
            />
            <Select
              className="max-w-sm"
              value={transactionAddress}
              onValueChange={setTransactionAddress}
              enableClear={false}
            >
              {users?.map(user => (
                <SelectItem key={user.name} value={user.address}>
                  {user.name.normalize()}
                </SelectItem>
              ))}
            </Select>
          </Grid>
          <Grid numItemsLg={2} numItemsMd={2} className="w-full gap-6 mt-4">
            <Select className="max-w-sm" value={transactionType} onValueChange={setTransactionType} enableClear={false}>
              {Object.keys(TransactionType)
                .filter(key => isNaN(Number(key)))
                .map(type => (
                  <SelectItem key={type} value={type}>
                    {type.normalize()}
                  </SelectItem>
                ))}
            </Select>
            <Select className="max-w-sm" value={selectedToken} onValueChange={setSelectedToken} enableClear={false}>
              {tokens?.map(token => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  {token.symbol.normalize()}
                </SelectItem>
              ))}
            </Select>
          </Grid>
          <Grid numItemsLg={2} numItemsMd={2} className="w-full gap-6">
            <NumberInput
              className="max-w-sm mt-4"
              value={tokenAmount}
              onValueChange={setTokenAmount}
              onFocus={e => (e.target.value = '')}
              placeholder="Token Amount"
              step={1}
              min={0}
              max={10000}
            />
            <NumberInput
              className="max-w-sm mt-4"
              value={tokenPrice}
              onValueChange={setTokenPrice}
              onFocus={e => (e.target.value = '')}
              placeholder="Token Price"
              icon={CurrencyEuroIcon}
              step={1}
              min={0}
              max={10000}
            />
          </Grid>
          <Grid numItemsLg={2} numItemsMd={2} className="w-full gap-6 mt-4">
            <Flex
              className={cls(isTransactionType(TransactionType.donation) ? 'hidden' : 'visible', 'space-6 gap-6')}
              flexDirection="row"
              justifyContent="start"
              alignItems="center"
            >
              <Switch checked={hasCost} onChange={setHasCost} />
              <Text>{hasCost ? `Costs ${getTransactionDetails().cost.toLocaleCurrency()}` : 'Free'}</Text>
            </Flex>
            <Title>{getTransactionDetails().value.toCurrency()}</Title>
          </Grid>
          <Button
            className="flex font-bold self-center mt-4"
            disabled={!isValidTransaction}
            style={{ borderRadius: 24 }}
            loading={transactionLoading}
            onClick={addTransaction}
          >
            Add Transaction
          </Button>
        </Flex>
      </Card>
    </Grid>
  );
}
