import { ArrowDownRightIcon, ArrowUpRightIcon, ExclamationCircleIcon, HeartIcon } from '@heroicons/react/24/solid';
import { Card, Flex, Icon, Table, TableBody, TableCell, TableRow, Text, Title } from '@tremor/react';
import { useEffect, useRef, useState } from 'react';
import SortTableHead from '../components/sortTableHead';
import { useUser } from '../hooks/useUser';
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

type Transaction = {
  [key: string]: number | string | undefined;
  date: number;
  movement: number;
  type: TransactionType;
  stringDate: string;
  cost: number;
  user?: string;
};

enum TransactionType {
  deposit,
  withdrawal,
  donation,
}

export default function Transactions() {
  const { user } = useUser();

  const [transactions, setTransactions] = useState<Transaction[] | undefined>();

  const loaded = useRef(false);
  useEffect(() => {
    if (user && !loaded.current) {
      loadData(DataName.transactions).then((data: Transaction[]) => {
        loaded.current = true;

        // WARNING: Properties must be in the same order as the table headers in order to be able to sort them
        setTransactions(
          data
            .filter((d) => d.user === user.name)
            .map((d) => ({
              date: d.date,
              movement: d.movement,
              type:
                d.movement > 0
                  ? TransactionType.deposit
                  : d.cost <= 0
                    ? TransactionType.withdrawal
                    : TransactionType.donation,
              stringDate: d.stringDate,
              cost: d.cost,
            }))
        );
      });
    }
  }, [user]);

  return (
    <>
      <Title>{t.transactionList}</Title>
      {/* <Search defaultValue={search} />  // TODO : Search by date */}
      <Card className="mt-6">
        <Table>
          <SortTableHead labels={[t.date, t.movement, t.type]} table={transactions} setTable={setTransactions} />
          <TableBody>
            {transactions?.length ? (
              transactions.map((transaction, index) => (
                <TableRow key={index} className={'hover:bg-gray-50'}>
                  <TableCell>{transaction.stringDate}</TableCell>
                  <TableCell className={(transaction.movement > 0 ? 'text-green-400' : 'text-red-400') + ' font-bold'}>
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
