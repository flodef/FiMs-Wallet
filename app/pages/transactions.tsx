import { useEffect, useRef, useState } from 'react';
import {} from '../utils/extensions';
import { useUser } from '../hooks/useUser';
import { DataName, loadData } from '../utils/processData';
import { Dataset } from '../utils/types';
import { Card, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Title } from '@tremor/react';

const t: Dataset = {
  transactionList: 'Liste des transactions',
  date: 'Date',
  movement: 'Mouvement',
  cost: 'Coût',
  noTransactionFound: 'Aucune transaction trouvé',
  transactionLoading: 'Chargement des transactions...',
};

interface Transaction {
  date: number;
  user: string;
  movement: number;
  cost: number;
}

export default function Transactions() {
  const { user } = useUser();

  const [transactions, setTransactions] = useState<Transaction[] | undefined>();

  const loaded = useRef(false);
  useEffect(() => {
    if (user && !loaded.current) {
      loadData(DataName.transactions).then((data: Transaction[]) => {
        loaded.current = true;

        setTransactions(data.filter((d) => d.user === user.name));
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
              <TableHeaderCell className="w-1/3">{t.cost}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions?.length ? (
              transactions.map((transaction, index) => (
                <TableRow key={index} className={'hover:bg-gray-50'}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell className={(transaction.movement > 0 ? 'text-green-400' : 'text-red-400') + ' font-bold'}>
                    {transaction.movement.toLocaleCurrency()}
                  </TableCell>
                  <TableCell
                    className={
                      (transaction.cost > 0
                        ? 'text-green-400'
                        : transaction.cost < 0
                          ? 'text-red-400'
                          : 'text-gray-200') + ' font-bold'
                    }
                  >
                    {transaction.cost.toLocaleCurrency()}
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
