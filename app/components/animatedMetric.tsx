'use client';

import tailwindConfig from '@/tailwind.config';
import { Typography } from 'antd';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const { Title } = Typography;

interface AnimatedMetricProps {
  isReady: boolean;
  color?: string;
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
    <Title color={color} className={twMerge(className, !isLoaded ? (!isReady ? 'blur-sm' : 'animate-unblur') : '')}>
      {children}
    </Title>
  );
}
