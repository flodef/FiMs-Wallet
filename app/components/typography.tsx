import { Typography } from 'antd';
import { BaseType } from 'antd/es/typography/Base';
import { ReactNode, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { transitionDuration } from '../utils/functions';
import { useIsMobile } from '../utils/mobile';

interface TitleProps {
  className?: string;
  type?: BaseType;
  children: ReactNode;
}

const titleClassName = 'whitespace-nowrap text-theme-content-emphasis dark:text-dark-theme-content-emphasis';
const marginStyle = { margin: 0 };
const colorStyle = { color: 'var(--text)' };
const titleStyle = { margin: 0, color: 'var(--text)' };

export const Metric = ({ children, className, type }: TitleProps) => (
  <Typography.Title style={type ? marginStyle : titleStyle} className={twMerge(titleClassName, className)} type={type}>
    {children}
  </Typography.Title>
);

export const BigTitle = ({ children, className, type }: TitleProps) => (
  <Typography.Title
    level={3}
    style={type ? marginStyle : titleStyle}
    className={twMerge(titleClassName, className)}
    type={type}
  >
    {children}
  </Typography.Title>
);

export const Title = ({ children, className, type }: TitleProps) => (
  <Typography.Title
    level={4}
    style={type ? marginStyle : titleStyle}
    className={twMerge('h-10 content-center', titleClassName, className)}
    type={type}
  >
    {children}
  </Typography.Title>
);

export const Subtitle = ({ children, className, type }: TitleProps) => (
  <Typography.Title
    level={5}
    style={type ? marginStyle : titleStyle}
    className={twMerge(titleClassName, className)}
    type={type}
  >
    {children}
  </Typography.Title>
);

export const Text = ({ children, className, type }: TitleProps) => (
  <Typography.Text style={!type ? colorStyle : undefined} className={twMerge(titleClassName, className)} type={type}>
    {children}
  </Typography.Text>
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
