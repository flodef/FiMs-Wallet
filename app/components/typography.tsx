import { Typography } from 'antd';
import { BaseType } from 'antd/es/typography/Base';
import { ReactNode, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { transitionDuration } from '../utils/functions';
import { useIsMobile } from '../utils/mobile';

interface TitleProps {
  children: ReactNode;
  className?: string;
}

const titleClassName = 'whitespace-nowrap';
const titleStyle = { margin: 0, color: 'var(--text)' };

export const Metric = ({ children, className }: TitleProps) => (
  <Typography.Title style={titleStyle} className={twMerge(titleClassName, className)}>
    {children}
  </Typography.Title>
);

export const BigTitle = ({ children, className }: TitleProps) => (
  <Typography.Title level={3} style={titleStyle} className={twMerge(titleClassName, className)}>
    {children}
  </Typography.Title>
);

export const Title = ({ children, className }: TitleProps) => (
  <Typography.Title level={4} style={titleStyle} className={twMerge(titleClassName, className)}>
    {children}
  </Typography.Title>
);

export const Subtitle = ({ children, className }: TitleProps) => (
  <Typography.Title level={5} style={titleStyle} className={twMerge(titleClassName, className)}>
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
  const isMobile = useIsMobile(480);
  const isTablet = useIsMobile(640);
  const [isLoaded, setIsLoaded] = useState(isReady);

  useEffect(() => {
    if (isReady) {
      setTimeout(() => {
        setIsLoaded(true);
      }, transitionDuration);
    }
  }, [isReady]);

  return (
    <Typography.Title
      type={type}
      level={isMobile ? 3 : isTablet ? 2 : 1}
      style={{ margin: 0 }}
      className={twMerge(titleClassName, className, !isLoaded ? (!isReady ? 'blur-sm' : 'animate-unblur') : '')}
    >
      {children}
    </Typography.Title>
  );
}
