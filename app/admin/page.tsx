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
  Text,
  TextInput,
  Title,
} from '@tremor/react';
import { useEffect, useMemo, useState } from 'react';
import { User } from '../hooks/useUser';
import { Transaction, TransactionType } from '../pages/transactions';
import { MinMax } from '../utils/types';
import { cls } from '../utils/constants';

const transactionCost = 0.5;
const nameLimit: MinMax = { min: 5, max: 25 };
const addressLimit: MinMax = { min: 32, max: 44 };

export default function AdminPage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [date, setDate] = useState(new Date());
  const [movement, setMovement] = useState(0);
  const [hasCost, setHasCost] = useState(false);
  const [transactionType, setTransactionType] = useState(TransactionType[TransactionType.deposit]);
  const [users, setUsers] = useState<User[]>();
  const [transactions, setTransactions] = useState<Transaction[]>();
  const [transactionAddress, setTransactionAddress] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);

  useEffect(() => {
    fetch('/api/database/getUsers')
      .then(result => {
        if (result.ok) {
          result.json().then(setUsers);
        }
      })
      .catch(console.error);

    fetch('/api/database/getTransactions')
      .then(result => {
        if (result.ok) {
          result.json().then(setTransactions);
        }
      })
      .catch(console.error);
  }, []);

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
      .catch(error => {
        console.error(error);
      })
      .finally(() => {
        setUserLoading(false);
      });
  };

  const addTransaction = () => {
    if (!isValidTransaction) return;

    setTransactionLoading(true);

    const value = isTransactionType(TransactionType.deposit) ? movement : -movement;
    const cost = isTransactionType(TransactionType.donation)
      ? movement
      : hasCost
        ? ((-movement * transactionCost) / 100).toDecimalPlace(2, 'down')
        : 0;

    fetch('/api/database/addTransaction', {
      method: 'POST',
      body: JSON.stringify({
        date: date,
        address: transactionAddress,
        movement: value,
        cost: cost,
        id: users?.find(user => user.address === transactionAddress)?.id,
      }),
    })
      .then(result => {
        if (result.ok) {
          console.log('Transaction added');
          //TODO : Add a toast to notify the user

          setDate(new Date());
          setMovement(0);
          setTransactionType(TransactionType[TransactionType.deposit]);
          setTransactionAddress('');
        }
      })
      .catch(error => {
        console.error(error);
      })
      .finally(() => {
        setTransactionLoading(false);
      });
  };

  const isTransactionType = (type: TransactionType) =>
    TransactionType[transactionType as keyof typeof TransactionType] === type;
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
  const isValidTransaction = useMemo(() => movement > 0 && transactionAddress, [movement, transactionAddress]);

  // TODO : Reload users if modified

  return (
    <Grid
      numItemsSm={2}
      numItemsLg={2}
      className="flex-grow overflow-auto w-full max-w-7xl self-center gap-6 mt-6 pr-12"
    >
      <Card className="mx-6">
        <Title>Add User</Title>
        <Flex className='space-6 gap-6 p-4"' flexDirection="col" justifyContent="start" alignItems="start">
          <TextInput
            className="max-w-xs"
            value={name}
            onValueChange={setName}
            placeholder="Name"
            error={!isValidName && name.length >= nameLimit.min}
            errorMessage={name.length <= nameLimit.max ? 'The name is already taken!' : 'The name is too long!'}
          />
          <TextInput
            className="max-w-md"
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
          <Flex className="space-6 gap-6" flexDirection="row" justifyContent="start" alignItems="center">
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

      <Card className="mx-6 ">
        <Title>Add Transaction</Title>
        <Flex className="space-6 gap-6 p-4" flexDirection="col" justifyContent="start" alignItems="start">
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
          <Select className="max-w-sm" value={transactionType} onValueChange={setTransactionType} enableClear={false}>
            {Object.keys(TransactionType)
              .filter(key => isNaN(Number(key)))
              .map(type => (
                <SelectItem key={type} value={type}>
                  {type.normalize()}
                </SelectItem>
              ))}
          </Select>
          <NumberInput
            className="max-w-sm"
            value={movement}
            onValueChange={setMovement}
            onFocus={e => (e.target.value = '')}
            placeholder="Movement"
            icon={CurrencyEuroIcon}
            step={100}
            min={0}
            max={1000000}
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
          <Flex
            className={cls(isTransactionType(TransactionType.donation) ? 'hidden' : 'visible', 'space-6 gap-6')}
            flexDirection="row"
            justifyContent="start"
            alignItems="center"
          >
            <Switch checked={hasCost} onChange={setHasCost} />
            <Text>{hasCost ? `Costs ${((movement * transactionCost) / 100).toLocaleCurrency()}` : 'Free'}</Text>
          </Flex>
          <Button
            className="flex font-bold self-center"
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
