'use client';

import { Statistic, StatisticProps } from 'antd';
import { valueType } from 'antd/es/statistic/utils';
import { BaseType } from 'antd/es/typography/Base';
import CountUp from 'react-countup';

interface AnimatedStatProps {
  type?: BaseType | 'default';
  className?: string;
  value: valueType;
}

export default function AnimatedStat({ type = 'success', className, value }: AnimatedStatProps) {
  const formatter: StatisticProps['formatter'] = value => (
    <CountUp end={value.toString().fromCurrency()} separator="," />
  );

  const color = {
    secondary: '#d9d9d9',
    success: '#3f8600',
    warning: '#cf1322',
    danger: '#cf1322',
    default: '#d9d9d9',
  }[type];

  return <Statistic className={className} value={value} formatter={formatter} valueStyle={{ color }} />;
}
