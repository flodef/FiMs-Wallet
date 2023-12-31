import { ChartPieIcon, ChevronLeftIcon, ChevronRightIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AreaChart,
  BadgeDelta,
  BarList,
  DeltaBar,
  Flex,
  Grid,
  Metric,
  SparkAreaChart,
  Subtitle,
  Tab,
  TabGroup,
  TabList,
  Title,
} from '@tremor/react';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useWindowParam } from '../hooks/useWindowParam';
import { getBarData } from '../utils/chart';
import { isMobileSize, useIsMobile } from '../utils/mobile';
import {} from '../utils/number';
import { DataName, loadData } from '../utils/processData';
import { dataset } from '../utils/types';

const tokenValueStart = 100;

const t: dataset = {
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

interface data {
  label: string;
  value: number;
  ratio: number;
}

interface token extends data {
  duration: number;
}

interface historic {
  date: number;
  stringDate: string;
  Investi: number;
  Trésorerie: number;
}

interface tokenHisto {
  date: string;
  Montant: number;
}

const today = new Date();

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<data[]>([]);
  const [token, setToken] = useState<token[]>([]);
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
    (token: token[]) => {
      let min = tokenValueStart;
      let max = tokenValueStart;
      const tokenHisto: tokenHisto[][] = [];
      token.forEach((t) => {
        const tokenValueEnd = tokenValueStart * (1 + parseFloat(getRatio(token, t.label)) / 100);
        tokenHisto.push([
          {
            date: new Date(today.getTime() - t.duration * 24 * 60 * 60 * 1000).toLocaleDateString(),
            Montant: tokenValueStart,
          },
          {
            date: today.toLocaleDateString(),
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
            .then((data: token[]) => {
              setToken(data);
              generateTokenHisto(data);
            })
            .then(() => {
              loadData(DataName.historic).then((data: historic[]) => {
                setHistoric(data);
              });
            });
        });
    }
  }, [refresh, generateTokenHisto]);

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

  const isTablet = useIsMobile(1024);
  const width = useWindowParam().width;
  const isTokenListExpanded = (width > 400 && width < 640) || width > 830;

  const [resultIndex, setResultIndex] = useState(0);
  const [priceIndex, setPriceIndex] = useState(0);
  const changeToken = useCallback(
    (increment = true) => {
      setTimeout(() => {
        setPriceIndex(((priceIndex ? priceIndex : token.length) + (increment ? 1 : -1)) % token.length);
      }, 100); // Wait for indexChange event to be triggered
    },
    [priceIndex, token.length]
  );

  return (
    <>
      <Accordion defaultOpen={!isMobileSize()}>
        <AccordionHeader>
          <Flex alignItems="start">
            <div>
              <Title className="text-left">{t['assets']}</Title>
              <Metric color="green" className={!loaded.current ? 'blur-sm' : 'animate-unblur'}>
                {getValue(dashboard, 'assets', 500000)}
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
        </AccordionHeader>
        <AccordionBody>
          <Flex className="mt-4">
            <Subtitle className={'truncate ' + (!loaded.current ? 'blur-sm' : 'animate-unblur')}>
              {`${t['gains']} : ${getValue(dashboard, 'gains')} (${getRatio(dashboard, 'gains')})`}
            </Subtitle>
            <Subtitle className={'truncate hidden sm:block ' + (!loaded.current ? 'blur-sm' : 'animate-unblur')}>
              {`${t['transfered']} : ${getValue(dashboard, 'transfered')}`}
            </Subtitle>
          </Flex>
          <DeltaBar value={parseFloat(getRatio(dashboard, 'gains'))} className="mt-2" />
        </AccordionBody>
      </Accordion>

      <Grid numItemsSm={2} numItemsLg={result.length} className="gap-6">
        <Accordion defaultOpen={!isMobileSize()}>
          <AccordionHeader>
            <Flex alignItems="start" flexDirection="col">
              <Flex alignItems="start" flexDirection={!isTablet ? 'row' : 'col'}>
                <Title className="text-left whitespace-nowrap">{t['result']}</Title>
                <TabGroup index={resultIndex} onIndexChange={setResultIndex} className={'mb-4 lg:mb-0 lg:text-right'}>
                  <TabList
                    className="float-left lg:float-right"
                    variant={!isTablet ? 'solid' : 'line'}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Tab icon={ChartPieIcon}>{t['total']}</Tab>
                    <Tab icon={ListBulletIcon}>{t['profit']}</Tab>
                  </TabList>
                </TabGroup>
              </Flex>
              <Flex alignItems="start">
                <Metric
                  color={result[resultIndex].total.fromCurrency() < 0 ? 'red' : 'green'}
                  className={!loaded.current ? 'blur-sm' : 'animate-unblur'}
                >
                  {result[resultIndex].total}
                </Metric>
                <BadgeDelta
                  className="mt-2"
                  deltaType={
                    parseFloat(getRatio(dashboard, 'profit')) < 0
                      ? 'moderateDecrease'
                      : parseFloat(getRatio(dashboard, 'profit')) > 0
                        ? 'moderateIncrease'
                        : 'unchanged'
                  }
                >
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
                (result[resultIndex].data.find((d) => d.value === number)?.amount ?? number).toLocaleCurrency()
              }
              className="mt-2"
            />
          </AccordionBody>
        </Accordion>
        <Accordion defaultOpen={!isMobileSize()}>
          <AccordionHeader>
            <Flex alignItems="start" flexDirection="col">
              <Flex alignItems="start" flexDirection={!isTablet ? 'row' : 'col'}>
                <Title className="text-left">{t['price']}</Title>
                <TabGroup
                  index={priceIndex}
                  onIndexChange={isTokenListExpanded ? setPriceIndex : undefined}
                  className="mb-4 lg:mb-0 lg:text-right max-w-[200px]"
                >
                  <TabList
                    className="float-left lg:float-right"
                    variant={!isTablet ? 'solid' : 'line'}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Flex>
                      {token.map((t, i) => (
                        <div className={isTokenListExpanded || priceIndex === i ? 'block' : 'hidden'} key={t.label}>
                          <Flex>
                            <ChevronLeftIcon
                              className={(!isTokenListExpanded ? 'block' : 'hidden') + ' h-4 w-4 mr-2'}
                              onClick={() => changeToken(false)}
                            />
                            <Tab onClick={!isTokenListExpanded ? () => changeToken() : undefined}>{t.label}</Tab>
                            <ChevronRightIcon
                              className={(!isTokenListExpanded ? 'block' : 'hidden') + ' h-4 w-4 ml-2'}
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
                <Metric color="green" className={!loaded.current ? 'blur-sm' : 'animate-unblur'}>
                  {getValue(token, token.at(priceIndex)?.label)}
                </Metric>
                <BadgeDelta
                  className="mt-2"
                  deltaType={
                    parseFloat(getRatio(token, token.at(priceIndex)?.label)) < 0
                      ? 'moderateDecrease'
                      : parseFloat(getRatio(token, token.at(priceIndex)?.label)) > 0
                        ? 'moderateIncrease'
                        : 'unchanged'
                  }
                >
                  {getRatio(token, token.at(priceIndex)?.label)}
                </BadgeDelta>
              </Flex>
            </Flex>
          </AccordionHeader>
          <AccordionBody>
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
              valueFormatter={(number) => number.toFixed(0)}
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
          </AccordionBody>
        </Accordion>
      </Grid>
      <Accordion className="group" defaultOpen={!isMobileSize()}>
        <AccordionHeader>
          <Title>Performance</Title>
          <Flex className="w-full" justifyContent="center">
            <SparkAreaChart
              data={historic.sort((a, b) => a.date - b.date)}
              categories={[t['total']]}
              index={'stringDate'}
              colors={['emerald']}
              className="ml-4 h-10 w-[80%] text-center animate-display group-data-[headlessui-state=open]:invisible"
              curveType="monotone"
              noDataText={t['loading']}
            />
          </Flex>
        </AccordionHeader>
        <AccordionBody>
          <AreaChart
            className="h-80"
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
        </AccordionBody>
      </Accordion>
    </>
  );
}
