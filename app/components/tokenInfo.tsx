import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { AreaChart, Tab, TabGroup, TabList } from '@tremor/react';
import { Drawer, Flex } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Price, useData } from '../hooks/useData';
import { useWindowParam } from '../hooks/useWindowParam';
import { getCurrency } from '../utils/functions';
import { DataName, loadData } from '../utils/processData';
import { Data, Dataset } from '../utils/types';
import { CollapsiblePanel } from './collapsiblePanel';
import RatioBadge from './ratioBadge';
import { getRisk } from './tokenGraphs';
import { LoadingMetric, Text, Title } from './typography';

const t: Dataset = {
  price: 'Prix',
  volatility: 'Volatilité',
  risk: 'Risque',
  yearlyYield: 'Rendement annuel',
  description: 'Description',
  distribution: 'Répartition',
  creation: 'Création',
  initPrice: 'Prix initial',
  historic: 'Historique',
  loading: 'Chargement...',
  amount: 'Montant',
};

interface TokenInfoData extends Data {
  label: string;
  yearlyYield: number;
  description: string;
  volatility: number;
  duration: number;
  inceptionPrice: number;
}

interface TokenInfoProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIndex: number | undefined;
  onSelectedIndexChange: (index?: number) => void;
  tokens: TokenInfoData[];
  data: Data[];
  total: number;
}

export const TokenInfo = ({
  isOpen,
  onClose,
  tokens,
  data,
  total,
  selectedIndex = 0,
  onSelectedIndexChange,
}: TokenInfoProps) => {
  const { width } = useWindowParam();
  const { prices, setPrices } = useData();

  const [isTokenListExpanded, setIsTokenListExpanded] = useState(false);

  useEffect(() => {
    setIsTokenListExpanded(width > 480);
  }, [width]);

  const isLoading = useRef(false);
  useEffect(() => {
    if (prices || isLoading.current || !isOpen) return;

    isLoading.current = true;

    loadData(DataName.price)
      .then(price => setPrices(price as Price[]))
      .catch(console.error)
      .finally(() => (isLoading.current = false));
  }, [prices, setPrices, isOpen]);

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

  const tokenPrices = useMemo(() => {
    if (!prices || !currentToken) return [];

    // Get the header row which contains token labels
    const headerRow = prices[0].prices.map(label => String(label));
    if (!headerRow) return [];

    // Find the column index for the current token
    const tokenIndex = headerRow.findIndex(label => label.startsWith(currentToken.label));
    if (tokenIndex === -1) return [];

    // Extract prices for this token from all rows (excluding header)
    return prices.slice(1).map(row => ({
      date: row.date ?? new Date(0),
      price: Number(row.prices[tokenIndex]),
    }));
  }, [prices, currentToken]);

  const tokenLimits = useMemo(() => {
    if (!tokenPrices.length) return { min: 0, max: 0 };

    return {
      min: Math.min(...tokenPrices.map(price => price.price)),
      max: Math.max(...tokenPrices.map(price => price.price)),
    };
  }, [tokenPrices]);

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
          <Title>{t.price}</Title>
          <LoadingMetric isReady={tokens.length > 0}>{getCurrency(tokens, currentToken.label)}</LoadingMetric>
        </Flex>
        <Flex justify="space-between" align="center">
          <Title>{t.yearlyYield}</Title>
          <RatioBadge data={currentToken.yearlyYield} />
        </Flex>
        <Flex vertical justify="space-between">
          <CollapsiblePanel className="text-justify" hasCardStyle={false} label={<Title>{t.description}</Title>}>
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
              data={tokenPrices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
              categories={['price']}
              index="date"
              colors={[
                tokenLimits.min < tokenLimits.max ? 'green' : tokenLimits.min > tokenLimits.max ? 'red' : 'white',
              ]}
              valueFormatter={number => number.toShortCurrency()}
              yAxisWidth={65}
              showAnimation={true}
              animationDuration={2000}
              curveType="monotone"
              noDataText={t.loading}
              showLegend={false}
              minValue={tokenLimits.min}
              maxValue={tokenLimits.max}
            />
          </CollapsiblePanel>
        </Flex>
      </Flex>
    </Drawer>
  ) : null;
};
