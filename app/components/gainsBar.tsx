import { Flex, MarkerBar, Subtitle } from '@tremor/react';
import { cls } from '../utils/constants';
import { Dataset } from '../utils/types';

const t: Dataset = {
  invested: 'Investi',
  gains: 'Gains',
};

interface GainsBarProps {
  invested: number;
  profitValue: number;
  profitRatio: number;
}

export default function GainsBar({ values, loaded }: { values: GainsBarProps | undefined; loaded: boolean }) {
  const { invested, profitValue, profitRatio } = values || { invested: 0, profitValue: 0, profitRatio: 0 };
  const isPositive = profitRatio >= 0;
  const isOverKill = profitRatio * 100 > 100;
  const overKillValue = 10000 / (profitRatio * 100 + 100);

  return (
    <>
      <style>
        {`
     .tremor-MarkerBar-rangeBar {
       background-color: ${isPositive ? '#22c55e' : '#ef4444'};
     }
  `}
      </style>
      <Flex className="mt-4 mb-1">
        <Subtitle className={cls('truncate invisible sm:visible', !loaded ? 'blur-sm' : 'animate-unblur')}>
          {`${t.invested} : ${invested.toLocaleCurrency()}`}
        </Subtitle>
        <Subtitle className={cls('truncate', !loaded ? 'blur-sm' : 'animate-unblur')}>
          {`${t.gains} : ${profitValue.toLocaleCurrency()} (${profitRatio.toRatio()})`}
        </Subtitle>
      </Flex>

      <MarkerBar
        title="Gains"
        color={isPositive ? 'green' : 'red'}
        value={isOverKill ? overKillValue : isPositive ? 0 : 100}
        minValue={isOverKill ? overKillValue : isPositive ? 0 : 100 - Math.abs(profitRatio) * 100}
        maxValue={isOverKill ? 100 : isPositive ? profitRatio * 100 : 100}
      />
    </>
  );
}