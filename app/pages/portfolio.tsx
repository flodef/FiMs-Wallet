import { IconSend2 } from '@tabler/icons-react';
import { AreaChart, SparkAreaChart, Table, TableBody, TableCell, TableRow } from '@tremor/react';
import { Divider, Flex } from 'antd';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { CollapsiblePanel } from '../components/collapsiblePanel';
import GainsBar from '../components/gainsBar';
import { Privacy, PrivacyButton, toPrivacy } from '../components/privacy';
import RatioBadge from '../components/ratioBadge';
import { TokenDetails } from '../components/tokenDetails';
import { TokenGraphs } from '../components/tokenGraphs';
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
  performance: 'Performances FiMs',
  loading: 'Chargement...',
};

interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
}

const getAsset = (t: TokenData, assets: Asset[]) => assets.find(a => a.symbol === t.symbol);
const loadAssets = async (address: string) => {
  return (await fetch(`/api/solana/getAssets?address=${address}`)
    .then(result => result.ok && result.json())
    .catch(console.error)) as Asset[] | undefined;
};

const thisPage = Page.Portfolio;

export default function Portfolio() {
  const { user } = useUser();
  const { page, needRefresh, setNeedRefresh } = useNavigation();
  const { hasPrivacy } = usePrivacy();
  const { wallet, setWallet, portfolio, setPortfolio, userHistoric, setUserHistoric } = useData();

  const [isTokenDetailsOpen, setIsTokenDetailsOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileSize());
  }, []);

  const updateTokenPrices = async (assets: Asset[], tokenData: TokenData[]) => {
    const otherAssets = assets.filter(asset => !asset.name.includes(FIMS));
    if (!otherAssets.length) return tokenData;

    const usdcRate = tokenData.find(token => token.symbol.includes('USDC'))?.value ?? 1;
    try {
      const response = await fetch(
        `/api/solana/getPrices?ids=${otherAssets.map(asset => asset.id).join(',')}&rate=${usdcRate}`,
      );
      if (response.ok) {
        const { data: prices } = await response.json();
        otherAssets.forEach(asset => {
          const existingToken = tokenData.find(token => token.address === asset.id);
          if (existingToken) {
            existingToken.value = prices[asset.id];
          } else {
            tokenData.push({
              symbol: asset.symbol,
              label: asset.name,
              address: asset.id,
              value: prices[asset.id],
              yearlyYield: 0,
              ratio: 0,
              duration: 0,
              volatility: 0,
              inceptionPrice: 0,
              description: '',
            });
          }
        });
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
    return tokenData;
  };

  const createFiMsAssets = (tokenData: TokenData[], portfolioTokens: number[], assets: Asset[]): Asset[] =>
    tokenData
      .filter(token => token.label.includes(FIMS))
      .map(
        (token, i): Asset => ({
          id: token.address,
          name: token.label,
          symbol: token.symbol,
          balance: portfolioTokens[i],
        }),
      )
      .filter(fimsToken => !assets.some(asset => asset.symbol === fimsToken.symbol));

  const updatePortfolioData = (p: PortfolioData, tokenData: TokenData[], combinedAssets: Asset[]) => {
    const computeBalance = (filter = '') =>
      combinedAssets.reduce(
        (a, b) =>
          a + (b.balance ?? 0) * (tokenData.find(t => t.symbol === b.symbol && t.label.includes(filter))?.value ?? 0),
        0,
      );

    p.total = computeBalance();
    p.profitValue = computeBalance(FIMS) - p.invested;
    p.profitRatio = p.invested ? p.profitValue / p.invested : 0;
    p.token = tokenData.map(t => getAsset(t, combinedAssets)?.balance ?? 0).filter(b => b);
  };

  const computeWallet = useCallback(
    (tokenData: TokenData[], portfolio: PortfolioData, assets: Asset[] = [], isAssetsLoaded = false) => {
      return portfolio.token.length
        ? tokenData
            .filter(t => (isAssetsLoaded ? getAsset(t, assets) : t.label.includes(FIMS)))
            .map((t, i) => ({
              ...t,
              image: t.label.includes(FIMS)
                ? FIMS_TOKEN_PATH + t.symbol + '.png'
                : SPL_TOKEN_PATH + getAsset(t, assets)?.id + '.webp',
              balance: portfolio.token[i],
              total: portfolio.token[i] * t.value,
            }))
            .filter(t => t.total.toDecimalPlace(2, 'down') > 0)
            .sort((a, b) => b.total - a.total)
        : [];
    },
    [],
  );

  const computeFiMsAssets = useCallback(
    async (tokenData: TokenData[], portfolioData: PortfolioData[]) => {
      tokenData = (tokenData.length ? tokenData : await forceData(DataName.tokens)) as TokenData[];
      portfolioData = (portfolioData.length ? portfolioData : await forceData(DataName.portfolio)) as PortfolioData[];

      if (!user || portfolio) return { tokenData, portfolioData };

      const p = portfolioData.find(d => d.id === user.id) ?? {
        id: user.id,
        name: user.name,
        address: user.address,
        ispublic: false,
        token: [],
        total: 0,
        invested: 0,
        profitValue: 0,
        profitRatio: 0,
        yearlyYield: 0,
        transferCost: 0,
      };
      const w = computeWallet(tokenData, p);

      setPortfolio(p);
      setWallet(w);

      return { tokenData, portfolioData };
    },
    [setPortfolio, setWallet, user, computeWallet, portfolio],
  );

  const computeOtherAssets = useCallback(
    async ({ tokenData, portfolioData }: { tokenData: TokenData[]; portfolioData: PortfolioData[] }) => {
      if (!user) return;

      const p = structuredClone(portfolioData.find(d => d.id === user.id));

      if (!p) return;

      // Add the most recent data from onchain
      const assets = (await loadAssets(user.address)) ?? [];
      const isAssetsLoaded = Array.isArray(assets) && assets.length > 0;

      // Create FiMs assets from tokenData if they don't exist in loaded assets
      const fimsAssets = createFiMsAssets(tokenData, p.token, assets);

      // Add to tokenData other tokens that are missing in tokenData
      tokenData = await updateTokenPrices(assets, tokenData);

      // Combine all assets
      const combinedAssets = [...assets, ...fimsAssets].filter(a => a.balance);

      // Update portfolio data
      if (isAssetsLoaded) {
        updatePortfolioData(p, tokenData, combinedAssets);
      }

      // Do not update portfolio if the total is the same
      if (p.total === portfolio?.total) return;

      const w = computeWallet(tokenData, p, combinedAssets, isAssetsLoaded);
      setPortfolio(p);
      setWallet(w);
    },
    [setPortfolio, setWallet, user, portfolio, computeWallet],
  );

  const isLoading = useRef(false);
  useEffect(() => {
    if (!user || isLoading.current || !needRefresh || page !== thisPage) return;

    isLoading.current = true;
    setNeedRefresh(false);

    loadData(DataName.tokens)
      .then((tokens: convertedData[]) =>
        loadData(DataName.portfolio)
          .then(async (portfolios: convertedData[]) => {
            const promises = [
              computeFiMsAssets(tokens as TokenData[], portfolios as PortfolioData[]).then(computeOtherAssets),
              !userHistoric.length
                ? loadData(String(user.id)).then(historic => setUserHistoric(historic as UserHistoric[]))
                : Promise.resolve(),
            ];
            await Promise.all(promises);
          })
          .catch(console.error),
      )
      .catch(console.error)
      .finally(() => setHasLoaded(true))
      .finally(() => (isLoading.current = false));
  }, [needRefresh, setNeedRefresh, page, user, setUserHistoric, computeFiMsAssets, computeOtherAssets, userHistoric]);

  const { minHisto, maxHisto } = useMemo(() => {
    const minHisto = Math.min(
      ...[...userHistoric.map(d => d.Investi), ...userHistoric.map(d => d.Total)],
    ).toDecimalPlace(3, 'down');
    const maxHisto = Math.max(
      ...[...userHistoric.map(d => d.Investi), ...userHistoric.map(d => d.Total)],
    ).toDecimalPlace(3, 'up');

    return { minHisto, maxHisto };
  }, [userHistoric]);

  const tokenDetails = useMemo(() => {
    if (!wallet) return [];

    return wallet.map(token => ({
      label: token.label,
      value: token.total,
      ratio: 0,
    }));
  }, [wallet]);

  return (
    <Flex vertical className="gap-4">
      <CollapsiblePanel
        label={
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
        }
      >
        <Flex vertical className="gap-4">
          {!portfolio || portfolio.invested ? (
            <GainsBar values={hasLoaded ? portfolio : undefined} isReady={hasLoaded && !!portfolio} shouldUsePrivacy />
          ) : null}
          <TokenGraphs
            selectedIndex={selectedIndex}
            onSelectedIndexChange={setSelectedIndex}
            data={tokenDetails}
            total={portfolio?.total ?? 0}
            tokens={hasLoaded && wallet ? wallet : []}
          />

          <Flex vertical>
            {!wallet || wallet.length ? <Divider style={{ fontSize: 18, margin: 0 }}>{t.assets}</Divider> : null}

            {wallet ? (
              <Table>
                <TableBody>
                  {wallet.map((asset, index) => (
                    <TableRow
                      key={asset.label}
                      className={twMerge(
                        'group cursor-pointer select-none touch-none transition-colors duration-200',
                        selectedIndex === index
                          ? 'bg-theme-background-subtle dark:bg-dark-theme-background-subtle'
                          : 'hover:bg-theme-background-subtle dark:hover:bg-theme-background-subtle [@media(hover:none)]:hover:bg-transparent [@media(hover:none)]:dark:hover:bg-transparent'
                      )}
                      onClick={() => setSelectedIndex(selectedIndex === index ? undefined : index)}
                      onContextMenu={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedIndex(index);
                        setIsTokenDetailsOpen(true);
                      }}
                    >
                      <TableCell className="px-0 hidden 2xs:table-cell xs:px-2 sm:px-4 justify-items-center">
                        <Image
                          className="rounded-full"
                          src={asset.image}
                          alt={t.tokenLogo}
                          width={50}
                          height={50}
                        ></Image>
                      </TableCell>
                      <TableCell className="px-2 xs:px-4 justify-items-center">
                        <Flex className="w-full" justify="space-between">
                          <div className="text-xl max-w-36 xs:max-w-full truncate">{asset.label}</div>
                          <Flex className="gap-1">
                            <Privacy
                              amount={asset.balance.toDecimalPlace(asset.balance.getPrecision(), 'down')}
                              currencyType="none"
                            />
                            {asset.symbol}
                          </Flex>
                        </Flex>
                        <Flex className="w-full" justify="space-between">
                          <div>{asset.value ? asset.value.toLocaleCurrency() : ''}</div>
                          <div className="font-bold text-lg">
                            <Privacy amount={asset.total} />
                          </div>
                        </Flex>
                      </TableCell>
                      <TableCell className="px-0 hidden xs:table-cell xs:px-2 sm:px-4 justify-items-center">
                        <IconSend2
                          className={twMerge(
                            'h-8 w-8 text-theme-content-strong dark:text-dark-theme-content-strong',
                            'transition-all duration-500 group-hover:animate-pulse',
                            index === selectedIndex ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                          )}
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedIndex(index);
                            setIsTokenDetailsOpen(true);
                          }}
                        />
                        {hasLoaded ? (
                          <TokenDetails
                            isOpen={isTokenDetailsOpen}
                            onClose={() => setIsTokenDetailsOpen(false)}
                            tokens={wallet}
                            data={tokenDetails}
                            total={portfolio?.total ?? 0}
                            selectedIndex={selectedIndex}
                            onSelectedIndexChange={setSelectedIndex}
                          />
                        ) : null}
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
          </Flex>
        </Flex>
      </CollapsiblePanel>

      {userHistoric.length > 0 && (
        <CollapsiblePanel
          label={
            <Flex>
              <Title>{t.performance}</Title>
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
          }
          isExpanded={!isMobile}
        >
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
        </CollapsiblePanel>
      )}
    </Flex>
  );
}
