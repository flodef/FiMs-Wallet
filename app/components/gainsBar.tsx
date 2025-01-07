import { Flex } from 'antd';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { transitionDuration } from '../utils/functions';
import { Dataset } from '../utils/types';
import { MarkerBar } from './markerBar';
import { Privacy } from './privacy';
import { Subtitle } from './typography';

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

export default function GainsBar({
  values,
  isReady,
  shouldUsePrivacy = false,
}: {
  values: GainsBarProps | undefined;
  isReady: boolean;
  shouldUsePrivacy?: boolean;
}) {
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
      const timeout = setTimeout(() => {
        setIsLoaded(true);
      }, transitionDuration);
      return () => clearTimeout(timeout);
    }
  }, [isReady]);

  return (
    <Flex vertical>
      <style>{`.tremor-MarkerBar-rangeBar { background-color: ${isPositive ? 'green' : 'red'} !important; }`}</style>
      <Flex justify="space-between">
        {invested || !isReady ? (
          <Subtitle
            className={twMerge(
              'flex whitespace-nowrap truncate w-0 text-left xs:w-1/2',
              !isLoaded ? (!isReady ? 'blur-sm' : 'animate-unblur') : '',
            )}
          >
            {t.invested}&nbsp;:&nbsp;
            {shouldUsePrivacy ? <Privacy amount={invested} /> : invested.toLocaleCurrency()}
          </Subtitle>
        ) : null}
        {invested || !isReady ? (
          <Subtitle
            className={twMerge('flex whitespace-nowrap', !isLoaded ? (!isReady ? 'blur-sm' : 'animate-unblur') : '')}
          >
            {isPositive ? t.profits : t.loss}&nbsp;:&nbsp;
            {shouldUsePrivacy ? <Privacy amount={profitValue} /> : profitValue.toLocaleCurrency()}
            &nbsp;{profitRatio ? '(' + profitRatio.toRatio() + ')' : ''}
          </Subtitle>
        ) : null}
      </Flex>

      {(profitRatio || !isReady) && (
        <Flex vertical>
          <MarkerBar
            className="mt-1 mb-1"
            value={isOverKill ? overKillValue : isPositive ? 0 : 100}
            minValue={isOverKill ? overKillValue : isPositive ? 0 : 100 - Math.abs(value)}
            maxValue={isOverKill ? 100 : isPositive ? value : 100}
          />
        </Flex>
      )}
    </Flex>
  );
}
