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
import { Privacy, PrivacyButton, toPrivacy } from '../components/privacy';
import { usePrivacy } from '../contexts/privacyProvider';
import { Page, useNavigation } from '../hooks/useNavigation';
import { useUser } from '../hooks/useUser';
import { TOKEN_PATH, getDeltaType } from '../utils/constants';
import { isMobileSize } from '../utils/mobile';
import { DataName, forceData, loadData } from '../utils/processData';
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

export interface PortfolioToken extends Data {
  symbol: string;
}

interface Asset {
  name: string;
  symbol: string;
  balance: number;
}

export interface Portfolio {
  id: number;
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

export interface UserHistoric {
  date: number;
  stringDate: string;
  Investi: number;
  Total: number;
}

const thisPage = Page.Portfolio;

export default function Portfolio() {
  const { user } = useUser();
  const { page, needRefresh, setNeedRefresh } = useNavigation();
  const { hasPrivacy } = usePrivacy();

  const [wallet, setWallet] = useState<Wallet[]>();
  const [portfolio, setPortfolio] = useState<Portfolio>();
  const [historic, setHistoric] = useState<UserHistoric[]>([]);

  const loadAssets = async (address: string, hasFiMsToken: boolean) => {
    return await fetch(
      `/api/solana/getAssets?address=${address}${hasFiMsToken ? '&creator=CCLcWAJX6fubUqGyZWz8dyUGEddRj8h4XZZCNSDzMVx4' : ''}`,
    )
      .then(async result => await (result.ok ? result.json() : undefined))
      .then((tokens: Asset[]) => tokens)
      .catch(console.error);
  };

  const isLoading = useRef(false);
  useEffect(() => {
    if (!user || isLoading.current || !needRefresh || page !== thisPage) return;

    isLoading.current = true;
    setNeedRefresh(false);

    loadData(DataName.token)
      .then((tokens: PortfolioToken[]) =>
        loadData(DataName.portfolio)
          .then(async (data: Portfolio[]) => {
            if (!data.length) data = await forceData(DataName.portfolio);
            if (!tokens.length) tokens = await forceData(DataName.token);

            const p = data.find(d => d.id === user.id) ?? {
              id: user.id,
              address: user.address,
              token: [],
              total: 0,
              invested: 0,
              profitValue: 0,
              profitRatio: 0,
              yearlyYield: 0,
              solProfitPrice: 0,
            };
            const assets = await loadAssets(user.address, !!p.invested);
            if (assets?.length) {
              p.total = assets.reduce(
                (a, b) => a + (b.balance ?? 0) * (tokens.find(t => t.label === b.name)?.value ?? 0),
                0,
              );
              p.profitValue = p.total - p.invested;
              p.profitRatio = p.invested ? p.profitValue / p.invested : 0;
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
          .catch(console.error),
      )
      .then(() => loadData(String(user.id)))
      .then(setHistoric)
      .catch(console.error)
      .finally(() => (isLoading.current = false));
  }, [needRefresh, setNeedRefresh, page, user]);

  const { minHisto, maxHisto } = useMemo(() => {
    const minHisto = Math.min(...[...historic.map(d => d.Investi), ...historic.map(d => d.Total)]).toDecimalPlace(
      3,
      'down',
    );
    const maxHisto = Math.max(...[...historic.map(d => d.Investi), ...historic.map(d => d.Total)]).toDecimalPlace(
      3,
      'up',
    );

    return { minHisto, maxHisto };
  }, [historic]);

  return (
    <>
      <Accordion defaultOpen={true}>
        <AccordionHeader>
          <Flex alignItems="start">
            <Flex flexDirection="col" alignItems="start">
              <Title className="text-left">{t.totalValue}</Title>
              <Flex justifyContent="start">
                <Metric color="green" className={!portfolio ? 'blur-sm' : 'animate-unblur'}>
                  <Privacy amount={portfolio?.total} />
                </Metric>
                <PrivacyButton />
              </Flex>
            </Flex>
            <BadgeDelta
              className={portfolio?.yearlyYield ? 'visible' : 'hidden'}
              deltaType={getDeltaType(portfolio?.yearlyYield)}
            >
              {(portfolio?.yearlyYield ?? 0).toRatio()}
            </BadgeDelta>
          </Flex>
        </AccordionHeader>
        <AccordionBody>
          {!portfolio || portfolio.invested ? <GainsBar values={portfolio} loaded={!!portfolio} /> : null}
          {!wallet || wallet.length ? <Divider style={{ fontSize: 18 }}>{t.assets}</Divider> : null}

          {wallet ? (
            <Table>
              <TableBody>
                {wallet.map(asset => (
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
                        <div className="font-bold text-lg">
                          <Privacy amount={asset.total} />
                        </div>
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

      {!portfolio || portfolio?.invested ? (
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
              valueFormatter={amount => toPrivacy(amount, hasPrivacy, true)}
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
