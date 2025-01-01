import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { AreaChart, BarList, SparkAreaChart, Tab, TabGroup, TabList } from '@tremor/react';

import { CollapseProps, Flex } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { CollapsiblePanel } from '../components/collapsiblePanel';
import GainsBar from '../components/gainsBar';
import RatioBadge from '../components/ratioBadge';
import { LoadingMetric, Title } from '../components/typography';
import { DashboardToken, Historic, TokenHistoric, useData } from '../hooks/useData';
import { Page, useNavigation } from '../hooks/useNavigation';
import { getBarData } from '../utils/chart';
import {} from '../utils/extensions';
import { getCurrency, getRatio } from '../utils/functions';
import { isMobileSize, useIsMobile } from '../utils/mobile';
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

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileSize());
  }, []);

  const generateTokenHistoric = useCallback(
    (token: DashboardToken[]) => {
      token = token.filter(({ available }) => available);

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

  const isDesktop = useIsMobile(1280); // xl for tailwindcss breakpoints
  const isTokenListExpanded = !useIsMobile(480); // xs for tailwindcss breakpoints;

  const [priceIndex, setPriceIndex] = useState(0);
  const changeToken = useCallback(
    (increment = true) => {
      setTimeout(() => {
        setPriceIndex(((priceIndex || token.length) + (increment ? 1 : -1)) % token.length);
      }, 100); // Wait for indexChange event to be triggered
    },
    [priceIndex, token.length],
  );

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
          <BarList
            data-testid="bar-chart"
            data={result.data}
            showAnimation={true}
            valueFormatter={(number: number) =>
              (result.data.find(d => d.value === number)?.amount ?? number).toLocaleCurrency()
            }
          />
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
              index={priceIndex}
              onIndexChange={isTokenListExpanded ? setPriceIndex : undefined}
              className="xl:text-right max-w-[200px]"
            >
              <TabList
                className="float-left xl:float-right"
                variant={!isDesktop ? 'solid' : 'line'}
                onClick={e => e.stopPropagation()}
              >
                <Flex>
                  {token.map((t, i) => (
                    <div className={isTokenListExpanded || priceIndex === i ? 'block' : 'hidden'} key={t.label}>
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
            <LoadingMetric isReady={token.length > 0}>{getCurrency(token, token.at(priceIndex)?.label)}</LoadingMetric>
            <RatioBadge data={token.at(priceIndex)?.yearlyYield ?? 0} />
          </Flex>
        </Flex>
      ),
      children: (
        <AreaChart
          className="h-40"
          data={tokenHistoric[priceIndex]}
          categories={[t.amount]}
          index="date"
          colors={[
            tokenHistoric.length && tokenHistoric[priceIndex][0].Montant < tokenHistoric[priceIndex][1].Montant
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
