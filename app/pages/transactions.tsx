import { HeartIcon, ArrowDownRightIcon, ArrowUpRightIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import {
  Card,
  Flex,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Title,
} from '@tremor/react';
import { useEffect, useRef, useState } from 'react';
import { useUser } from '../hooks/useUser';
import {} from '../utils/extensions';
import { DataName, loadData } from '../utils/processData';
import { Dataset } from '../utils/types';
import { isMobileSize } from '../utils/mobile';

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

interface Transaction {
  date: number;
  user: string;
  movement: number;
  cost: number;
  type: TransactionType;
}

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

        setTransactions(
          data
            .filter((d) => d.user === user.name)
            .map((d) => ({
              ...d,
              type:
                d.movement > 0
                  ? TransactionType.deposit
                  : d.cost <= 0
                    ? TransactionType.withdrawal
                    : TransactionType.donation,
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
          <TableHead>
            <TableRow>
              <TableHeaderCell className="w-1/3">{t.date}</TableHeaderCell>
              <TableHeaderCell className="w-1/3">{t.movement}</TableHeaderCell>
              <TableHeaderCell className="w-1/3">{t.type}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions?.length ? (
              transactions.map((transaction, index) => (
                <TableRow key={index} className={'hover:bg-gray-50'}>
                  <TableCell>{transaction.date}</TableCell>
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
