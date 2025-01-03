import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { AreaChart, SparkAreaChart, Tab, TabGroup, TabList } from '@tremor/react';

import { Col, CollapseProps, Flex, Row } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { BarList } from '../components/barList';
import { CollapsiblePanel } from '../components/collapsiblePanel';
import { DonutChart } from '../components/donutChart';
import GainsBar from '../components/gainsBar';
import RatioBadge from '../components/ratioBadge';
import { LoadingMetric, Title } from '../components/typography';
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
};

const tokenColors: AvailableChartColorsKeys[] = ['blue', 'amber', 'cyan'];

const today = new Date();
const thisPage = Page.Dashboard;

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

  const [selectedIndex, setSelectedIndex] = useState<number>();
  const changeToken = useCallback(
    (increment = true) => {
      setTimeout(() => {
        setSelectedIndex(((selectedIndex || token.length) + (increment ? 1 : -1)) % token.length);
      }, 100); // Wait for indexChange event to be triggered
    },
    [selectedIndex, token.length],
  );

  const currentSelectedPrice = useRef(0);
  const getSelectedPrice = (index: number | undefined) => {
    if (index === undefined) return currentSelectedPrice.current;
    const barList = getBarList(token.map(t => t.label));
    const priceIndex = token.findIndex(t => t.label === barList[index].name) ?? currentSelectedPrice.current;
    currentSelectedPrice.current = priceIndex;
    return priceIndex;
  };
  const setSelectedPrice = (index: number) => {
    const barList = getBarList(token.map(t => t.label));
    currentSelectedPrice.current = index;
    setSelectedIndex(barList.findIndex(t => t.name === token[index].label));
  };

  const itemsGeneral: CollapseProps['items'] = [
    {
      label: (
        <Flex justify="space-between">
          <div>
            <Title className="text-left">{t.assets}</Title>
            <LoadingMetric isReady={dashboard.length > 0}>{getCurrency(dashboard, 'assets', 1000000)}</LoadingMetric>
          </div>
          <RatioBadge data={dashboard} label="assets" />
        </Flex>
      ),
      children: (
        <Flex vertical className="gap-4">
          <GainsBar
            values={{
              invested: getCurrency(dashboard, 'transfered').fromCurrency(),
              profitValue: getCurrency(dashboard, 'gains').fromCurrency(),
              profitRatio: parseFloat(getRatio(dashboard, 'gains')) / 100,
            }}
            isReady={!!dashboard.length}
          />
          <Row gutter={[16, 16]}>
            <Col xs={{ flex: '100%' }} md={{ flex: '50%' }}>
              <DonutChart
                className="mx-auto"
                data={result.data}
                category="name"
                value="amount"
                colors={tokenColors}
                variant="donut"
                showLabel={false}
                selectedIndex={selectedIndex}
                onSelectedIndexChange={setSelectedIndex}
                valueFormatter={(number: number) => `${number.toLocaleCurrency()}`}
              />
            </Col>
            <Col xs={{ flex: '100%' }} md={{ flex: '50%' }} className="content-center">
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
            </Col>
          </Row>
        </Flex>
      ),
    },
  ];

  const itemsPrices: CollapseProps['items'] = [
    {
      label: (
        <Flex vertical className="gap-4">
          <Flex className="gap-4" align="center">
            <Title className="text-left">{t.price}</Title>
            <TabGroup
              index={getSelectedPrice(selectedIndex)}
              onIndexChange={isTokenListExpanded ? setSelectedPrice : undefined}
              className="xl:text-right max-w-[200px]"
            >
              <TabList className="float-left" variant="line" onClick={e => e.stopPropagation()}>
                <Flex>
                  {token.map((t, i) => (
                    <div className={isTokenListExpanded || selectedIndex === i ? 'block' : 'hidden'} key={t.label}>
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
          </Flex>
          <Flex justify="space-between">
            <LoadingMetric isReady={token.length > 0}>
              {getCurrency(token, token.at(currentSelectedPrice.current)?.label)}
            </LoadingMetric>
            <RatioBadge data={token.at(currentSelectedPrice.current)?.yearlyYield ?? 0} />
          </Flex>
        </Flex>
      ),
      children: (
        <AreaChart
          className="h-40"
          data={tokenHistoric[currentSelectedPrice.current]}
          categories={[t.amount]}
          index="date"
          colors={[
            tokenHistoric.length &&
            tokenHistoric[currentSelectedPrice.current][0].Montant <
              tokenHistoric[currentSelectedPrice.current][1].Montant
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
      ),
    },
  ];

  const itemsPerformances: CollapseProps['items'] = [
    {
      label: (
        <Flex>
          <Title>Performance</Title>
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
      ),
      children: (
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
      ),
    },
  ];

  return (
    <Flex vertical className="gap-6">
      <CollapsiblePanel items={itemsGeneral} />
      <CollapsiblePanel items={itemsPrices} isExpanded={!isMobile} />
      <CollapsiblePanel items={itemsPerformances} isExpanded={!isMobile} />
    </Flex>
  );
}
