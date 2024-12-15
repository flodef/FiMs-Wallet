import { Flex, MarkerBar, Subtitle } from '@tremor/react';
import { cls } from '../utils/constants';
import { Dataset } from '../utils/types';
import { Privacy } from './privacy';
import { useEffect, useState } from 'react';
import tailwindConfig from '@/tailwind.config';

const t: Dataset = {
  invested: 'Investi',
  profits: 'Gains',
  loss: 'Pertes',
};

interface GainsBarProps {
  invested: number;
  profitValue: number;
  profitRatio: number;
}

export default function GainsBar({ values, isReady }: { values: GainsBarProps | undefined; isReady: boolean }) {
  const { invested, profitValue, profitRatio } = values ?? {
    invested: 0,
    profitValue: 0,
    profitRatio: 0,
  };
  const value = profitRatio * 100;
  const isPositive = value >= 0;
  const isOverKill = value > 100;
  const overKillValue = 10000 / (value + 100);

  const [isLoaded, setIsLoaded] = useState(isReady);

  useEffect(() => {
    if (isReady) {
      setTimeout(() => {
        setIsLoaded(true);
      }, parseInt(tailwindConfig.theme.extend.transitionDuration.DEFAULT));
    }
  }, [isReady]);

  return (
    <>
      <style>
        {`.tremor-MarkerBar-rangeBar {
            background-color: ${isPositive ? '#22c55e' : '#ef4444'};
          }
        `}
      </style>
      <Flex className="mt-4 mb-1">
        {invested || !isReady ? (
          <Subtitle
            className={cls(
              'truncate w-0 text-left xs:w-1/2',
              !isLoaded ? (!isReady ? 'blur-sm' : 'animate-unblur') : '',
            )}
          >
            {t.invested}&nbsp;:&nbsp;
            <Privacy amount={invested} />
          </Subtitle>
        ) : null}
        {invested || !isReady ? (
          <Subtitle className={!isLoaded ? (!isReady ? 'blur-sm' : 'animate-unblur') : ''}>
            {isPositive ? t.profits : t.loss}&nbsp;:&nbsp;
            <Privacy amount={profitValue} />
            {profitRatio ? ' (' + profitRatio.toRatio() + ')' : ''}
          </Subtitle>
        ) : null}
      </Flex>

      {profitRatio || !isReady ? (
        <MarkerBar
          title={isPositive ? t.profits : t.loss}
          color={isPositive ? 'green' : 'red'}
          value={isOverKill ? overKillValue : isPositive ? 0 : 100}
          minValue={isOverKill ? overKillValue : isPositive ? 0 : 100 - Math.abs(value)}
          maxValue={isOverKill ? 100 : isPositive ? value : 100}
        />
      ) : // <CategoryBar
      //   values={isOverKill ? [100, value] : isPositive ? [value, 100 - value] : [100 + value, -value]}
      //   markerValue={isOverKill ? 100.01 : isPositive ? value : 100 + value + 0.01}
      //   colors={isOverKill ? ['neutral', 'green'] : isPositive ? ['green', 'zinc'] : ['neutral', 'red']}
      //   showLabels={false}
      // />
      null}
    </>
  );
}
