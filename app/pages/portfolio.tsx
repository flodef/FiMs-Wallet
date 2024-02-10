import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AreaChart,
  BadgeDelta,
  Divider,
  Flex,
  Metric,
  SparkAreaChart,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Title,
} from '@tremor/react';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import GainsBar from '../components/gainsBar';
import { Page, useNavigation } from '../hooks/useNavigation';
import { useUser } from '../hooks/useUser';
import { TOKEN_PATH } from '../utils/constants';
import { RoundingDirection } from '../utils/extensions';
import { isMobileSize } from '../utils/mobile';
import { DataName, loadData } from '../utils/processData';
import { Data, Dataset } from '../utils/types';

const t: Dataset = {
  totalValue: 'Valeur totale',
  assets: 'Actifs',
  emptyPortfolio: 'Aucun actif trouvé',
  dataLoading: 'Chargement des données...',
  tokenLogo: 'Logo du token',
  total: 'Total',
  transfered: 'Investi',
  loading: 'Chargement...',
};

interface Token extends Data {
  symbol: string;
}

interface Asset {
  name: string;
  symbol: string;
  balance: number;
}

interface Portfolio {
  address: string;
  token: number[];
  total: number;
  invested: number;
  profitValue: number;
  profitRatio: number;
  yearlyYield: number;
  solProfitPrice: number;
}

interface Wallet {
  image: string;
  name: string;
  symbol: string;
  balance: number;
  value: number;
  total: number;
}

interface Historic {
  date: number;
  stringDate: string;
  Investi: number;
  Total: number;
}

