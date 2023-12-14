'use client';

import { BarList, Card, Flex, Grid, Metric, Text, Title } from '@tremor/react';
import { useEffect, useRef, useState } from 'react';
import { getBarData } from './utils/chart';
import { loadData } from './utils/processData';
// import Chart from './chart';

export default function IndexPage() {
  const [result, setResult] = useState([
    { name: 'Total', label: 'TOTAL', value: 0, total: 234072.58 },
    {
      name: 'Investis',
      label: 'Transfered',
      value: 0,
      total: 261952.97
    },
    {
      name: 'Profits',
      label: 'Profit',
      value: 0,
      total: -27398.13
    },
    {
      name: 'FiMs SOL',
      label: 'Price @',
      value: 0,
      total: 65.31
    },
    {
      name: 'FiMs Token',
      label: 'Price @',
      value: 0,
      total: 1.011
    }
  ]);

  const loaded = useRef(false);
  const [refresh, setRefresh] = useState(false);
  useEffect(() => {
    if (!loaded.current || refresh) {
      loadData().then((data) => {
        console.log(data);
        loaded.current = true;

        // Refresh data every minute
        setRefresh(false);
        setTimeout(() => {
          setRefresh(true);
        }, 60000);

        // Update data
        setResult(
          result.map((item) => {
            return {
              name: item.name,
              label: item.label,
              value: item.value,
              total:
                data.find((d) => d.label.startsWith(item.label))?.value ?? 0
            };
          })
        );
      });
    }
  }, [refresh, result]);

  // TODO: Replace with real data
  // TODO: Add explanation for the data titles

  const distribution = [
    getBarData('Transferts', -1958.64),
    getBarData('Stratégie', -70053.31),
    getBarData('Prix', 42202.53)
  ];

  const currencies = [
    getBarData('Solana', 279669.56),
    getBarData('Euros', -47526.02)
  ];

  const data = [
    {
      category: 'Trésorerie',
      total: 234072.58,
      context: 'Monnaie',
      data: currencies
    },
    {
      category: 'Profits',
      total: -27398.13,
      context: 'Type',
      data: distribution
    }
  ];

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Card className="mb-8">
        <Grid numItemsSm={2} numItemsLg={result.length} className="gap-6">
          {result.map((item) => (
            <div key={item.name}>
              <Title>{item.name}</Title>
              <Flex
                justifyContent="start"
                alignItems="baseline"
                className="space-x-2"
              >
                <Metric
                  color={item.total < 0 ? 'red' : 'green'}
                  className={!loaded.current ? 'blur-sm' : 'animate-unblur'}
                  style={{
                    fontSize: item.name === 'Total' ? '2rem' : '1.5rem'
                  }}
                >
                  {Intl.NumberFormat('fr', {
                    style: 'currency',
                    currency: 'EUR'
                  })
                    .format(item.total)
                    .toString()}
                </Metric>
              </Flex>
            </div>
          ))}
        </Grid>
      </Card>
      <Grid numItemsSm={2} numItemsLg={data.length} className="gap-6">
        {data.map((item) => (
          <Card data-testid="card" key={item.category}>
            <Title>{item.category}</Title>
            <Flex
              justifyContent="start"
              alignItems="baseline"
              className="space-x-2"
            >
              <Metric color={item.total < 0 ? 'red' : 'green'}>
                {Intl.NumberFormat('fr', {
                  style: 'currency',
                  currency: 'EUR'
                })
                  .format(item.total)
                  .toString()}
              </Metric>
              <Text></Text>
            </Flex>
            <Flex className="mt-6">
              <Text>{item.context}</Text>
              <Text className="text-right"></Text>
            </Flex>
            <BarList
              data-testid="bar-chart"
              data={item.data}
              showAnimation={true}
              valueFormatter={(number: number) =>
                Intl.NumberFormat('fr', {
                  style: 'currency',
                  currency: 'EUR'
                })
                  .format(
                    item.data.find((d) => d.value === number)?.amount ?? number
                  )
                  .toString()
              }
              className="mt-2"
            />
          </Card>
        ))}
      </Grid>
      {/* <Chart /> */}
    </main>
  );
}
