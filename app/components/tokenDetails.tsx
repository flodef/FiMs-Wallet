import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { AreaChart, Tab, TabGroup, TabList } from '@tremor/react';
import { Drawer, Flex } from 'antd';
import { twMerge } from 'tailwind-merge';
import { getCurrency } from '../utils/functions';
import { Data, Dataset } from '../utils/types';
import { CollapsiblePanel } from './collapsiblePanel';
import RatioBadge from './ratioBadge';
import { getRisk } from './tokenGraphs';
import { LoadingMetric, Text, Title } from './typography';
import { TokenHistoric } from '../hooks/useData';

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

interface TokenDetailsData extends Data {
  label: string;
  yearlyYield: number;
  description: string;
  volatility: number;
  duration: number;
  inceptionPrice: number;
}

interface TokenDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: TokenDetailsData[];
  currentToken: TokenDetailsData;
  selectedPrice: { current: number };
  isTokenListExpanded: boolean;
  setSelectedPrice: (index: number) => void;
  changeToken: (next?: boolean) => void;
  tokenHistoric: TokenHistoric[][];
  tokenHistoricLimit?: { min: number; max: number };
  result: { data: Data[]; total: number };
}

export const TokenDetails = ({
  isOpen,
  onClose,
  tokens,
  currentToken,
  selectedPrice,
  isTokenListExpanded,
  setSelectedPrice,
  changeToken,
  tokenHistoric,
  tokenHistoricLimit,
  result,
}: TokenDetailsProps) => {
  const getSelectedPrice = (index?: number) => {
    return index ?? selectedPrice.current;
  };

  return (
    <Drawer
      size="large"
      title={
        <TabGroup
          index={getSelectedPrice(selectedPrice.current)}
          onIndexChange={isTokenListExpanded ? setSelectedPrice : undefined}
          className="flex justify-center"
        >
          <TabList variant="line" onClick={e => e.stopPropagation()}>
            <Flex className="gap-6">
              {tokens.map((token, i) => (
                <div
                  className={isTokenListExpanded || selectedPrice.current === i ? 'block' : 'hidden'}
                  key={token.label}
                >
                  <Flex align="center">
                    <IconChevronLeft
                      className={twMerge('h-4 w-4 mr-2', !isTokenListExpanded ? 'block' : 'hidden')}
                      onClick={() => changeToken(false)}
                    />
                    <Tab onClick={!isTokenListExpanded ? () => changeToken() : undefined}>{token.label}</Tab>
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
      onClose={onClose}
      open={isOpen}
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
          <Text>{((result.data.find(t => t.label === currentToken.label)?.value || 0) / result.total).toRatio(0)}</Text>
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
              data={tokenHistoric[selectedPrice.current]}
              categories={[t.amount]}
              index="date"
              colors={[
                tokenHistoric.length &&
                tokenHistoric[selectedPrice.current][0].Montant < tokenHistoric[selectedPrice.current][1].Montant
                  ? 'green'
                  : 'red',
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
        </Flex>
      </Flex>
    </Drawer>
  );
};