import { IconChevronsRight } from '@tabler/icons-react';
import { AreaChart, SparkAreaChart } from '@tremor/react';

import { Col, Flex, Row } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BarList } from '../components/barList';
import { CollapsiblePanel } from '../components/collapsiblePanel';
import GainsBar from '../components/gainsBar';
import RatioBadge from '../components/ratioBadge';
import { TokenDetails } from '../components/tokenDetails';
import { TokenGraphs } from '../components/tokenGraphs';
import { LoadingMetric, Subtitle, Title } from '../components/typography';
import { DashboardToken, Historic, useData } from '../hooks/useData';
import { Page, useNavigation } from '../hooks/useNavigation';
import { useWindowParam } from '../hooks/useWindowParam';
import { AvailableChartColorsKeys } from '../utils/chart';
import { FIMS } from '../utils/constants';
import {} from '../utils/extensions';
import { findValue, getCurrency, getRatio } from '../utils/functions';
import { DataName, loadData } from '../utils/processData';
import { Data, Dataset } from '../utils/types';

const tokenColors: AvailableChartColorsKeys[] = ['blue', 'amber', 'cyan'];

const t: Dataset = {
  performances: 'Performances',
  total: 'Trésorerie',
  profit: 'Profits',
  gains: 'Gains',
  assets: 'Valeur totale',
  transfered: 'Investi',
  currency: 'Monnaie',
  type: 'Type',
  'transfer cost': 'Transferts',
  'strategy cost': 'Stratégie',
  'price change': 'Prix',
  charity: 'Charité',
  loading: 'Chargement...',
  learnMore: 'En savoir plus',
};

const thisPage = Page.Dashboard;

