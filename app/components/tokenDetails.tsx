import { IconChevronLeft, IconChevronRight, IconChevronsRight } from '@tabler/icons-react';
import { Tab, TabGroup, TabList } from '@tremor/react';
import { Drawer, Flex } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Transaction, useData } from '../hooks/useData';
import { useWindowParam } from '../hooks/useWindowParam';
import { Data, Dataset } from '../utils/types';
import { CollapsiblePanel } from './collapsiblePanel';
import { Privacy } from './privacy';
import { TokenInfo } from './tokenInfo';
import { TransactionsTable } from './transactionsTable';
import { Subtitle, Title } from './typography';

const t: Dataset = {
  invested: 'Investi',
  withdrawn: 'Retiré',
  gains: 'Gains',
  loss: 'Pertes',
  total: 'Total',
  transactions: 'Transactions',
  learnMore: 'En savoir plus',
  date: 'Date',
  movement: 'Mouvement',
  type: 'Type',
  token: 'Tokens',
  profit: 'Profit',
  rate: "Taux d'échange",
  price: 'Taux courant',
  withdrawalCost: 'Frais de retrait',
};

interface TokenDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIndex: number | undefined;
  onSelectedIndexChange: (index?: number) => void;
  data: Data[];
  total: number;
}

export const TokenDetails = ({
  isOpen,
  onClose,
  data,
  total,
  selectedIndex = 0,
  onSelectedIndexChange,
}: TokenDetailsProps) => {
  const { width } = useWindowParam();
  const { wallet: tokens } = useData();

  const [isTokenInfoOpen, setIsTokenInfoOpen] = useState(false);
  const [isTokenListExpanded, setIsTokenListExpanded] = useState(false);

  useEffect(() => {
    setIsTokenListExpanded(width > 480);
  }, [width]);

  const changeToken = useCallback(
    (increment = true) => {
      setTimeout(
        () =>
          onSelectedIndexChange(
            ((selectedIndex || increment ? selectedIndex : (tokens?.length ?? 0)) + (increment ? 1 : -1)) %
              (tokens?.length ?? 0),
          ),
        100,
      ); // Wait for indexChange event to be triggered
    },
    [tokens?.length, onSelectedIndexChange, selectedIndex],
  );

  const handleClose = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      onClose();
    },
    [onClose],
  );

  const currentToken = useMemo(
    () => tokens?.find(t => t.label === data.at(selectedIndex)?.label),
    [data, selectedIndex, tokens],
  );

  const getFilteredTransactions = useCallback(
    (transactions?: Transaction[] | undefined) => {
      if (!transactions || !currentToken) return [];
      return transactions.filter(transaction => transaction.token === currentToken.symbol);
    },
    [currentToken],
  );

  return currentToken && data.length > 0 ? (
    <Drawer
      width={850}
      open={isOpen}
      onClose={handleClose}
      onClick={e => e.stopPropagation()}
      title={
        <TabGroup
          index={selectedIndex}
          onIndexChange={isTokenListExpanded ? onSelectedIndexChange : undefined}
          className="flex justify-center"
        >
          <TabList variant="line" onClick={e => e.stopPropagation()}>
            <Flex className="gap-6">
              {data.map(({ label }, i) => (
                <div className={isTokenListExpanded || selectedIndex === i ? 'block' : 'hidden'} key={label}>
                  <Flex align="center">
                    <IconChevronLeft
                      className={twMerge('h-4 w-4 mr-2', !isTokenListExpanded ? 'block' : 'hidden')}
                      onClick={() => changeToken(false)}
                    />
                    <Tab onClick={!isTokenListExpanded ? () => changeToken() : undefined}>{label}</Tab>
                    <IconChevronRight
                      className={twMerge('h-4 w-4 ml-2', !isTokenListExpanded ? 'block' : 'hidden')}
                      onClick={() => changeToken(true)}
                    />
                  </Flex>
                </div>
              ))}
            </Flex>
          </TabList>
        </TabGroup>
      }
    >
      <Flex vertical className="h-full">
        <Flex vertical className="gap-4 flex-1 overflow-hidden">
          <div className="space-y-4">
            <Flex justify="space-between" align="center">
              <Title>{currentToken.movement >= 0 ? t.invested : t.withdrawn}</Title>
              <Subtitle>
                <Privacy amount={currentToken.movement ? currentToken.movement : currentToken.total} />
              </Subtitle>
            </Flex>
            <Flex justify="space-between" align="center">
              <Title>{currentToken.profit >= 0 ? t.gains : t.loss}</Title>
              <Subtitle type={currentToken.profit ? (currentToken.profit > 0 ? 'success' : 'danger') : 'secondary'}>
                <Privacy amount={currentToken.profit} />
              </Subtitle>
            </Flex>
            <Flex justify="space-between" align="center">
              <Title>{t.total}</Title>
              <Title>
                <Privacy amount={currentToken.total} />
              </Title>
            </Flex>
          </div>
          <CollapsiblePanel
            className="text-justify h-full overflow-auto"
            hasCardStyle={false}
            label={<Title>{t.transactions}</Title>}
          >
            <TransactionsTable getFilteredTransactions={getFilteredTransactions} />
          </CollapsiblePanel>
        </Flex>
        <Flex
          className="gap-2 cursor-pointer hover:animate-pulse justify-center pt-2 border-t border-theme-border dark:border-dark-theme-border"
          align="center"
          onClick={() => setIsTokenInfoOpen(true)}
        >
          <Title>{t.learnMore}</Title>
          <IconChevronsRight />
          <TokenInfo
            isOpen={isTokenInfoOpen}
            onClose={() => setIsTokenInfoOpen(false)}
            selectedIndex={selectedIndex}
            onSelectedIndexChange={onSelectedIndexChange}
            tokens={tokens ?? []}
            data={data}
            total={total}
          />
        </Flex>
      </Flex>
    </Drawer>
  ) : null;
};
