import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  Card,
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
import {} from '../utils/extensions';
import { DataName, loadData } from '../utils/processData';
import { Data, Dataset } from '../utils/types';
import Image from 'next/image';

const t: Dataset = {
  assets: 'Valeur totale',
  emptyPortfolio: 'Aucun actif trouvé',
  dataLoading: 'Chargement des données...',
  tokenLogo: 'Logo du token',
};

interface TokenData {
  image: string;
  name: string;
  symbol: string;
  balance: number;
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
          fetch(
            `./api/solana/getAssets?address=${user.address}&creator=CCLcWAJX6fubUqGyZWz8dyUGEddRj8h4XZZCNSDzMVx4`
          ).then((response) => {
            response
              .json()
              .then((data: TokenData[]) => {
                setPortfolio(
                  data
                    .map((d) => {
                      const value = findValue(token, d.name)?.value ?? 0;
                      return {
                        ...d,
                        value: value,
                        total: d.balance * (value || 1),
                      };
                    })
                    .sort((a, b) => b.total - a.total)
                );
              })
              .catch((error) => {
                console.error(error);
                setPortfolio([]);
              });
          });
        });
    }
  }, [refresh, user, findValue]);

  return (
    <>
      {portfolio?.length ? (
        <Accordion defaultOpen={true}>
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
                {portfolio.map((asset) => (
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
                          <div className="text-xl truncate">{asset.name}</div>
                          <div>{`${asset.balance} ${asset.symbol}`}</div>
                        </Flex>
                        <Flex justifyContent="between">
                          <div>{asset.value ? asset.value.toCurrency() : ''}</div>
                          <div className="font-bold text-lg">{asset.total.toCurrency()}</div>
                        </Flex>
                      </Text>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionBody>
        </Accordion>
      ) : (
        <Card className="text-center">{t[portfolio ? 'emptyPortfolio' : 'dataLoading']}</Card>
      )}
    </>
  );
}
