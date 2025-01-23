import { IconChevronLeft, IconChevronRight, IconChevronsRight } from '@tabler/icons-react';
import { Tab, TabGroup, TabList } from '@tremor/react';
import { Drawer, Flex } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Transaction } from '../hooks/useData';
import { useWindowParam } from '../hooks/useWindowParam';
import { Data, Dataset } from '../utils/types';
import { CollapsiblePanel } from './collapsiblePanel';
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

interface TokenDetailsData extends Data {
  label: string;
  movement: number;
  profit: number;
  total: number;
  symbol: string;
  transactions: Transaction[];
  yearlyYield: number;
  description: string;
  volatility: number;
  duration: number;
  inceptionPrice: number;
}

interface TokenDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIndex: number | undefined;
  onSelectedIndexChange: (index?: number) => void;
  tokens: TokenDetailsData[];
  data: Data[];
  total: number;
}

export const TokenDetails = ({
  isOpen,
  onClose,
  tokens,
  data,
  total,
  selectedIndex = 0,
  onSelectedIndexChange,
}: TokenDetailsProps) => {
  const { width } = useWindowParam();

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
            ((selectedIndex || increment ? selectedIndex : tokens.length) + (increment ? 1 : -1)) % tokens.length,
          ),
        100,
      ); // Wait for indexChange event to be triggered
    },
    [tokens.length, onSelectedIndexChange, selectedIndex],
  );

  const handleClose = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      onClose();
    },
    [onClose],
  );

  const currentToken = useMemo(
    () => tokens.find(t => t.label === data.at(selectedIndex)?.label) ?? tokens[0],
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
      size="large"
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
      <Flex vertical className="gap-4">
        <Flex justify="space-between" align="center">
          <Title>{currentToken.movement >= 0 ? t.invested : t.withdrawn}</Title>
          <Subtitle>{(currentToken.movement ? currentToken.movement : currentToken.total).toLocaleCurrency()}</Subtitle>
        </Flex>
        <Flex justify="space-between" align="center">
          <Title>{currentToken.profit >= 0 ? t.gains : t.loss}</Title>
          <Subtitle type={currentToken.profit ? (currentToken.profit > 0 ? 'success' : 'danger') : 'secondary'}>
            {currentToken.profit.toLocaleCurrency()}
          </Subtitle>
        </Flex>
        <Flex justify="space-between" align="center">
          <Title>{t.total}</Title>
          <Title>{currentToken.total.toLocaleCurrency()}</Title>
        </Flex>
        <Flex vertical justify="space-between">
          <CollapsiblePanel
            className="text-justify"
            isExpanded={false}
            hasCardStyle={false}
            label={<Title>{t.transactions}</Title>}
          >
            <TransactionsTable getFilteredTransactions={getFilteredTransactions} />
          </CollapsiblePanel>
        </Flex>

        <Flex
          className="gap-2 cursor-pointer hover:animate-pulse justify-center"
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
            tokens={tokens}
            data={data}
            total={total}
          />
        </Flex>

        {/* <Flex justify="space-between" align="center">
          <Title>{t.yearlyYield}</Title>
          <RatioBadge data={currentToken.yearlyYield} />
        </Flex>
        <Flex vertical justify="space-between">
          <CollapsiblePanel
            className="text-justify"
            isExpanded={false}
            hasCardStyle={false}
            label={<Title>{t.description}</Title>}
          >
            <Text className="break-words whitespace-normal overflow-y-auto">{currentToken.description}</Text>
          </CollapsiblePanel>
        </Flex>
        <Flex justify="space-between" align="center">
          <Title>
            {t.volatility} / {t.risk}
          </Title>
          <Text type={getRisk(currentToken.volatility).type}>
            {currentToken.volatility.toRatio(0)} / {getRisk(currentToken.volatility).label}
          </Text>
        </Flex>
        <Flex justify="space-between" align="center">
          <Title>{t.distribution}</Title>
          <Text>{((data.find(t => t.label === currentToken.label)?.value || 0) / total).toRatio(0)}</Text>
        </Flex>
        <Flex justify="space-between" align="center">
          <Title>{t.creation}</Title>
          <Text>{currentToken.duration.formatDuration()}</Text>
        </Flex>
        <Flex justify="space-between" align="center">
          <Title>{t.initPrice}</Title>
          <Text>{currentToken.inceptionPrice.toLocaleCurrency()}</Text>
        </Flex>
        <Flex vertical className="gap-4" justify="space-between">
          <CollapsiblePanel hasCardStyle={false} label={<Title>{t.historic}</Title>}>
            <AreaChart
              className="h-40"
              data={tokenHistoric[selectedIndex]}
              categories={[t.amount]}
              index="date"
              colors={[
                tokenHistoric.length &&
                tokenHistoric[selectedIndex][0].Montant < tokenHistoric[selectedIndex][1].Montant
                  ? 'green'
                  : tokenHistoric.length &&
                      tokenHistoric[selectedIndex][0].Montant > tokenHistoric[selectedIndex][1].Montant
                    ? 'red'
                    : 'white',
              ]}
              valueFormatter={number => number.toFixed(0)}
              yAxisWidth={50}
              showAnimation={true}
              animationDuration={2000}
              curveType="monotone"
              noDataText={t.loading}
              minValue={tokenHistoricLimit?.min ?? 0}
              maxValue={tokenHistoricLimit?.max ?? 0}
              showLegend={false}
              startEndOnly={true}
            />
          </CollapsiblePanel>
        </Flex> */}
      </Flex>
    </Drawer>
  ) : null;
};
