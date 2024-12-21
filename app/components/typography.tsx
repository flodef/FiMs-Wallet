import tailwindConfig from '@/tailwind.config';
import { Typography } from 'antd';
import { BaseType } from 'antd/es/typography/Base';
import { ReactNode, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface TitleProps {
  children: ReactNode;
  className?: string;
}

export const Metric = ({ children, className }: TitleProps) => (
  <Typography.Title style={{ margin: 0, color: 'inherit' }} className={className}>
    {children}
  </Typography.Title>
);

export const Title = ({ children, className }: TitleProps) => (
  <Typography.Title level={4} style={{ margin: 0, color: 'inherit' }} className={className}>
    {children}
  </Typography.Title>
);

export const Subtitle = ({ children, className }: TitleProps) => (
  <Typography.Title level={5} style={{ margin: 0, color: 'inherit' }} className={className}>
    {children}
  </Typography.Title>
);

interface LoadingMetricProps {
  isReady: boolean;
  type?: BaseType;
  className?: string;
  children: React.ReactNode;
}

export function LoadingMetric({ isReady = false, type = 'success', className, children }: LoadingMetricProps) {
  const [isLoaded, setIsLoaded] = useState(isReady);

  useEffect(() => {
    if (isReady) {
      setTimeout(() => {
        setIsLoaded(true);
      }, parseInt(tailwindConfig.theme.extend.transitionDuration.DEFAULT));
    }
  }, [isReady]);

  return (
    <Typography.Title
      type={type}
      style={{ margin: 0 }}
      className={twMerge(className, !isLoaded ? (!isReady ? 'blur-sm' : 'animate-unblur') : '')}
    >
      {children}
    </Typography.Title>
  );
}
