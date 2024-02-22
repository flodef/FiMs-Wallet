import { Button, Flex, List, ListItem, Title } from '@tremor/react';
import { usePopup } from '../contexts/PopupProvider';
import { Transaction, TransactionType } from '../pages/transactions';
import { cls } from '../utils/constants';
import { Dataset } from '../utils/types';

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
    <>
      <Title className="text-center mb-2">
        {t[TransactionType[transaction.type ?? 0]]} {t.from} {transaction.date.toShortDate()}
      </Title>
      <List>
        {['movement', 'cost', 'token', 'rate'].map((item, index) =>
          transaction[item] && (transaction.type !== TransactionType.donation || item !== 'cost') ? (
            <ListItem key={index}>
              <span>{t[item]}</span>
              <span
                className={cls(
                  'font-bold',
                  !isNaN(Number(transaction[item]))
                    ? Number(transaction[item]) >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                    : '',
                )}
              >
                {isNaN(Number(transaction[item]))
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
    </>
  );
};
