'use client';

import { Card, Metric, Text, Title, BarList, Flex, Grid } from '@tremor/react';
import { getBarData } from './utils';
// import Chart from './chart';

const result = [
  { name: 'Total', total: 234072.58 },
  {
    name: 'Investis',
    total: 261952.97
  },
  {
    name: 'Profits',
    total: -27398.13
  },
  {
    name: 'FiMs SOL',
    total: 65.31
  },
  {
    name: 'FiMs Token',
    total: 1.011
  }
];

const distribution = [
  getBarData('Fonctionnement', -1958.64),
  getBarData('Stratégie', -70053.31),
  getBarData('Prix', 42202.53)
];

const currencies = [
  getBarData('Solana', 279669.56),
  getBarData('Bitcoin', -47526.02)
];

const data = [
  {
    category: 'Répartition',
    context: 'Coûts / Profits',
    data: distribution
  },
  {
    category: 'Trésorerie',
    context: 'Monnaie',
    data: currencies
  }
];

export default function IndexPage() {
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
                <Text></Text>
              </Flex>
            </div>
          ))}
        </Grid>
      </Card>
      <Grid numItemsSm={2} numItemsLg={data.length} className="gap-6">
        {data.map((item) => (
          <Card data-testid="card" key={item.category}>
            <Title>{item.category}</Title>
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
