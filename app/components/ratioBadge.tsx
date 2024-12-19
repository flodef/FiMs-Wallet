'use client';

import { IconArrowDown, IconArrowDownRight, IconArrowUp, IconArrowUpRight } from '@tabler/icons-react';
import { Statistic, Tooltip } from 'antd';
import { getRatio } from '../utils/constants';
import { Data } from '../utils/types';

interface BadgeProps {
  className?: string;
  data: Data[] | number;
  label?: string;
}

type DeltaType = 'up' | 'down' | 'slightlyUp' | 'slightlyDown' | 'neutral';
const getDeltaType = (ratio: number | string | undefined): DeltaType => {
  const r = parseFloat(String(ratio ?? 0));
  const decrease = r < 10 ? 'down' : 'slightlyDown';
  const increase = r > 10 ? 'up' : 'slightlyUp';
  const delta = r > 0 ? increase : decrease;
  return (r ? delta : 'neutral') as DeltaType;
};

export default function RatioBadge({ className, data, label }: BadgeProps) {
  const ratio = Array.isArray(data) ? getRatio(data, label) : data.toRatio();
  const delta = getDeltaType(ratio);

  const color = {
    up: '#3f8600',
    down: '#cf1322',
    slightlyUp: '#3f8600',
    slightlyDown: '#cf1322',
    neutral: '#d9d9d9',
  }[delta];

  const icon = {
    up: <IconArrowUp />,
    down: <IconArrowDown />,
    slightlyUp: <IconArrowUpRight />,
    slightlyDown: <IconArrowDownRight />,
    neutral: <></>,
  }[delta];

  return (
    <Tooltip title={label}>
      <Statistic
        className={className}
        value={ratio}
        precision={2}
        valueStyle={{
          color,
          fontSize: 'large',
          display: 'flex',
          alignItems: 'center',
          border: '1px solid ' + color,
          borderRadius: 8,
          paddingRight: 4,
        }}
        prefix={icon}
      />
    </Tooltip>
  );
}
