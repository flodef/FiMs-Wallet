import { ArrowDownRightIcon, ArrowUpRightIcon, ExclamationCircleIcon, HeartIcon } from '@heroicons/react/24/solid';
import { Card, Flex, Icon, Table, TableBody, TableCell, TableRow, Text, Title } from '@tremor/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import SortTableHead from '../components/sortTableHead';
import { useUser } from '../hooks/useUser';
import { cls } from '../utils/constants';
import {} from '../utils/extensions';
import { isMobileSize } from '../utils/mobile';
import { DataName, loadData } from '../utils/processData';
import { Dataset } from '../utils/types';

const t: Dataset = {
  transactionList: 'Liste des transactions',
  date: 'Date',
  movement: 'Mouvement',
  type: 'Type',
  deposit: 'Dépôt',
  withdrawal: 'Retrait',
  donation: 'Don',
  noTransactionFound: 'Aucune transaction trouvé',
  transactionLoading: 'Chargement des transactions...',
  withdrawalCost: 'Frais de retrait',
};

export enum TransactionType {
  deposit,
  withdrawal,
  donation,
}

export interface Transaction {
  date: string;
  address?: string;
  movement: number;
  cost: number;
  id?: number;
  type?: TransactionType;
}

console.log(new Date().getTime());

export default function Transactions() {
  const { user } = useUser();

  const [transactions, setTransactions] = useState<Transaction[] | undefined>();

  const processTransactions = useCallback(
    (data: Transaction[]) => {
      // WARNING: Properties must be in the same order as the table headers in order to be able to sort them
      setTransactions(
        data
          .filter(d => d.id === user?.id)
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

  const loaded = useRef(false);
  useEffect(() => {
    if (user && !loaded.current) {
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
        .then(() => {
          fetch('/api/database/getTransactions').then(result => {
            if (result.ok) result.json().then(processTransactions);
          });
        })
        .catch(console.error)
        .finally(() => (loaded.current = true));
    }
  }, [user, processTransactions]);

  return (
    <>
      <Title className="text-left whitespace-nowrap">{t.transactionList}</Title>
      {/* <Search defaultValue={search} />  // TODO : Search by date */}
      <Card className="mt-6">
        <Table>
          <SortTableHead labels={[t.date, t.movement, t.type]} table={transactions} setTable={setTransactions} />
          <TableBody>
            {transactions?.length ? (
              transactions.map((transaction, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-tremor-background-subtle dark:hover:bg-dark-tremor-background-subtle"
                >
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell className={cls('font-bold', transaction.movement > 0 ? 'text-green-400' : 'text-red-400')}>
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
                  {transactions ? t.noTransactionFound : t.transactionLoading}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
