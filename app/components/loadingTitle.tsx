'use client';

import tailwindConfig from '@/tailwind.config';
import { Typography } from 'antd';
import { BaseType } from 'antd/es/typography/Base';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const { Title } = Typography;

interface LoadingTitleProps {
  isReady: boolean;
  type?: BaseType;
  className?: string;
  children: React.ReactNode;
}

export default function LoadingTitle({ isReady = false, type = 'success', className, children }: LoadingTitleProps) {
  const [isLoaded, setIsLoaded] = useState(isReady);

  useEffect(() => {
    if (isReady) {
      setTimeout(() => {
        setIsLoaded(true);
      }, parseInt(tailwindConfig.theme.extend.transitionDuration.DEFAULT));
    }
  }, [isReady]);

  return (
    <Title
      type={type}
      style={{ margin: 0 }}
      className={twMerge(className, !isLoaded ? (!isReady ? 'blur-sm' : 'animate-unblur') : '')}
    >
      {children}
    </Title>
  );
}
