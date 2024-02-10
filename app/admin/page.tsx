'use client';

import { CurrencyEuroIcon } from '@heroicons/react/24/solid';
import { PublicKey } from '@solana/web3.js';
import { Button, Card, DatePicker, Flex, Grid, NumberInput, Select, SelectItem, TextInput, Title } from '@tremor/react';
import { useEffect, useMemo, useState } from 'react';
import { User } from '../hooks/useUser';
import { useWindowParam } from '../hooks/useWindowParam';
import { TransactionType } from '../pages/transactions';
import { MinMax } from '../utils/types';

interface Transaction {
  date: Date;
  address: string;
  movement: number;
  cost: number;
}

const nameLimit: MinMax = { min: 5, max: 25 };
const addressLimit: MinMax = { min: 32, max: 44 };

export default function AdminPage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState(new Date());
  const [movement, setMovement] = useState(0);
  const [type, setType] = useState(TransactionType[TransactionType.deposit]);
  const [users, setUsers] = useState<User[]>();
  const [currentUser, setCurrentUser] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);

  useEffect(() => {
    fetch('/api/database/getUsers')
      .then(result => {
        if (result.ok) {
          result.json().then((users: User[] | { sourceError: { cause: { name: string } } }) => {
            if (!Array.isArray(users)) throw new Error(users.sourceError.cause.name);

            setUsers(users);
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  const addUser = () => {
    if (!isValidName || !isValidAddress) return;

    setUserLoading(true);

    fetch('/api/database/addUser', {
      method: 'POST',
      body: JSON.stringify({ name: name.normalize(), address: address, isPublic: false }),
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

    // Determine the cost based on the movement and type
    const t = TransactionType[type as keyof typeof TransactionType];
    const value = t === TransactionType.donation || TransactionType.withdrawal ? -movement : movement;
    const cost =
      t === TransactionType.donation ? movement : t === TransactionType.withdrawal ? (movement * 0.5) / 100 : 0;

    fetch('/api/database/addTransaction', {
      method: 'POST',
      body: JSON.stringify({ date: date, address: currentUser, movement: value, cost: cost }),
    })
      .then(result => {
        if (result.ok) {
          console.log('Transaction added');
          //TODO : Add a toast to notify the user

          setDate(new Date());
          setMovement(0);
          setType(TransactionType[TransactionType.deposit]);
          setCurrentUser('');
        }
      })
      .catch(error => {
        console.error(error);
      })
      .finally(() => {
        setTransactionLoading(false);
      });
  };

  const isValidName = useMemo(
    () => name.testLimit(nameLimit) && !users?.find(user => user.name === name),
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
  const isValidTransaction = useMemo(() => movement > 0 && currentUser, [movement, currentUser]);

  // TODO : Reload users if modified

  return (
    <Grid numItemsSm={2} numItemsLg={2} className="gap-6 mt-6 mr-12">
      <Card className="mx-6">
        <Title>Add User</Title>
        <Flex flexDirection="col" justifyContent="start" alignItems="start">
          <TextInput
            className="max-w-xs mt-4"
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
          <Select className="max-w-sm" value={type} onValueChange={setType} enableClear={false}>
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
          <Select className="max-w-sm" value={currentUser} onValueChange={setCurrentUser} enableClear={false}>
            {users?.map(user => (
              <SelectItem key={user.name} value={user.address}>
                {user.name.normalize()}
              </SelectItem>
            ))}
          </Select>
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
