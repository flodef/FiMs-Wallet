'use client';

import tailwindConfig from '@/tailwind.config';
import { Metric, MetricProps } from '@tremor/react';
import { useEffect, useState } from 'react';
import { cls } from '../utils/constants';

interface AnimatedMetricProps {
  isReady: boolean;
  color?: MetricProps['color'];
  className?: string;
  children: React.ReactNode;
}

export default function AnimatedMetric({ isReady = false, color = 'green', className, children }: AnimatedMetricProps) {
  const [isLoaded, setIsLoaded] = useState(isReady);

  useEffect(() => {
    if (isReady) {
      setTimeout(() => {
        setIsLoaded(true);
      }, parseInt(tailwindConfig.theme.extend.transitionDuration.DEFAULT));
    }
  }, [isReady]);

  return (
    <Metric color={color} className={cls(className, !isLoaded ? (!isReady ? 'blur-sm' : 'animate-unblur') : '')}>
      {children}
    </Metric>
  );
}
