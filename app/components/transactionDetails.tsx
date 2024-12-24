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
  rate: 'Taux',
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
        dataSource={['movement'].concat(transaction.type !== TransactionType.donation ? ['cost', 'token', 'rate'] : [])}
        renderItem={item =>
          transaction[item] ? (
            <List.Item style={{ borderBlockEnd: '1px solid #333' }}>
              <Text>{t[item]}</Text>
              <Subtitle
                type={
                  item !== 'token' && item !== 'rate' && !isNaN(Number(transaction[item]))
                    ? Number(transaction[item]) >= 0
                      ? 'success'
                      : 'danger'
                    : undefined
                }
                // className={twMerge(
                //   'font-bold',
                //   item !== 'token' && item !== 'rate' && !isNaN(Number(transaction[item]))
                //     ? Number(transaction[item]) >= 0
                //       ? 'text-green-400'
                //       : 'text-red-400'
                //     : 'text-theme-content-emphasis dark:text-dark-theme-content-emphasis',
                // )}
              >
                {item === 'token'
                  ? getTokenLabel(transaction)
                  : item === 'rate'
                    ? getTokenRate(transaction)
                    : isNaN(Number(transaction[item]))
                      ? String(transaction[item])
                      : Number(transaction[item]).toLocaleCurrency()}
              </Subtitle>
            </List.Item>
          ) : null
        }
      />
      <Flex justify="center" className="mt-6">
        <Button className="font-bold" style={{ borderRadius: 24 }} onClick={closePopup}>
          {t.close}
        </Button>
      </Flex>
    </Flex>
  );
};
