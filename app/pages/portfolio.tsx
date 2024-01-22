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
  Subtitle,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Text,
  Title,
} from '@tremor/react';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import GainsBar from '../components/gainsBar';
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

  const [wallet, setWallet] = useState<Wallet[]>();
  const [portfolio, setPortfolio] = useState<Portfolio>();
  const [historic, setHistoric] = useState<Historic[]>([]);

  const loaded = useRef(false);
  const [refresh, setRefresh] = useState(false);
  useEffect(() => {
    if (user && (!loaded.current || refresh)) {
      loadData(DataName.token)
        .then((data: Token[]) => {
          loaded.current = true;

          // Refresh data every minute
          setRefresh(false);
          setTimeout(() => {
            setRefresh(true);
          }, 60000);

          return data;
        })
        .then((token) => {
          loadData(DataName.portfolio)
            .then((data: Portfolio[]) => {
              const p = data.filter((d) => d.address === user.address)[0];
              console.log(p);

              setPortfolio(p);

              const wallet: Wallet[] = [];
              token.forEach((t, i) => {
                if (!p.token[i]) return;

                wallet.push({
                  image: TOKEN_PATH + t.label.replaceAll(' ', '') + '.png',
                  name: t.label,
                  symbol: t.symbol,
                  balance: p.token[i],
                  value: t.value,
                  total: p.token[i] * t.value,
                });
              });
              setWallet(wallet.sort((a, b) => b.total - a.total));
            })
            .then(() => loadData(user.name).then(setHistoric));
        });
    }
  }, [refresh, user]);

  const { minHisto, maxHisto } = useMemo(() => {
    const minHisto = Math.min(...[...historic.map((d) => d.Investi), ...historic.map((d) => d.Total)]).toDecimalPlace(
      3,
      RoundingDirection.down
    );
    const maxHisto = Math.max(...[...historic.map((d) => d.Investi), ...historic.map((d) => d.Total)]).toDecimalPlace(
      3,
      RoundingDirection.up
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
          <GainsBar values={portfolio} loaded={loaded.current} />

          <Divider style={{ fontSize: 18 }}>{t.assets}</Divider>

          {wallet?.length ? (
            <Table>
              <TableBody>
                {wallet.map((asset) => (
                  <TableRow key={asset.name} className="hover:bg-gray-50">
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
                      <Text>
                        <Flex justifyContent="between">
                          <div className="text-xl truncate">{asset.name}</div>
                          <div>{`${asset.balance.toShortFixed()} ${asset.symbol}`}</div>
                        </Flex>
                        <Flex justifyContent="between">
                          <div>{asset.value ? asset.value.toLocaleCurrency() : ''}</div>
                          <div className="font-bold text-lg">{asset.total.toLocaleCurrency()}</div>
                        </Flex>
                      </Text>
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
                    <div className="rounded-full w-[50px] h-[50px] bg-slate-200"></div>
                  </TableCell>
                  <TableCell>
                    <Text>
                      <Flex justifyContent="between">
                        <div className="bg-slate-200 w-24 h-7 mb-1 rounded-md"></div>
                        <div className="bg-slate-200 w-10 h-5 mb-1 rounded-md"></div>
                      </Flex>
                      <Flex justifyContent="between">
                        <div className="bg-slate-200 w-16 h-5 mb-1 rounded-md"></div>
                        <div className="bg-slate-200 w-24 h-7 mb-1 rounded-md"></div>
                      </Flex>
                    </Text>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </AccordionBody>
      </Accordion>
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
            valueFormatter={(number) => number.toShortCurrency()}
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
    </>
  );
}
