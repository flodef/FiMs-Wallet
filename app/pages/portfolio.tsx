import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  Flex,
  Metric,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Text,
  Title,
} from '@tremor/react';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useUser } from '../hooks/useUser';
import { isMobileSize } from '../utils/mobile';
import {} from '../utils/number';
import { DataName, loadData } from '../utils/processData';
import { Data, Dataset } from '../utils/types';
import Image from 'next/image';

const t: Dataset = {
  assets: 'Valeur totale',
  emptyPortfolio: 'Aucun actif trouvé',
  dataLoading: 'Chargement des données...',
  tokenLogo: 'Logo du token',
};

const tokenImage: Dataset = {
  '6hoGUYo5VengrsRtyyvs2y7KPf4mwWdv7V8C7GJg6Uy': 'https://raw.githubusercontent.com/flodef/FiMs-Token/main/FiMsSOL.png',
  D84wZMJRoievKkRaquXXrYSMuU5mA46RznCSrJ9HSK1u:
    'https://raw.githubusercontent.com/flodef/FiMs-Token/main/FiMsToken.png',
  Pnsjp9dbenPeFZWqqPHDygzkCZ4Gr37G8mgdRK2KjQp: 'https://raw.githubusercontent.com/flodef/FiMs-Token/main/Euro.png',
};

interface HeliusData {
  items: {
    id: string;
    content: { metadata: { name: string; symbol: string } };
    token_info: { balance: number; decimals: number };
    creators: { address: string }[];
  }[];
}

interface Portfolio {
  image: string;
  name: string;
  symbol: string;
  balance: number;
  value: number;
  total: number;
}

const today = new Date();

export default function Dashboard() {
  const { user } = useUser();

  const [portfolio, setPortfolio] = useState<Portfolio[]>();

  //TODO: Refactor this
  const findValue = useCallback((data: Data[], label: string | undefined) => {
    return label ? data.find((d) => d.label.toLowerCase().includes(label.toLowerCase())) : undefined;
  }, []);
  const getValue = useCallback(
    (data: Data[], label: string | undefined, defaultValue = 0) => {
      return (findValue(data, label)?.value ?? defaultValue).toLocaleCurrency();
    },
    [findValue]
  );
  const getRatio = useCallback(
    (data: Data[], label: string | undefined, defaultValue = 0) => {
      return (findValue(data, label)?.ratio ?? defaultValue).toRatio();
    },
    [findValue]
  );

  const loaded = useRef(false);
  const [refresh, setRefresh] = useState(false);
  useEffect(() => {
    if (user && (!loaded.current || refresh)) {
      loadData(DataName.token)
        .then((data: Data[]) => {
          loaded.current = true;

          // Refresh data every minute
          setRefresh(false);
          setTimeout(() => {
            setRefresh(true);
          }, 60000);

          return data;
        })
        .then((token) => {
          fetch(`./api/solana/getAssets?address=${user.address}`).then((response) => {
            response.json().then((data: HeliusData) => {
              setPortfolio(
                data.items
                  .filter((d) => d.creators.some((c) => c.address === 'CCLcWAJX6fubUqGyZWz8dyUGEddRj8h4XZZCNSDzMVx4'))
                  .map((d) => {
                    const name = d.content.metadata.name;
                    const balance = d.token_info.balance / Math.pow(10, d.token_info.decimals);
                    const value = findValue(token, name)?.value ?? 0;
                    return {
                      image: tokenImage[d.id],
                      name: name,
                      symbol: d.content.metadata.symbol,
                      balance: balance,
                      value: value,
                      total: balance * (value || 1),
                    };
                  })
                  .sort((a, b) => b.total - a.total)
              );
            });
          });
        });
    }
  }, [refresh, user, findValue]);

  return (
    <>
      <Accordion defaultOpen={!isMobileSize()}>
        {portfolio?.length ? (
          <AccordionHeader>
            <Flex alignItems="start">
              <div>
                <Title className="text-left">{t['assets']}</Title>
                <Metric color="green" className={!loaded.current ? 'blur-sm' : 'animate-unblur'}>
                  {portfolio
                    ?.map((asset) => asset.total)
                    .reduce((a, b) => a + b)
                    .toCurrency()}
                </Metric>
              </div>
              {/* <BadgeDelta
              deltaType={
                parseFloat(getRatio(dashboard, 'price @')) < 0
                  ? 'moderateDecrease'
                  : parseFloat(getRatio(dashboard, 'price @')) > 0
                    ? 'moderateIncrease'
                    : 'unchanged'
              }
            >
              {getRatio(dashboard, 'price @')}
            </BadgeDelta> */}
            </Flex>
          </AccordionHeader>
        ) : null}
        <AccordionBody>
          <Table>
            {/* <TableHead>
              <TableRow>
                <TableHeaderCell className="w-1/3">{t['name']}</TableHeaderCell>
                <TableHeaderCell className="w-1/3">{t['address']}</TableHeaderCell>
                <TableHeaderCell className="w-1/3">{t['copy']}</TableHeaderCell>
              </TableRow>
            </TableHead> */}
            <TableBody>
              {portfolio?.length ? (
                portfolio.map((asset) => (
                  <TableRow key={asset.name} className={'hover:bg-gray-50'}>
                    <TableCell>
                      <Image
                        className="rounded-full"
                        src={asset.image}
                        alt={t['tokenLogo']}
                        width={50}
                        height={50}
                      ></Image>
                    </TableCell>
                    <TableCell>
                      <Text>
                        <Flex justifyContent="between">
                          <div className="text-xl">{asset.name}</div>
                          <div>{`${asset.balance} ${asset.symbol}`}</div>
                        </Flex>
                        <Flex justifyContent="between">
                          <div>{asset.value ? asset.value.toCurrency() : ''}</div>
                          <div className="font-bold text-lg">{asset.total.toCurrency()}</div>
                        </Flex>
                      </Text>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    {t[portfolio ? 'emptyPortfolio' : 'dataLoading']}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </AccordionBody>
      </Accordion>
    </>
  );
}
