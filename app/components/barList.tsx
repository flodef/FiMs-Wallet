// Tremor BarList [v0.1.1]

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { twMerge } from 'tailwind-merge';
import { useNavigation } from '../hooks/useNavigation';
import { AvailableChartColors, AvailableChartColorsKeys, getColorClassName } from '../utils/chart';

type Bar<T> = T & {
  key?: string;
  href?: string;
  value: number;
  label: string;
};

interface BarListProps<T = unknown> extends React.HTMLAttributes<HTMLDivElement> {
  data: Bar<T>[];
  valueFormatter?: (value: number) => string;
  showAnimation?: boolean;
  onValueChange?: (payload: Bar<T>) => void;
  colors?: AvailableChartColorsKeys[];
  sortOrder?: 'ascending' | 'descending' | 'none';
  selectedIndex?: number;
  onSelectedIndexChange?: (index?: number) => void;
}

function BarListInner<T>(
  {
    data = [],
    valueFormatter = value => value.toString(),
    showAnimation = false,
    onValueChange,
    colors = AvailableChartColors,
    sortOrder = 'descending',
    selectedIndex,
    onSelectedIndexChange,
    className,
    ...props
  }: BarListProps<T>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const [internalSelectedIndex, setInternalSelectedIndex] = useState<number>();

  const actualSelectedIndex = selectedIndex ?? internalSelectedIndex;
  const setActualSelectedIndex = onSelectedIndexChange ?? setInternalSelectedIndex;
  const isHandlingEvent = onValueChange || onSelectedIndexChange;

  const { page } = useNavigation();

  const [animatedWidths, setAnimatedWidths] = useState<number[]>([]);

  const handleClick = useCallback(
    (bar: Bar<T>, index: number) => {
      setActualSelectedIndex(index === actualSelectedIndex ? undefined : index);
      onValueChange?.(bar);
    },
    [onValueChange, actualSelectedIndex, setActualSelectedIndex],
  );

  const Component = isHandlingEvent ? 'button' : 'div';
  const sortedData = useMemo(() => {
    if (sortOrder === 'none') {
      return data;
    }
    return [...data].sort((a, b) => {
      return sortOrder === 'ascending' ? a.value - b.value : b.value - a.value;
    });
  }, [data, sortOrder]);

  const widths = useMemo(() => {
    const maxValue = Math.max(...sortedData.map(item => item.value), 0);
    return sortedData.map(item => (item.value === 0 ? 0 : Math.max((item.value / maxValue) * 100, 2)));
  }, [sortedData]);

  useEffect(() => {
    setAnimatedWidths(Array.from({ length: data.length }, () => 0));
    const timeout = setTimeout(() => {
      setAnimatedWidths(widths);
    }, 100);
    return () => clearTimeout(timeout);
  }, [page, widths, data.length]);

  const rowHeight = 'h-8';

  return (
    <div
      ref={forwardedRef}
      className={twMerge('flex justify-between space-x-6', className)}
      aria-sort={sortOrder}
      tremor-id="tremor-raw"
      {...props}
    >
      <div className="relative w-full space-y-1.5">
        {sortedData.map((item, index) => (
          <Component
            key={item.key ?? item.label}
            onClick={() => {
              handleClick(item, index);
            }}
            className={twMerge(
              // base
              'group w-full rounded',
              // focus
              //   focusRing,
              isHandlingEvent
                ? [
                    '!-m-0 cursor-pointer',
                    // hover
                    'hover:bg-gray-50 hover:dark:bg-gray-900',
                  ]
                : '',
            )}
          >
            <div
              className={twMerge(
                // base
                'flex items-center rounded transition-all',
                rowHeight,
                // background color
                getColorClassName(colors[index] || AvailableChartColors[0], 'bg'),
                isHandlingEvent ? 'group-hover:bg-opacity-80' : '',
                actualSelectedIndex !== undefined && actualSelectedIndex !== index ? 'opacity-30' : '',
                // margin and duration
                index === sortedData.length - 1 && 'mb-0',
                showAnimation && 'duration-1000',
              )}
              style={{ width: `${animatedWidths[index]}%` }}
            >
              <div className={twMerge('absolute left-2 flex max-w-full pr-2')}>
                {item.href ? (
                  <a
                    href={item.href}
                    className={twMerge(
                      // base
                      'truncate whitespace-nowrap rounded text-sm',
                      // text color
                      'text-gray-900 dark:text-gray-50',
                      // hover
                      'hover:underline hover:underline-offset-2',
                      // focus
                      //   focusRing,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    onClick={event => event.stopPropagation()}
                  >
                    {item.label}
                  </a>
                ) : (
                  <p
                    className={twMerge(
                      // base
                      'truncate whitespace-nowrap text-sm',
                      // text color
                      'text-gray-900 dark:text-gray-50',
                    )}
                  >
                    {item.label}
                  </p>
                )}
              </div>
            </div>
          </Component>
        ))}
      </div>
      <div>
        {sortedData.map((item, index) => (
          <div
            key={item.key ?? item.label}
            className={twMerge(
              'flex items-center justify-end',
              rowHeight,
              index === sortedData.length - 1 ? 'mb-0' : 'mb-1.5',
            )}
          >
            <p
              className={twMerge(
                // base
                'truncate whitespace-nowrap text-sm leading-none',
                // text color
                'text-gray-900 dark:text-gray-50',
                // background color
                actualSelectedIndex !== undefined && actualSelectedIndex !== index ? 'opacity-30' : '',
              )}
            >
              {valueFormatter(item.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

BarListInner.displayName = 'BarList';

const BarList = React.forwardRef(BarListInner) as <T>(
  p: BarListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => ReturnType<typeof BarListInner>;

export { BarList, type BarListProps };
