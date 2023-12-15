'use client';

import {
  BadgeDelta,
  BarList,
  Card,
  DeltaBar,
  Flex,
  Grid,
  Metric,
  Subtitle,
  Text,
  Title,
  AreaChart,
} from '@tremor/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getBarData } from './utils/chart';
import {} from './utils/currency';
import { DataName, loadData } from './utils/processData';
// import Chart from './chart';

export default function IndexPage() {
  interface dataset {
    [key: string]: string;
  }
  const translation = useMemo<dataset>(() => {
    return {
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
    };
  }, []);

  const [dashboard, setDashboard] = useState<{ label: string; value: number; ratio: number }[]>([]);
  const [token, setToken] = useState<{ name: string; value: number; inceptionYield: number }[]>([]);
  const [historic, setHistoric] = useState<
    { date: number; stringDate: string; 'Total Investi': number; Trésorerie: number }[]
  >([]);

  const loaded = useRef(false);
  const [refresh, setRefresh] = useState(false);
  useEffect(() => {
    if (!loaded.current || refresh) {
      loadData(DataName.dashboard)
        .then((data) => {
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
            .then((data) => {
              console.log(data);
              setToken(data);
            })
            .then(() => {
              loadData(DataName.historic).then((data) => {
                console.log(data);
                setHistoric(data);
              });
            });
        });
    }
  }, [refresh, translation]);

  // TODO: Add token data
  // TODO: Add explanation for the data titles

  const findValue = useCallback(
    (label: string) => {
      return dashboard.find((d) => d.label.toLowerCase().includes(label.toLowerCase()));
    },
    [dashboard]
  );
  const getValue = useCallback(
    (label: string, defaultValue = 0) => {
      return (findValue(label)?.value ?? defaultValue).toLocaleCurrency();
    },
    [findValue]
  );
  const getRatio = useCallback(
    (label: string, defaultValue = 0) => {
      return (findValue(label)?.ratio ?? defaultValue).toRatio();
    },
    [findValue]
  );

  const getBarList = useCallback(
    (labels: string[]) => {
      return labels
        .map((label) => {
          return getBarData(translation[label] ?? label, getValue(label).fromCurrency());
        })
        .sort((a, b) => b.value - a.value);
    },
    [getValue, translation]
  );

  const data = [
    {
      category: translation['total'],
      total: getValue('total', 100000),
      context: translation['currency'],
      data: getBarList(['Solana', 'Bitcoin', 'Nexo']),
    },
    {
      category: translation['profit'],
      total: getValue('profit', 10000),
      context: translation['type'],
      data: getBarList(['transfer cost', 'strategy cost', 'price change', 'charity']),
    },
  ];

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Card className="mb-8">
        <Flex alignItems="start">
          <div>
            <Title>{translation['transfered']}</Title>
            <Metric color="green" className={!loaded.current ? 'blur-sm' : 'animate-unblur'}>
              {getValue('transfered', 200000)}
            </Metric>
          </div>
          <BadgeDelta
            deltaType={
              parseFloat(getRatio('price @')) < 0
                ? 'moderateDecrease'
                : parseFloat(getRatio('price @')) > 0
                  ? 'moderateIncrease'
                  : 'unchanged'
            }
          >
            {getRatio('price @')}
          </BadgeDelta>
        </Flex>
        <Flex className="mt-4">
          <Subtitle className={'truncate ' + (!loaded.current ? 'blur-sm' : 'animate-unblur')}>
            {`Trésorerie : ${getValue('total')}`}
          </Subtitle>
          <Subtitle className={'truncate ' + (!loaded.current ? 'blur-sm' : 'animate-unblur')}>
            {`Profits : ${getValue('profit')} (${getRatio('profit')})`}
          </Subtitle>
        </Flex>
        <DeltaBar value={parseFloat(getRatio('profit'))} className="mt-2" />
      </Card>
      <Grid numItemsSm={2} numItemsLg={data.length} className="gap-6">
        {data.map((item) => (
          <Card data-testid="card" key={item.category}>
            <Flex alignItems="start">
              <div>
                <Title>{item.category}</Title>
                <Metric
                  color={parseFloat(item.total) < 0 ? 'red' : 'green'}
                  className={!loaded.current ? 'blur-sm' : 'animate-unblur'}
                >
                  {item.total}
                </Metric>
              </div>
            </Flex>
            <Flex className="mt-6">
              <Subtitle>{item.context}</Subtitle>
              <Text className="text-right"></Text>
            </Flex>
            <BarList
              data-testid="bar-chart"
              data={item.data}
              showAnimation={true}
              valueFormatter={(number: number) =>
                (item.data.find((d) => d.value === number)?.amount ?? number).toLocaleCurrency()
              }
              className="mt-2"
            />
          </Card>
        ))}
      </Grid>
      <Card className="mt-8">
        <Title>Performance</Title>
        <AreaChart
          className="mt-4 h-80"
          data={historic.sort((a, b) => a.date - b.date)}
          categories={[translation['transfered'], translation['total']]}
          index="stringDate"
          colors={['indigo', 'fuchsia']}
          valueFormatter={(number) => number.toShortCurrency()}
          yAxisWidth={60}
          showAnimation={true}
          animationDuration={2000}
          curveType="monotone"
          noDataText={translation['loading']}
        />
      </Card>
    </main>
  );
}
