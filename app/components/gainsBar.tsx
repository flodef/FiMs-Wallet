import { Flex, MarkerBar, Subtitle } from '@tremor/react';
import { cls } from '../utils/constants';
import { Dataset } from '../utils/types';
import { Privacy } from './privacy';

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

export default function GainsBar({ values, loaded }: { values: GainsBarProps | undefined; loaded: boolean }) {
  const { invested, profitValue, profitRatio } = values ?? {
    invested: 0,
    profitValue: 0,
    profitRatio: 0,
  };
  const isPositive = profitRatio >= 0;
  const isOverKill = profitRatio * 100 > 100;
  const overKillValue = 10000 / (profitRatio * 100 + 100);

  return (
    <>
      <style>
        {`.tremor-MarkerBar-rangeBar {
            background-color: ${isPositive ? '#22c55e' : '#ef4444'};
          }
        `}
      </style>
      <Flex className="mt-4 mb-1">
        {invested || !loaded ? (
          <Subtitle className={cls('truncate w-0 text-left sm:w-1/2', !loaded ? 'blur-sm' : 'animate-unblur')}>
            {t.invested}&nbsp;:&nbsp;
            <Privacy amount={invested} />
          </Subtitle>
        ) : null}
        {invested || !loaded ? (
          <Subtitle className={!loaded ? 'blur-sm' : 'animate-unblur'}>
            {isPositive ? t.profits : t.loss}&nbsp;:&nbsp;
            <Privacy amount={profitValue} />
            {profitRatio ? ' (' + profitRatio.toRatio() + ')' : ''}
          </Subtitle>
        ) : null}
      </Flex>

      {profitRatio || !loaded ? (
        <MarkerBar
          title={isPositive ? t.profits : t.loss}
          color={isPositive ? 'green' : 'red'}
          value={isOverKill ? overKillValue : isPositive ? 0 : 100}
          minValue={isOverKill ? overKillValue : isPositive ? 0 : 100 - Math.abs(profitRatio) * 100}
          maxValue={isOverKill ? 100 : isPositive ? profitRatio * 100 : 100}
        />
      ) : null}
    </>
  );
}
