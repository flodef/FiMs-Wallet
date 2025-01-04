import { IconChevronLeft, IconChevronRight, IconChevronsRight } from '@tabler/icons-react';
import { AreaChart, SparkAreaChart, Tab, TabGroup, TabList } from '@tremor/react';

import { Col, Drawer, Flex, Row } from 'antd';
import { BaseType } from 'antd/es/typography/Base';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { BarList } from '../components/barList';
import { CollapsiblePanel } from '../components/collapsiblePanel';
import { DonutChart } from '../components/donutChart';
import GainsBar from '../components/gainsBar';
import RatioBadge from '../components/ratioBadge';
import { LoadingMetric, Subtitle, Text, Title } from '../components/typography';
import { DashboardToken, Historic, TokenHistoric, useData } from '../hooks/useData';
import { Page, useNavigation } from '../hooks/useNavigation';
import { useWindowParam } from '../hooks/useWindowParam';
import { AvailableChartColorsKeys, getBarData } from '../utils/chart';
import { FIMS } from '../utils/constants';
import {} from '../utils/extensions';
import { getCurrency, getRatio } from '../utils/functions';
import { DataName, loadData } from '../utils/processData';
import { Data, Dataset } from '../utils/types';

const tokenValueStart = 100;

const t: Dataset = {
  price: 'Prix',
  performances: 'Performances',
  volatility: 'Volatilité',
  risk: 'Risque',
  description: 'Description',
  creation: 'Création',
  initPrice: 'Prix de création',
  historic: 'Historique',
  high: 'Fort',
  low: 'Faible',
  medium: 'Moyen',
  result: 'Résultats FiMs',
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
  amount: 'Montant',
  learnMore: 'En savoir plus',
};

const tokenColors: AvailableChartColorsKeys[] = ['blue', 'amber', 'cyan'];

const today = new Date();
const thisPage = Page.Dashboard;

export const getRisk = (ratio: number): { label: string; type: BaseType } => {
  if (ratio >= 2 / 3) return { label: t.high, type: 'danger' };
  if (ratio <= 1 / 3) return { label: t.low, type: 'success' };
  return { label: t.medium, type: 'warning' };
};

