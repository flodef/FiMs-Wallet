import { ChartPieIcon, ChevronLeftIcon, ChevronRightIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AreaChart,
  BadgeDelta,
  BarList,
  DeltaType,
  Flex,
  Grid,
  Metric,
  SparkAreaChart,
  Tab,
  TabGroup,
  TabList,
  Title,
} from '@tremor/react';

import { useCallback, useEffect, useRef, useState } from 'react';
import GainsBar from '../components/gainsBar';
import { Page, useNavigation } from '../hooks/useNavigation';
import { useWindowParam } from '../hooks/useWindowParam';
import { getBarData } from '../utils/chart';
import { cls, getCurrency, getDeltaType, getRatio } from '../utils/constants';
import {} from '../utils/extensions';
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

export interface DashboardToken extends Data {
  available: number;
  duration: number;
}

export interface Historic {
  date: number;
  stringDate: string;
  Investi: number;
  Trésorerie: number;
}

interface TokenHistoric {
  date: string;
  Montant: number;
}

const today = new Date();
const thisPage = Page.Dashboard;

export default function Dashboard() {
  const { page, needRefresh, setNeedRefresh } = useNavigation();

  const [dashboard, setDashboard] = useState<Data[]>([]);
  const [token, setToken] = useState<DashboardToken[]>([]);
  const [historic, setHistoric] = useState<Historic[]>([]);
  const [tokenHistoric, setTokenHistoric] = useState<TokenHistoric[][]>([]);
  const [tokenHistoricLimit, setTokenHistoricLimit] = useState<{ min: number; max: number }>();

  const generateTokenHistoric = useCallback((token: DashboardToken[]) => {
    token = token.filter(({ label, available }) => available && label !== 'Euro'); // TODO : remove this line when Euro is removed from the spreadsheet

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
  }, []);

  const isLoading = useRef(false);
  useEffect(() => {
    if (isLoading.current || !needRefresh || page !== thisPage) return;

    isLoading.current = true;
    setNeedRefresh(false);

    loadData(DataName.dashboard)
      .then(setDashboard)
      .then(() => loadData(DataName.token))
      .then(generateTokenHistoric)
      .then(() => loadData(DataName.historic))
      .then(setHistoric)
      .catch(console.error)
      .finally(() => (isLoading.current = false));
  }, [needRefresh, setNeedRefresh, page, generateTokenHistoric]);

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

  const result = [
    {
      category: t.total,
      total: getCurrency(dashboard, 'total', 100000),
      data: getBarList(['Solana', 'Bitcoin', 'Nexo', 'FiMs']),
    },
    {
      category: t.profit,
      total: getCurrency(dashboard, 'profit', 10000),
      data: getBarList(['transfer cost', 'strategy cost', 'price change', 'charity']),
    },
  ];

  const isDesktop = useIsMobile(1280); // xl for tailwindcss breakpoints
  const width = useWindowParam().width;
  const isTokenListExpanded = (width > 400 && width < 640) || width > 970;

  const [resultIndex, setResultIndex] = useState(0);
  const [priceIndex, setPriceIndex] = useState(0);
  const changeToken = useCallback(
    (increment = true) => {
      setTimeout(() => {
        setPriceIndex(((priceIndex || token.length) + (increment ? 1 : -1)) % token.length);
      }, 100); // Wait for indexChange event to be triggered
    },
    [priceIndex, token.length],
  );

  return (
    <>
      <Accordion defaultOpen={!isMobileSize()}>
        <AccordionHeader>
          <Flex alignItems="start">
            <div>
              <Title className="text-left">{t.assets}</Title>
              <Metric color="green" className={!dashboard.length ? 'blur-sm' : 'animate-unblur'}>
                {getCurrency(dashboard, 'assets', 500000)}
              </Metric>
            </div>
            <BadgeDelta deltaType={getDeltaType(getRatio(dashboard, 'price @'))}>
              {getRatio(dashboard, 'price @')}
            </BadgeDelta>
          </Flex>
        </AccordionHeader>
        <AccordionBody>
          <GainsBar
            values={{
              invested: getCurrency(dashboard, 'transfered').fromCurrency(),
              profitValue: getCurrency(dashboard, 'gains').fromCurrency(),
              profitRatio: parseFloat(getRatio(dashboard, 'gains')) / 100,
            }}
            loaded={!!dashboard.length}
          />
        </AccordionBody>
      </Accordion>

      <Grid numItemsSm={2} numItemsLg={result.length} className="gap-6">
        <Accordion defaultOpen={!isMobileSize()}>
          <AccordionHeader>
            <Flex alignItems="start" flexDirection="col">
              <Flex alignItems="start" flexDirection={!isDesktop ? 'row' : 'col'}>
                <Title className="text-left whitespace-nowrap">{t.result}</Title>
                <TabGroup index={resultIndex} onIndexChange={setResultIndex} className="mb-4 xl:mb-0 xl:text-right">
                  <TabList
                    className="float-left xl:float-right"
                    variant={!isDesktop ? 'solid' : 'line'}
                    onClick={e => e.stopPropagation()}
                  >
                    <Tab icon={ChartPieIcon}>{t.total}</Tab>
                    <Tab icon={ListBulletIcon}>{t.profit}</Tab>
                  </TabList>
                </TabGroup>
              </Flex>
              <Flex alignItems="start">
                <Metric
                  color={result[resultIndex].total.fromCurrency() < 0 ? 'red' : 'green'}
                  className={!dashboard.length ? 'blur-sm' : 'animate-unblur'}
                >
                  {result[resultIndex].total}
                </Metric>
                <BadgeDelta className="mt-2" deltaType={getDeltaType(getRatio(dashboard, 'profit'))}>
                  {getRatio(dashboard, 'profit')}
                </BadgeDelta>
              </Flex>
            </Flex>
          </AccordionHeader>
          <AccordionBody>
            <BarList
              data-testid="bar-chart"
              data={result[resultIndex].data}
              showAnimation={true}
              valueFormatter={(number: number) =>
                (result[resultIndex].data.find(d => d.value === number)?.amount ?? number).toLocaleCurrency()
              }
              className="mt-2"
            />
          </AccordionBody>
        </Accordion>
        <Accordion defaultOpen={!isMobileSize()}>
          <AccordionHeader>
            <Flex alignItems="start" flexDirection="col">
              <Flex alignItems="start" flexDirection={!isDesktop ? 'row' : 'col'}>
                <Title className="text-left">{t.price}</Title>
                <TabGroup
                  index={priceIndex}
                  onIndexChange={isTokenListExpanded ? setPriceIndex : undefined}
                  className="mb-4 xl:mb-0 xl:text-right max-w-[200px]"
                >
                  <TabList
                    className="float-left xl:float-right"
                    variant={!isDesktop ? 'solid' : 'line'}
                    onClick={e => e.stopPropagation()}
                  >
                    <Flex>
                      {token.map((t, i) => (
                        <div className={isTokenListExpanded || priceIndex === i ? 'block' : 'hidden'} key={t.label}>
                          <Flex>
                            <ChevronLeftIcon
                              className={cls('h-4 w-4 mr-2', !isTokenListExpanded ? 'block' : 'hidden')}
                              onClick={() => changeToken(false)}
                            />
                            <Tab onClick={!isTokenListExpanded ? () => changeToken() : undefined}>{t.label}</Tab>
                            <ChevronRightIcon
                              className={cls('h-4 w-4 ml-2', !isTokenListExpanded ? 'block' : 'hidden')}
                              onClick={() => changeToken(true)}
                            />
                          </Flex>
                        </div>
                      ))}
                    </Flex>
                  </TabList>
                </TabGroup>
              </Flex>
              <Flex alignItems="start">
                <Metric color="green" className={!token.length ? 'blur-sm' : 'animate-unblur'}>
                  {getCurrency(token, token.at(priceIndex)?.label)}
                </Metric>
                <BadgeDelta className="mt-2" deltaType={getDeltaType(getRatio(token, token.at(priceIndex)?.label))}>
                  {getRatio(token, token.at(priceIndex)?.label)}
                </BadgeDelta>
              </Flex>
            </Flex>
          </AccordionHeader>
          <AccordionBody>
            <AreaChart
              className="h-44"
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
          </AccordionBody>
        </Accordion>
      </Grid>
      <Accordion className="group" defaultOpen={!isMobileSize()}>
        <AccordionHeader>
          <Title>Performance</Title>
          {historic.length > 1 && (
            <SparkAreaChart
              className="ml-4 h-10 w-[80%] text-center animate-display group-data-[headlessui-state=open]:invisible"
              data={historic.sort((a, b) => a.date - b.date)}
              categories={[t.total]}
              index={'stringDate'}
              colors={['emerald']}
              curveType="monotone"
              noDataText={t.loading}
            />
          )}
        </AccordionHeader>
        <AccordionBody>
          <AreaChart
            className="h-80"
            data={historic.sort((a, b) => a.date - b.date)}
            categories={[t.transfered, t.total]}
            index="stringDate"
            colors={['indigo', 'fuchsia']}
            valueFormatter={number => number.toShortCurrency()}
            yAxisWidth={50}
            showAnimation={true}
            animationDuration={2000}
            curveType="monotone"
            noDataText={t.loading}
          />
        </AccordionBody>
      </Accordion>
    </>
  );
}
