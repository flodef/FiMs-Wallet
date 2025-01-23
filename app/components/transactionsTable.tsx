import { IconExclamationCircleFilled } from '@tabler/icons-react';
import { Icon, Table, TableBody, TableCell, TableRow } from '@tremor/react';
import { Flex } from 'antd';
import { twMerge } from 'tailwind-merge';
import { Transaction, TransactionType, useData } from '../hooks/useData';
import { getTokenCurrentRate, getTokenRate, getTransactionIcon } from '../pages/transactions';
import { useIsMobile } from '../utils/mobile';
import { Dataset } from '../utils/types';
import { Privacy } from './privacy';
import SortTableHead from './sortTableHead';
import { TransactionDetails } from './transactionDetails';
import { Text } from './typography';
import { usePopup } from '../hooks/usePopup';

const t: Dataset = {
  date: 'Date',
  movement: 'Mouvement',
  type: 'Type',
  token: 'Tokens',
  profit: 'Profit',
  rate: "Taux d'échange",
  price: 'Taux courant',
  withdrawalCost: 'Frais de retrait',
  noTransactions: 'Aucune transaction',
  transactionLoading: 'Chargement des transactions...',
};

interface TransactionsTableProps {
  getFilteredTransactions?: (transactions?: Transaction[] | undefined) => Transaction[] | undefined;
}

export function TransactionsTable({ getFilteredTransactions }: TransactionsTableProps) {
  const { transactions, setTransactions } = useData();
  const { openPopup } = usePopup();

  const isDesktop = !useIsMobile(1024);

  return (
    <Table>
      {transactions && getFilteredTransactions?.(transactions)?.length ? (
        <>
          <SortTableHead
            labels={[t.date, t.movement, t.type, t.token, t.profit, t.rate, t.price]}
            table={transactions}
            setTable={setTransactions}
            sizes={{ xs: 4, sm: 5, md: 6, lg: 7 }}
          />
          <TableBody>
            {getFilteredTransactions(transactions)?.map((transaction, index) => (
              <TableRow
                key={index}
                className="group hover:bg-theme-background-subtle dark:hover:bg-dark-theme-background-subtle cursor-pointer lg:cursor-default"
                onClick={!isDesktop ? () => openPopup(<TransactionDetails transaction={transaction} />) : undefined}
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
            ))}
          </TableBody>
        </>
      ) : (
        <TableBody>
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              {transactions ? t.noTransactions : t.transactionLoading}
            </TableCell>
          </TableRow>
        </TableBody>
      )}
    </Table>
  );
}
