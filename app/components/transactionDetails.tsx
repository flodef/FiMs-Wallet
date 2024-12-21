import { Button, Flex, List, ListItem } from '@tremor/react';
import { twMerge } from 'tailwind-merge';
import { Transaction, TransactionType } from '../hooks/useData';
import { usePopup } from '../hooks/usePopup';
import { getTokenLabel, getTokenRate } from '../pages/transactions';
import { Dataset } from '../utils/types';
import { Title } from './typography';

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
    <div className="w-full space-y-6 text-center text-theme-content-emphasis dark:text-dark-theme-content-emphasis">
      <Title className="text-center mb-2">
        {t[TransactionType[transaction.type ?? 0]]} {t.from} {transaction.date.toShortDate()}
      </Title>
      <List className="max-w-xs mx-auto">
        {['movement']
          .concat(transaction.type !== TransactionType.donation ? ['cost', 'token', 'rate'] : [])
          .map((item, index) =>
            transaction[item] ? (
              <ListItem key={index}>
                <span>{t[item]}</span>
                <span
                  className={twMerge(
                    'font-bold',
                    item !== 'token' && item !== 'rate' && !isNaN(Number(transaction[item]))
                      ? Number(transaction[item]) >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                      : '',
                  )}
                >
                  {item === 'token'
                    ? getTokenLabel(transaction)
                    : item === 'rate'
                      ? getTokenRate(transaction)
                      : isNaN(Number(transaction[item]))
                        ? String(transaction[item])
                        : Number(transaction[item]).toLocaleCurrency()}
                </span>
              </ListItem>
            ) : null,
          )}
      </List>
      <Flex justifyContent="center" className="mt-6">
        <Button className="font-bold" style={{ borderRadius: 24 }} onClick={closePopup}>
          {t.close}
        </Button>
      </Flex>
    </div>
  );
};
