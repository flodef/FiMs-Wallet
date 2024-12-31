import { AreaChart, SparkAreaChart, Table, TableBody, TableCell, TableRow } from '@tremor/react';
import { CollapseProps, Divider, Flex } from 'antd';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CollapsiblePanel } from '../components/collapsiblePanel';
import GainsBar from '../components/gainsBar';
import { Privacy, PrivacyButton, toPrivacy } from '../components/privacy';
import RatioBadge from '../components/ratioBadge';
import { LoadingMetric, Title } from '../components/typography';
import { usePrivacy } from '../contexts/privacyProvider';
import type { UserHistoric } from '../hooks/useData';
import { useData } from '../hooks/useData';
import { Page, useNavigation } from '../hooks/useNavigation';
import { useUser } from '../hooks/useUser';
import { FIMS, FIMS_TOKEN_PATH, SPL_TOKEN_PATH } from '../utils/constants';
import { isMobileSize } from '../utils/mobile';
import { convertedData, DataName, forceData, loadData, PortfolioData, TokenData } from '../utils/processData';
import { Dataset } from '../utils/types';

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

interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
}

const thisPage = Page.Portfolio;

export default function Portfolio() {
  const { user } = useUser();
  const { page, needRefresh, setNeedRefresh } = useNavigation();
  const { hasPrivacy } = usePrivacy();
  const { wallet, setWallet, portfolio, setPortfolio, userHistoric, setUserHistoric } = useData();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileSize());
  }, []);

  const loadAssets = async (address: string) => {
    return (await fetch(`/api/solana/getAssets?address=${address}`)
      .then(result => result.json())
      .catch(console.error)) as Asset[] | undefined;
  };

  const computeAssets = useCallback(
    async (tokenData: TokenData[], portfolioData: PortfolioData[]) => {
      if (!user) return;

      tokenData = (!tokenData.length ? tokenData : await forceData(DataName.token)) as TokenData[];
      portfolioData = (!portfolioData.length ? portfolioData : await forceData(DataName.portfolio)) as PortfolioData[];

      const p = structuredClone(portfolioData.find(d => d.id === user.id)) ?? {
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

      // Add the most recent data from onchain
      const assets = await loadAssets(user.address);
      const isAssetsLoaded = Array.isArray(assets) && assets?.length > 0;

      // Create FiMs assets from tokenData if they don't exist in loaded assets
      const fimsAssets = tokenData
        .filter(token => token.label.includes(FIMS))
        .map((token, i) => ({
          id: token.symbol,
          name: token.label,
          symbol: token.symbol,
          balance: p.token[i],
        }))
        .filter(fimsToken => !assets?.some(asset => asset.symbol === fimsToken.symbol));

      // Combine loaded assets with missing FiMs assets
      const combinedAssets = [...(assets ?? []), ...fimsAssets].filter(a => a.balance);
      const getAsset = (t: TokenData) => combinedAssets.find(a => a.symbol === t.symbol);

      if (isAssetsLoaded) {
        const computeBalance = (filter = '') =>
          combinedAssets.reduce(
            (a, b) =>
              a +
              (b.balance ?? 0) * (tokenData.find(t => t.symbol === b.symbol && t.label.includes(filter))?.value ?? 0),
            0,
          );
        p.total = computeBalance();
        p.profitValue = computeBalance(FIMS) - p.invested;
        p.profitRatio = p.invested ? p.profitValue / p.invested : 0;
        p.token = tokenData.map(t => getAsset(t)?.balance ?? 0).filter(b => b);
      }

      if (p.total === portfolio?.total) return;

      const w = tokenData
        .filter(t => (isAssetsLoaded ? getAsset(t) : t.label.includes(FIMS)))
        .map((t, i) => ({
          ...t,
          image: t.label.includes(FIMS)
            ? FIMS_TOKEN_PATH + t.symbol + '.png'
            : SPL_TOKEN_PATH + getAsset(t)?.id + '.webp',
          name: t.label,
          balance: p.token[i],
          total: p.token[i] * t.value,
        }))
        .filter(t => t.balance)
        .sort((a, b) => b.total - a.total);

      setPortfolio(p);
      setWallet(w);
    },
    [setPortfolio, setWallet, user, portfolio],
  );

  const isLoading = useRef(false);
  useEffect(() => {
    if (!user || isLoading.current || !needRefresh || page !== thisPage) return;

    isLoading.current = true;
    setNeedRefresh(false);

    loadData(DataName.token)
      .then((tokens: convertedData[]) =>
        loadData(DataName.portfolio)
          .then(async (portfolios: convertedData[]) => {
            await computeAssets(tokens as TokenData[], portfolios as PortfolioData[]);
          })
          .catch(console.error),
      )
      .then(() => {
        if (!userHistoric.length)
          loadData(String(user.id)).then(historic => setUserHistoric(historic as UserHistoric[]));
      })
      .catch(console.error)
      .finally(() => (isLoading.current = false));
  }, [needRefresh, setNeedRefresh, page, user, setUserHistoric, computeAssets, userHistoric]);

  const { minHisto, maxHisto } = useMemo(() => {
    const minHisto = Math.min(
      ...[...userHistoric.map(d => d.Investi), ...userHistoric.map(d => d.Total)],
    ).toDecimalPlace(3, 'down');
    const maxHisto = Math.max(
      ...[...userHistoric.map(d => d.Investi), ...userHistoric.map(d => d.Total)],
    ).toDecimalPlace(3, 'up');

    return { minHisto, maxHisto };
  }, [userHistoric]);

  const itemsGeneral: CollapseProps['items'] = [
    {
      label: (
        <Flex justify="space-between">
          <Flex vertical>
            <Title>{t.totalValue}</Title>
            <Flex>
              <LoadingMetric isReady={!!portfolio} className="m-0">
                <Privacy amount={portfolio?.total ?? 0} />
              </LoadingMetric>
              <PrivacyButton />
            </Flex>
          </Flex>
          <RatioBadge className={portfolio?.yearlyYield ? 'visible' : 'hidden'} data={portfolio?.yearlyYield ?? 0} />
        </Flex>
      ),
      children: (
        <>
          {!portfolio || portfolio.invested ? <GainsBar values={portfolio} isReady={!!portfolio} /> : null}
          {!wallet || wallet.length ? <Divider style={{ fontSize: 18 }}>{t.assets}</Divider> : null}

          {wallet ? (
            <Table>
              <TableBody>
                {wallet.map(asset => (
                  <TableRow
                    key={asset.name}
                    className="hover:bg-theme-background-subtle dark:hover:bg-dark-theme-background-subtle"
                  >
                    <TableCell className="px-0 hidden 2xs:table-cell xs:px-2 sm:px-4">
                      <Image
                        className="rounded-full"
                        src={asset.image}
                        alt={t.tokenLogo}
                        width={50}
                        height={50}
                      ></Image>
                    </TableCell>
                    <TableCell className="px-2 xs:px-4">
                      <Flex justify="space-between">
                        <div className="text-xl max-w-36 xs:max-w-full truncate">{asset.name}</div>
                        <div>{`${asset.balance.toFixed(asset.balance.getPrecision())} ${asset.symbol}`}</div>
                      </Flex>
                      <Flex justify="space-between">
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
                    <div className="rounded-full w-[50px] h-[50px] bg-theme-border"></div>
                  </TableCell>
                  <TableCell>
                    <Flex justify="space-between">
                      <div className="bg-theme-border w-24 h-7 mb-1 rounded-md"></div>
                      <div className="bg-theme-border w-10 h-5 mb-1 rounded-md"></div>
                    </Flex>
                    <Flex justify="space-between">
                      <div className="bg-theme-border w-16 h-5 mb-1 rounded-md"></div>
                      <div className="bg-theme-border w-24 h-7 mb-1 rounded-md"></div>
                    </Flex>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </>
      ),
    },
  ];

  const itemsPerformances: CollapseProps['items'] = [
    {
      label: (
        <Flex>
          <Title>Performance</Title>
          {userHistoric.length > 1 && (
            <Flex className="w-full" justify="center">
              <SparkAreaChart
                className="mx-4 h-10 w-full text-center animate-display [.ant-collapse-header[aria-expanded='true']_&]:hidden"
                data={userHistoric.sort((a, b) => a.date - b.date)}
                categories={[t.total]}
                index={'stringDate'}
                colors={['emerald']}
                curveType="monotone"
                noDataText={t.loading}
              />
            </Flex>
          )}
        </Flex>
      ),
      children: (
        <AreaChart
          className="h-80"
          data={userHistoric.sort((a, b) => a.date - b.date)}
          categories={[t.transfered, t.total]}
          index="stringDate"
          colors={['indigo', 'fuchsia']}
          valueFormatter={amount => toPrivacy(amount, hasPrivacy, 'short')}
          yAxisWidth={60}
          showAnimation={true}
          animationDuration={2000}
          curveType="monotone"
          noDataText={t.loading}
          minValue={minHisto}
          maxValue={maxHisto}
        />
      ),
    },
  ];

  return (
    <>
      <CollapsiblePanel items={itemsGeneral} />

      {userHistoric.length > 0 && <CollapsiblePanel items={itemsPerformances} isExpanded={!isMobile} />}
    </>
  );
}
