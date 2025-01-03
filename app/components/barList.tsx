// Tremor BarList [v0.1.1]

import React from 'react';

import { twMerge } from 'tailwind-merge';
import { AvailableChartColors, AvailableChartColorsKeys, getColorClassName } from '../utils/chart';

type Bar<T> = T & {
  key?: string;
  href?: string;
  value: number;
  name: string;
};

interface BarListProps<T = unknown> extends React.HTMLAttributes<HTMLDivElement> {
  data: Bar<T>[];
  valueFormatter?: (value: number) => string;
  showAnimation?: boolean;
  onValueChange?: (payload: Bar<T>) => void;
  colors?: AvailableChartColorsKeys[];
  sortOrder?: 'ascending' | 'descending' | 'none';
}

function BarListInner<T>(
  {
    data = [],
    valueFormatter = value => value.toString(),
    showAnimation = false,
    onValueChange,
    colors = AvailableChartColors,
    sortOrder = 'descending',
    className,
    ...props
  }: BarListProps<T>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const Component = onValueChange ? 'button' : 'div';
  const sortedData = React.useMemo(() => {
    if (sortOrder === 'none') {
      return data;
    }
    return [...data].sort((a, b) => {
      return sortOrder === 'ascending' ? a.value - b.value : b.value - a.value;
    });
  }, [data, sortOrder]);

  const widths = React.useMemo(() => {
    const maxValue = Math.max(...sortedData.map(item => item.value), 0);
    return sortedData.map(item => (item.value === 0 ? 0 : Math.max((item.value / maxValue) * 100, 2)));
  }, [sortedData]);

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
            key={item.key ?? item.name}
            onClick={() => {
              onValueChange?.(item);
            }}
            className={twMerge(
              // base
              'group w-full rounded',
              // focus
              //   focusRing,
              onValueChange
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
                // 'bg-blue-200 dark:bg-blue-900',
                getColorClassName(colors[index] || AvailableChartColors[0], 'bg'),
                onValueChange ? 'group-hover:bg-opacity-80' : '',
                // margin and duration
                index === sortedData.length - 1 && 'mb-0',
                showAnimation && 'duration-800',
              )}
              style={{ width: `${widths[index]}%` }}
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
                    {item.name}
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
                    {item.name}
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
            key={item.key ?? item.name}
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
