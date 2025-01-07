import { IconChevronLeft, IconChevronRight, IconChevronsRight } from '@tabler/icons-react';
import { AreaChart, SparkAreaChart, Tab, TabGroup, TabList } from '@tremor/react';

import { Col, Drawer, Flex, Row } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { BarList } from '../components/barList';
import { CollapsiblePanel } from '../components/collapsiblePanel';
import GainsBar from '../components/gainsBar';
import { getRisk, TokenGraphs } from '../components/tokenGraphs';
import RatioBadge from '../components/ratioBadge';
import { LoadingMetric, Subtitle, Text, Title } from '../components/typography';
import { DashboardToken, Historic, TokenHistoric, useData } from '../hooks/useData';
import { Page, useNavigation } from '../hooks/useNavigation';
import { useWindowParam } from '../hooks/useWindowParam';
import { AvailableChartColorsKeys } from '../utils/chart';
import { FIMS } from '../utils/constants';
import {} from '../utils/extensions';
import { findValue, getCurrency, getRatio } from '../utils/functions';
import { DataName, loadData } from '../utils/processData';
import { Data, Dataset } from '../utils/types';

const tokenValueStart = 100;
const tokenColors: AvailableChartColorsKeys[] = ['blue', 'amber', 'cyan'];

const t: Dataset = {
  price: 'Prix',
  volatility: 'Volatilité',
  risk: 'Risque',
  performances: 'Performances',
  yearlyYield: 'Rendement annuel',
  description: 'Description',
  distribution: 'Répartition',
  creation: 'Création',
  initPrice: 'Prix initial',
  historic: 'Historique',
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

const today = new Date();
const thisPage = Page.Dashboard;

export default function Dashboard() {
  const { page, needRefresh, setNeedRefresh } = useNavigation();
  const {
    dashboard,
    setDashboard,
    tokens,
    setTokens,
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

  const generateTokenHistoric = useCallback(
    (token: DashboardToken[]) => {
      token = token.filter(({ label }) => label.includes(FIMS));
      setTokens(token);

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
    [setTokens, setTokenHistoric, setTokenHistoricLimit],
  );

  const isLoading = useRef(false);
  useEffect(() => {
    if (isLoading.current || !needRefresh || page !== thisPage) return;

    isLoading.current = true;
    setNeedRefresh(false);

    loadData(DataName.dashboard)
      .then(dashboard => setDashboard(dashboard as Data[]))
      .then(() => loadData(DataName.tokens))
      .then(tokens => generateTokenHistoric(tokens as DashboardToken[]))
      .then(() => loadData(DataName.historic))
      .then(historic => setHistoric(historic as Historic[]))
      .catch(console.error)
      .finally(() => (isLoading.current = false));
  }, [needRefresh, setNeedRefresh, page, generateTokenHistoric, setDashboard, setHistoric]);

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
  const changeToken = useCallback(
    (increment = true) => {
      setTimeout(() => {
        setSelectedPrice(((selectedPrice.current || tokens.length) + (increment ? 1 : -1)) % tokens.length);
      }, 100); // Wait for indexChange event to be triggered
    },
    [tokens.length, setSelectedPrice],
  );

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
                              {tokens.map((t, i) => (
                                <div
                                  className={isTokenListExpanded || selectedPrice.current === i ? 'block' : 'hidden'}
                                  key={t.label}
                                >
                                  <Flex align="center">
                                    <IconChevronLeft
                                      className={twMerge('h-4 w-4 mr-2', !isTokenListExpanded ? 'block' : 'hidden')}
                                      onClick={() => changeToken(false)}
                                    />
                                    <Tab onClick={!isTokenListExpanded ? () => changeToken() : undefined}>
                                      {t.label}
                                    </Tab>
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
                          <LoadingMetric isReady={tokens.length > 0}>
                            {getCurrency(tokens, currentToken.label)}
                          </LoadingMetric>
                        </Flex>
                        <Flex justify="space-between" align="center">
                          <Title>{t.yearlyYield}</Title>
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
                          <Title>{t.distribution}</Title>
                          <Text>
                            {(
                              (result.data.find(t => t.label === currentToken.label)?.value || 0) / result.total
                            ).toRatio(0)}
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