export default function Dashboard() {
  const { page, needRefresh, setNeedRefresh } = useNavigation();
  const {
    dashboard,
    setDashboard,
    token,
    setToken,
    historic,
    setHistoric,
    tokenHistoric,
    setTokenHistoric,
    tokenHistoricLimit,
    setTokenHistoricLimit,
  } = useData();
  const { width } = useWindowParam();

  const [isMobile, setIsMobile] = useState(false);
  const [isTokenListExpanded, setIsTokenListExpanded] = useState(false);
  const [isTokenDetailsOpen, setIsTokenDetailsOpen] = useState(false);

  useEffect(() => {
    setIsMobile(width < 768);
    setIsTokenListExpanded(width > 480);
  }, [width]);

  const generateTokenHistoric = useCallback(
    (token: DashboardToken[]) => {
      token = token.filter(({ label }) => label.includes(FIMS));
      setToken(token);

      let min = tokenValueStart;
      let max = tokenValueStart;
      const tokenHistoric: TokenHistoric[][] = [];
      token.forEach(t => {
        const tokenValueEnd = tokenValueStart * (1 + parseFloat(getRatio(token, t.label)) / 100);
        tokenHistoric.push([
          {
            date: new Date(today.getTime() - t.duration * 24 * 60 * 60 * 1000).toShortDate(),
            Montant: tokenValueStart,
          },
          {
            date: today.toShortDate(),
            Montant: tokenValueEnd,
          },
        ]);
        min = Math.min(min, tokenValueEnd);
        max = Math.max(max, tokenValueEnd);
      });
      setTokenHistoric(tokenHistoric);
      setTokenHistoricLimit({
        min: min,
        max: max,
      });
    },
    [setToken, setTokenHistoric, setTokenHistoricLimit],
  );

  const isLoading = useRef(false);
  useEffect(() => {
    if (isLoading.current || !needRefresh || page !== thisPage) return;

    isLoading.current = true;
    setNeedRefresh(false);

    loadData(DataName.dashboard)
      .then(dashboard => setDashboard(dashboard as Data[]))
      .then(() => loadData(DataName.token))
      .then(token => generateTokenHistoric(token as DashboardToken[]))
      .then(() => loadData(DataName.historic))
      .then(historic => setHistoric(historic as Historic[]))
      .catch(console.error)
      .finally(() => (isLoading.current = false));
  }, [needRefresh, setNeedRefresh, page, generateTokenHistoric, setDashboard, setHistoric]);

  const getBarList = useCallback(
    (labels: string[]) => {
      return labels
        .map(label => {
          return getBarData(t[label] ?? label, getCurrency(dashboard, label).fromCurrency());
        })
        .sort((a, b) => b.value - a.value);
    },
    [dashboard],
  );

  const result = useMemo(
    () => ({
      category: t.total,
      total: getCurrency(dashboard, 'assets', 1500000),
      data: getBarList(['FiMs SOL', 'FiMs Token', 'FiMs Liquidity Provider']),
    }),
    [dashboard, getBarList],
  );

  const selectedPrice = useRef(0);
  const getSelectedPrice = (index: number | undefined) => {
    if (index === undefined) return selectedPrice.current;
    const barList = getBarList(token.map(t => t.label));
    const priceIndex = token.findIndex(t => t.label === barList[index].name) ?? selectedPrice.current;
    selectedPrice.current = priceIndex;
    return priceIndex;
  };
  const setSelectedPrice = useCallback(
    (index: number) => {
      const barList = getBarList(token.map(t => t.label));
      selectedPrice.current = index;
      setSelectedIndex(barList.findIndex(t => t.name === token[index].label));
    },
    [getBarList, token],
  );

  const [selectedIndex, setSelectedIndex] = useState<number>();
  const changeToken = useCallback(
    (increment = true) => {
      setTimeout(() => {
        setSelectedPrice(((selectedPrice.current || token.length) + (increment ? 1 : -1)) % token.length);
      }, 100); // Wait for indexChange event to be triggered
    },
    [token.length, setSelectedPrice],
  );

  const currentToken = token.at(selectedPrice.current);

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
            <Col xs={{ flex: '100%' }} sm={{ flex: '50%' }}>
              <DonutChart
                className="mx-auto"
                data={result.data}
                category="name"
                value="amount"
                colors={tokenColors}
                variant="donut"
                showLabel={false}
                showTooltip={false}
                selectedIndex={selectedIndex}
                onSelectedIndexChange={setSelectedIndex}
                valueFormatter={(number: number) => `${number.toLocaleCurrency()}`}
              />
            </Col>
            <Col xs={{ flex: '100%' }} sm={{ flex: '50%' }} className="content-center">
              {dashboard.length > 0 && (
                <BarList
                  className="opacity-100"
                  data={result.data}
                  colors={tokenColors}
                  showAnimation={true}
                  selectedIndex={selectedIndex}
                  onSelectedIndexChange={setSelectedIndex}
                  valueFormatter={(number: number) => `${number.toLocaleCurrency()}`}
                />
              )}
              {currentToken && (
                <Flex justify="end">
                  <Flex
                    className="gap-2 cursor-pointer hover:animate-pulse"
                    onClick={() => setIsTokenDetailsOpen(true)}
                  >
                    <Subtitle>{t.learnMore}</Subtitle>
                    <IconChevronsRight />
                  </Flex>
                  <Drawer
                    size="large"
                    title={
                      <TabGroup
                        index={getSelectedPrice(selectedIndex)}
                        onIndexChange={isTokenListExpanded ? setSelectedPrice : undefined}
                        className="flex justify-center"
                      >
                        <TabList variant="line" onClick={e => e.stopPropagation()}>
                          <Flex className="gap-6">
                            {token.map((t, i) => (
                              <div
                                className={isTokenListExpanded || selectedPrice.current === i ? 'block' : 'hidden'}
                                key={t.label}
                              >
                                <Flex align="center">
                                  <IconChevronLeft
                                    className={twMerge('h-4 w-4 mr-2', !isTokenListExpanded ? 'block' : 'hidden')}
                                    onClick={() => changeToken(false)}
                                  />
                                  <Tab onClick={!isTokenListExpanded ? () => changeToken() : undefined}>{t.label}</Tab>
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
                    onClose={() => setIsTokenDetailsOpen(false)}
                    open={isTokenDetailsOpen}
                  >
                    <Flex vertical className="gap-4">
                      <Flex justify="space-between" align="center">
                        <Title>{t.price}</Title>
                        <LoadingMetric isReady={token.length > 0}>
                          {getCurrency(token, currentToken.label)}
                        </LoadingMetric>
                      </Flex>
                      <Flex justify="space-between" align="center">
                        <Title>{t.performances}</Title>
                        <RatioBadge data={currentToken.yearlyYield} />
                      </Flex>
                      <Flex vertical justify="space-between">
                        <CollapsiblePanel
                          isExpanded={false}
                          hasCardStyle={false}
                          label={<Title>{t.description}</Title>}
                        >
                          <Text className="text-justify break-words whitespace-normal overflow-y-auto">
                            {currentToken.description}
                          </Text>
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
                              tokenHistoric[selectedPrice.current][0].Montant <
                                tokenHistoric[selectedPrice.current][1].Montant
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
                </Flex>
              )}
            </Col>
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
