import { Button } from '@tremor/react';
import { Flex, List } from 'antd';
import { Transaction, TransactionType } from '../hooks/useData';
import { usePopup } from '../hooks/usePopup';
import { getTokenLabel, getTokenRate } from '../pages/transactions';
import { Dataset } from '../utils/types';
import { Subtitle, Text, Title } from './typography';

const t: Dataset = {
  cost: 'Frais',
  date: 'Date',
  movement: 'Mouvement',
  token: 'Tokens',
  rate: "Taux d'échange",
  price: 'Taux courant',
  profit: 'Profit',
  deposit: 'Dépôt',
  withdrawal: 'Retrait',
  donation: 'Don',
  swap: 'Échange',
  payment: 'Paiement',
  from: 'du',
  close: 'Fermer',
};

export const TransactionDetails = ({ transaction }: { transaction: Transaction }) => {
  const { closePopup } = usePopup();

  const renderItem = (item: string) => {
    const data = {
      movement: transaction.movement,
      cost: transaction.cost,
      token: getTokenLabel(transaction),
      rate: getTokenRate(transaction),
      price: getTokenRate({ ...transaction, movement: transaction.price ?? 0, amount: 1 }),
      profit: transaction.profit,
    }[item];
    const label = typeof data === 'number' ? data.toLocaleCurrency(2, 2) : data;

    return data ? (
      <List.Item style={{ borderBlockEnd: '1px solid #333' }}>
        <Text>{t[item]}</Text>
        <Subtitle
          type={
            ['movement', 'cost', 'profit'].includes(item) && typeof data === 'number'
              ? data >= 0
                ? 'success'
                : 'danger'
              : undefined
          }
        >
          {label}
        </Subtitle>
      </List.Item>
    ) : null;
  };

  return (
    <Flex
      vertical
      className="w-full space-y-6 text-theme-content-emphasis dark:text-dark-theme-content-emphasis"
      justify="center"
      align="center"
    >
      <Title className="text-center mb-2">
        {t[TransactionType[transaction.type ?? 0]]} {t.from} {transaction.date.toShortDate()}
      </Title>
      <List
        className="max-w-xs w-full"
        dataSource={['movement'].concat(
          transaction.type !== TransactionType.donation ? ['cost', 'token', 'rate', 'price', 'profit'] : [],
        )}
        renderItem={renderItem}
      />
      <Flex justify="center" className="mt-6">
        <Button className="font-bold" style={{ borderRadius: 24 }} onClick={closePopup}>
          {t.close}
        </Button>
      </Flex>
    </Flex>
  );
};
