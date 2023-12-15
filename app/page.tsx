'use client';

import { ChartPieIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import {
  AreaChart,
  BadgeDelta,
  BarList,
  Card,
  DeltaBar,
  Flex,
  Grid,
  Metric,
  Subtitle,
  Tab,
  TabGroup,
  TabList,
  Title,
} from '@tremor/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getBarData } from './utils/chart';
import { useIsMobile } from './utils/mobile';
import {} from './utils/number';
import { DataName, loadData } from './utils/processData';
import { useIsReady } from './hooks/useWindowParam';

const tokenValueStart = 1000;

interface dataset {
  [key: string]: string;
}
const t: dataset = {
  price: 'Prix',
  result: 'Résultat',
  total: 'Trésorerie',
  profit: 'Profits',
  transfered: 'Total Investi',
  currency: 'Monnaie',
  type: 'Type',
  'transfer cost': 'Transferts',
  'strategy cost': 'Stratégie',
  'price change': 'Prix',
  charity: 'Charité',
  loading: 'Chargement...',
  amount: 'Montant',
};

interface data {
  label: string;
  value: number;
  ratio: number;
}

interface historic {
  date: number;
  stringDate: string;
  'Total Investi': number;
  Trésorerie: number;
}

interface tokenHisto {
  date: string;
  Montant: number;
}

const today = new Date();
const todayDate = today.toLocaleDateString();
const nextYearDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toLocaleDateString();

export default function IndexPage() {
  const [dashboard, setDashboard] = useState<data[]>([]);
  const [token, setToken] = useState<data[]>([]);
  const [historic, setHistoric] = useState<historic[]>([]);
  const [tokenHisto, setTokenHisto] = useState<tokenHisto[][]>([]);
  const [tokenHistoLimit, setTokenHistoLimit] = useState<{ min: number; max: number }>();

  const findValue = useCallback((data: data[], label: string | undefined) => {
    return label ? data.find((d) => d.label.toLowerCase().includes(label.toLowerCase())) : undefined;
  }, []);
  const getValue = useCallback(
    (data: data[], label: string | undefined, defaultValue = 0) => {
      return (findValue(data, label)?.value ?? defaultValue).toLocaleCurrency();
    },
    [findValue]
  );
  const getRatio = useCallback(
    (data: data[], label: string | undefined, defaultValue = 0) => {
      return (findValue(data, label)?.ratio ?? defaultValue).toRatio();
    },
    [findValue]
  );

  const generateTokenHisto = useCallback(
    (token: data[]) => {
      let min = tokenValueStart;
      let max = tokenValueStart;
      const tokenHisto: tokenHisto[][] = [];
      token.forEach((t) => {
        const tokenValueEnd = tokenValueStart * (1 + parseFloat(getRatio(token, t.label)) / 100);
        tokenHisto.push([
          {
            date: todayDate,
            Montant: tokenValueStart,
          },
          {
            date: nextYearDate,
            Montant: tokenValueEnd,
          },
        ]);
        min = Math.min(min, tokenValueEnd);
        max = Math.max(max, tokenValueEnd);
      });
      setTokenHisto(tokenHisto);
      setTokenHistoLimit({
        min: min,
        max: max,
      });
      console.log(min, max);
    },
    [getRatio]
  );

  const loaded = useRef(false);
  const [refresh, setRefresh] = useState(false);
  useEffect(() => {
    if (!loaded.current || refresh) {
      loadData(DataName.dashboard)
        .then((data: data[]) => {
          loaded.current = true;

          // Refresh data every minute
          setRefresh(false);
          setTimeout(() => {
            setRefresh(true);
          }, 60000);

          // Update data
          setDashboard(data);
        })
        .then(() => {
          loadData(DataName.token)
            .then((data: data[]) => {
              console.log(data);
              setToken(data);
              generateTokenHisto(data);
            })
            .then(() => {
              loadData(DataName.historic).then((data: historic[]) => {
                console.log(data);
                setHistoric(data);
              });
            });
        });
    }
  }, [refresh, generateTokenHisto]);

  // TODO: Add explanation for the data titles

  const getBarList = useCallback(
    (labels: string[]) => {
      return labels
        .map((label) => {
          return getBarData(t[label] ?? label, getValue(dashboard, label).fromCurrency());
        })
        .sort((a, b) => b.value - a.value);
    },
    [getValue, dashboard]
  );

  const result = [
    {
      category: t['total'],
      total: getValue(dashboard, 'total', 100000),
      data: getBarList(['Solana', 'Bitcoin', 'Nexo', 'FiMs']),
    },
    {
      category: t['profit'],
      total: getValue(dashboard, 'profit', 10000),
      data: getBarList(['transfer cost', 'strategy cost', 'price change', 'charity']),
    },
  ];

  const [resultIndex, setResultIndex] = useState(0);
  const [priceIndex, setPriceIndex] = useState(0);

  const isMobile = useIsMobile();

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Card className="mb-8">
        <Flex alignItems="start">
          <div>
            <Title>{t['transfered']}</Title>
            <Metric color="green" className={!loaded.current ? 'blur-sm' : 'animate-unblur'}>
              {getValue(dashboard, 'transfered', 200000)}
            </Metric>
          </div>
          <BadgeDelta
            deltaType={
              parseFloat(getRatio(dashboard, 'price @')) < 0
                ? 'moderateDecrease'
                : parseFloat(getRatio(dashboard, 'price @')) > 0
                  ? 'moderateIncrease'
                  : 'unchanged'
            }
          >
            {getRatio(dashboard, 'price @')}
          </BadgeDelta>
        </Flex>
        <Flex className="mt-4">
          {!isMobile && (
            <Subtitle className={'truncate ' + (!loaded.current ? 'blur-sm' : 'animate-unblur')}>
              {`${t['total']} : ${getValue(dashboard, 'total')}`}
            </Subtitle>
          )}
          <Subtitle className={'truncate ' + (!loaded.current ? 'blur-sm' : 'animate-unblur')}>
            {`${t['profit']} : ${getValue(dashboard, 'profit')} (${getRatio(dashboard, 'profit')})`}
          </Subtitle>
        </Flex>
        <DeltaBar value={parseFloat(getRatio(dashboard, 'profit'))} className="mt-2" />
      </Card>
      <Grid numItemsSm={2} numItemsLg={result.length} className="gap-6 mb-8">
        <Card>
          <Flex alignItems="start" flexDirection={!isMobile ? 'row' : 'col'}>
            <div>
              <Title className="mb-2">{t['result']}</Title>
            </div>
            {useIsReady() && (
              <TabGroup
                index={resultIndex}
                onIndexChange={setResultIndex}
                className={!isMobile ? 'text-right' : 'mt-2 mb-4'}
              >
                <TabList variant={!isMobile ? 'solid' : 'line'}>
                  <Tab icon={ChartPieIcon}>{t['total']}</Tab>
                  <Tab icon={ListBulletIcon}>{t['profit']}</Tab>
                </TabList>
              </TabGroup>
            )}
          </Flex>
          <Flex className="mb-6" alignItems="start">
            <div>
              <Metric
                color={result[resultIndex].total.fromCurrency() < 0 ? 'red' : 'green'}
                className={!loaded.current ? 'blur-sm' : 'animate-unblur'}
              >
                {result[resultIndex].total}
              </Metric>
            </div>
          </Flex>
          <BarList
            data-testid="bar-chart"
            data={result[resultIndex].data}
            showAnimation={true}
            valueFormatter={(number: number) =>
              (result[resultIndex].data.find((d) => d.value === number)?.amount ?? number).toLocaleCurrency()
            }
            className="mt-2"
          />
        </Card>
        <Card>
          <Flex alignItems="start" flexDirection={!isMobile ? 'row' : 'col'}>
            <Title className="mb-2">{t['price']}</Title>
            {useIsReady() && (
              <TabGroup
                index={priceIndex}
                onIndexChange={setPriceIndex}
                className={!isMobile ? 'text-right' : 'mt-2 mb-4'}
              >
                <TabList variant={!isMobile ? 'solid' : 'line'}>
                  {token.map((t) => (
                    <Tab key={t.label}>{t.label}</Tab>
                  ))}
                </TabList>
              </TabGroup>
            )}
          </Flex>
          <Flex className="mb-5" alignItems="start">
            <div>
              <Metric color="green" className={!loaded.current ? 'blur-sm' : 'animate-unblur'}>
                {getValue(token, token.at(priceIndex)?.label)}
              </Metric>
            </div>
          </Flex>
          <AreaChart
            className="h-44"
            data={tokenHisto[priceIndex]}
            categories={[t['amount']]}
            index="date"
            colors={[
              tokenHisto.length && tokenHisto[priceIndex][0].Montant < tokenHisto[priceIndex][1].Montant
                ? 'green'
                : 'red',
            ]}
            valueFormatter={(number) => number.toShortCurrency()}
            yAxisWidth={50}
            showAnimation={true}
            animationDuration={2000}
            curveType="monotone"
            noDataText={t['loading']}
            minValue={tokenHistoLimit?.min ?? 0}
            maxValue={tokenHistoLimit?.max ?? 0}
            showLegend={false}
            startEndOnly={true}
          />
        </Card>
      </Grid>
      <Card className="mt-8">
        <Title>Performance</Title>
        <AreaChart
          className="mt-4 h-80"
          data={historic.sort((a, b) => a.date - b.date)}
          categories={[t['transfered'], t['total']]}
          index="stringDate"
          colors={['indigo', 'fuchsia']}
          valueFormatter={(number) => number.toShortCurrency()}
          yAxisWidth={50}
          showAnimation={true}
          animationDuration={2000}
          curveType="monotone"
          noDataText={t['loading']}
        />
      </Card>
    </main>
  );
}