export default function Portfolio() {
  const { user } = useUser();
  const { page, needRefresh, setNeedRefresh } = useNavigation();

  const [wallet, setWallet] = useState<Wallet[]>();
  const [portfolio, setPortfolio] = useState<Portfolio>();
  const [historic, setHistoric] = useState<Historic[]>([]);

  const loadAssets = async (address: string, hasFiMsToken: boolean) => {
    return await fetch(
      `/api/solana/getAssets?address=${address}${hasFiMsToken ? '&creator=CCLcWAJX6fubUqGyZWz8dyUGEddRj8h4XZZCNSDzMVx4' : ''}`,
    ).then(async value => {
      return await value.json().then((tokens: Asset[]) => {
        return tokens;
      });
    });
  };

  const loaded = useRef(false);
  useEffect(() => {
    if (!user || (loaded.current && !needRefresh && page !== Page.Portfolio)) return;

    setNeedRefresh(false);

    loadData(DataName.token)
      .then((tokens: Token[]) => {
        loadData(DataName.portfolio)
          .then(async (data: Portfolio[]) => {
            const p = data.find(d => d.address === user.address) ?? {
              address: user.address,
              token: [],
              total: 0,
              invested: 0,
              profitValue: 0,
              profitRatio: 0,
              yearlyYield: 0,
              solProfitPrice: 0,
            };
            const assets = await loadAssets(user.address, !!p.total);
            if (assets.length) {
              p.total = assets.reduce(
                (a, b) => a + (b.balance ?? 0) * (tokens.find(t => t.label === b.name)?.value ?? 0),
                0,
              );
              p.profitValue = p.total - p.invested;
              p.token = tokens.map(t => assets.find(a => a.name === t.label)?.balance ?? 0);
            }
            setPortfolio(p);

            setWallet(
              tokens
                .map((t, i) => ({
                  image: TOKEN_PATH + t.label.replaceAll(' ', '') + '.png',
                  name: t.label,
                  symbol: t.symbol,
                  balance: p.token[i],
                  value: t.value,
                  total: p.token[i] * t.value,
                }))
                .filter(t => t.balance)
                .sort((a, b) => b.total - a.total),
            );
          })
          .then(() => loadData(user.name).then(setHistoric));
      })
      .catch(console.error)
      .finally(() => (loaded.current = true));
  }, [needRefresh, setNeedRefresh, page, user]);

  const { minHisto, maxHisto } = useMemo(() => {
    const minHisto = Math.min(...[...historic.map(d => d.Investi), ...historic.map(d => d.Total)]).toDecimalPlace(
      3,
      RoundingDirection.down,
    );
    const maxHisto = Math.max(...[...historic.map(d => d.Investi), ...historic.map(d => d.Total)]).toDecimalPlace(
      3,
      RoundingDirection.up,
    );

    return { minHisto, maxHisto };
  }, [historic]);

  return (
    <>
      <Accordion defaultOpen={true}>
        <AccordionHeader>
          <Flex alignItems="start">
            <div>
              <Title className="text-left">{t.totalValue}</Title>
              <Metric color="green" className={!loaded.current ? 'blur-sm' : 'animate-unblur'}>
                {(portfolio?.total ?? 0).toLocaleCurrency()}
              </Metric>
            </div>
            <BadgeDelta
              deltaType={
                portfolio && portfolio?.yearlyYield < 0
                  ? 'moderateDecrease'
                  : portfolio && portfolio?.yearlyYield > 0
                    ? 'moderateIncrease'
                    : 'unchanged'
              }
            >
              {(portfolio?.yearlyYield ?? 0).toRatio()}
            </BadgeDelta>
          </Flex>
        </AccordionHeader>
        <AccordionBody>
          {!loaded.current || wallet?.length ? (
            <>
              <GainsBar values={portfolio} loaded={loaded.current} />
              <Divider style={{ fontSize: 18 }}>{t.assets}</Divider>
            </>
          ) : null}

          {loaded.current ? (
            <Table>
              <TableBody>
                {wallet &&
                  wallet.map(asset => (
                    <TableRow
                      key={asset.name}
                      className="hover:bg-tremor-background-subtle dark:hover:bg-dark-tremor-background-subtle"
                    >
                      <TableCell>
                        <Image
                          className="rounded-full"
                          src={asset.image}
                          alt={t.tokenLogo}
                          width={50}
                          height={50}
                        ></Image>
                      </TableCell>
                      <TableCell>
                        <Flex justifyContent="between">
                          <div className="text-xl truncate">{asset.name}</div>
                          <div>{`${asset.balance.toShortFixed()} ${asset.symbol}`}</div>
                        </Flex>
                        <Flex justifyContent="between">
                          <div>{asset.value ? asset.value.toLocaleCurrency() : ''}</div>
                          <div className="font-bold text-lg">{asset.total.toLocaleCurrency()}</div>
                        </Flex>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableBody>
                <TableRow className="animate-pulse">
                  <TableCell>
                    <div className="rounded-full w-[50px] h-[50px] bg-tremor-border"></div>
                  </TableCell>
                  <TableCell>
                    <Flex justifyContent="between">
                      <div className="bg-tremor-border w-24 h-7 mb-1 rounded-md"></div>
                      <div className="bg-tremor-border w-10 h-5 mb-1 rounded-md"></div>
                    </Flex>
                    <Flex justifyContent="between">
                      <div className="bg-tremor-border w-16 h-5 mb-1 rounded-md"></div>
                      <div className="bg-tremor-border w-24 h-7 mb-1 rounded-md"></div>
                    </Flex>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </AccordionBody>
      </Accordion>

      {!loaded.current || (wallet?.length && portfolio?.invested) ? (
        <Accordion className="group" defaultOpen={!isMobileSize()}>
          <AccordionHeader>
            <Title>Performance</Title>
            {historic.length > 1 && (
              <Flex className="w-full" justifyContent="center">
                <SparkAreaChart
                  data={historic.sort((a, b) => a.date - b.date)}
                  categories={[t.total]}
                  index={'stringDate'}
                  colors={['emerald']}
                  className="ml-4 h-10 w-[80%] text-center animate-display group-data-[headlessui-state=open]:invisible"
                  curveType="monotone"
                  noDataText={t.loading}
                />
              </Flex>
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
              minValue={minHisto}
              maxValue={maxHisto}
            />
          </AccordionBody>
        </Accordion>
      ) : null}
    </>
  );
}
