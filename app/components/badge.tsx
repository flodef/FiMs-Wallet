'use client';

import { BadgeDelta, BadgeDeltaProps } from '@tremor/react';
import { twMerge } from 'tailwind-merge';
import { getDeltaType, getRatio } from '../utils/constants';
import { Data } from '../utils/types';

interface BadgeProps extends Omit<BadgeDeltaProps, 'className' | 'deltaType'> {
  className?: string;
  data: Data[] | number;
  label?: string;
}

export default function Badge({ className, data, label, ...props }: BadgeProps) {
  const ratio = Array.isArray(data) ? getRatio(data, label) : data.toRatio();
  return (
    <BadgeDelta className={twMerge(className)} deltaType={getDeltaType(ratio)} {...props}>
      {ratio}
    </BadgeDelta>
  );
}