export default function Dashboard() {
  const { page, needRefresh, setNeedRefresh } = useNavigation();
  const { dashboard, setDashboard, tokens, setTokens, historic, setHistoric } = useData();
  const { width } = useWindowParam();

  const [isMobile, setIsMobile] = useState(false);
  const [isTokenListExpanded, setIsTokenListExpanded] = useState(false);
  const [isTokenDetailsOpen, setIsTokenDetailsOpen] = useState(false);

  useEffect(() => {
    setIsMobile(width < 768);
    setIsTokenListExpanded(width > 480);
  }, [width]);

  const getBarList = useCallback(
    (labels: string[]): Data[] => {
      return labels
        .map(label => ({
          label: t[label] ?? label,
          value: getCurrency(dashboard, label).fromCurrency(),
          ratio: 0,
        }))
        .sort((a, b) => b.value - a.value);
    },
    [dashboard],
  );

  const result = useMemo(
    () => ({
      total: findValue(dashboard, 'assets')?.value ?? 1500000,
      data: getBarList(tokens.map(t => t.label)),
    }),
    [dashboard, getBarList, tokens],
  );

  const isLoading = useRef(false);
  useEffect(() => {
    if (isLoading.current || !needRefresh || page !== thisPage) return;

    isLoading.current = true;
    setNeedRefresh(false);

    loadData(DataName.dashboard)
      .then(dashboard => setDashboard(dashboard as Data[]))
      .then(() => loadData(DataName.tokens))
      .then(tokens => setTokens((tokens as DashboardToken[]).filter(({ label }) => label.includes(FIMS))))
      .then(() => loadData(DataName.historic))
      .then(historic => setHistoric(historic as Historic[]))
      .catch(console.error)
      .finally(() => (isLoading.current = false));
  }, [needRefresh, setNeedRefresh, page, setDashboard, setHistoric, setTokens]);

  const selectedPrice = useRef(0);
  const getSelectedPrice = useCallback(
    (index: number | undefined) => {
      if (index === undefined) return selectedPrice.current;
      const barList = getBarList(tokens.map(t => t.label));
      const priceIndex = tokens.findIndex(t => t.label === barList[index].label) ?? selectedPrice.current;
      selectedPrice.current = priceIndex;
      return priceIndex;
    },
    [getBarList, tokens],
  );
  const setSelectedPrice = useCallback(
    (priceIndex: number) => {
      const barList = getBarList(tokens.map(t => t.label));
      selectedPrice.current = priceIndex;
      setSelectedIndex(barList.findIndex(t => t.label === tokens[priceIndex].label));
    },
    [getBarList, tokens],
  );

  const [selectedIndex, setSelectedIndex] = useState<number>();

  const currentToken = useMemo(
    () => tokens[getSelectedPrice(selectedIndex)],
    [selectedIndex, tokens, getSelectedPrice],
  );

  return (
    <Flex vertical className="gap-4">
      <CollapsiblePanel
        label={
          <Flex justify="space-between">
            <div>
              <Title className="text-left">{t.assets}</Title>
              <LoadingMetric isReady={dashboard.length > 0}>{getCurrency(dashboard, 'assets', 1000000)}</LoadingMetric>
            </div>
            <RatioBadge data={dashboard} label="assets" />
          </Flex>
        }
      >
        <Flex vertical className="gap-4">
          <GainsBar
            values={{
              invested: getCurrency(dashboard, 'invested').fromCurrency(),
              profitValue: getCurrency(dashboard, 'gains').fromCurrency(),
              profitRatio: parseFloat(getRatio(dashboard, 'gains')) / 100,
            }}
            isReady={!!dashboard.length}
          />
          <Row gutter={[16, 16]}>
            <Col xs={{ flex: '100%' }} sm={{ flex: tokens.length > 0 ? '50%' : '100%' }}>
              <TokenGraphs
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                currentToken={currentToken}
                data={result.data}
                total={result.total}
                tokens={tokens}
                tokenColors={tokenColors}
              />
            </Col>
            {tokens.length > 0 && (
              <Col xs={{ flex: '100%' }} sm={{ flex: '50%' }} className="content-center">
                <BarList
                  className="opacity-100"
                  data={result.data}
                  colors={tokenColors}
                  showAnimation={true}
                  selectedIndex={selectedIndex}
                  onSelectedIndexChange={setSelectedIndex}
                  valueFormatter={(number: number) => `${number.toLocaleCurrency()}`}
                />
                {currentToken && (
                  <Flex justify="end">
                    <Flex
                      className="gap-2 cursor-pointer hover:animate-pulse"
                      onClick={() => setIsTokenDetailsOpen(true)}
                    >
                      <Subtitle className="text-theme-content-strong dark:text-dark-theme-content-strong">
                        {t.learnMore}
                      </Subtitle>
                      <IconChevronsRight className="text-theme-content-strong dark:text-dark-theme-content-strong" />
                    </Flex>
                    <TokenDetails
                      isOpen={isTokenDetailsOpen}
                      onClose={() => setIsTokenDetailsOpen(false)}
                      tokens={tokens}
                      currentToken={currentToken}
                      selectedPrice={selectedPrice}
                      setSelectedPrice={setSelectedPrice}
                      isTokenListExpanded={isTokenListExpanded}
                      result={result}
                    />
                  </Flex>
                )}
              </Col>
            )}
          </Row>
        </Flex>
      </CollapsiblePanel>
      <CollapsiblePanel
        label={
          <Flex>
            <Title>{t.performances}</Title>
            {historic.length > 1 && (
              <SparkAreaChart
                className="mx-4 h-10 w-full text-center animate-display [.ant-collapse-header[aria-expanded='true']_&]:hidden"
                data={historic.sort((a, b) => a.date - b.date)}
                categories={[t.total]}
                index={'stringDate'}
                colors={['emerald']}
                curveType="monotone"
                noDataText={t.loading}
              />
            )}
          </Flex>
        }
        isExpanded={!isMobile}
      >
        <AreaChart
          className="h-80"
          data={historic.sort((a, b) => a.date - b.date)}
          categories={[t.transfered, t.total]}
          index="stringDate"
          colors={['indigo', 'fuchsia']}
          valueFormatter={number => number.toShortCurrency(1)}
          yAxisWidth={50}
          showAnimation={true}
          animationDuration={2000}
          curveType="monotone"
          noDataText={t.loading}
        />
      </CollapsiblePanel>
    </Flex>
  );
}
