import { ChevronDownIcon, ChevronUpDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import { Flex, Icon, TableHead, TableHeaderCell, TableRow } from '@tremor/react';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Filter, Sizes } from '../utils/types';

type tableObject = {
  [key: string]: string | number | number[] | Date | boolean | undefined;
};

function getVisibilityClassName(index: number, sizes: Sizes | undefined): string {
  if (!sizes || Object.keys(sizes).length === 0) return 'visible';

  // Find the minimum size for the given index
  let minSizeKey = '';
  for (const key of Object.keys(sizes)) {
    const value = sizes[key as keyof Sizes] ?? 0;
    if (value <= index + 1) minSizeKey = key;
  }

  return !minSizeKey ? 'visible' : 'hidden ' + minSizeKey + ':table-cell';
}

export function SortHeader<T extends tableObject>({
  label,
  index,
  filters,
  table,
  setTable,
}: {
  label: string;
  index: number;
  filters: Filter[];
  table: T[] | undefined;
  setTable: (table: T[] | undefined) => void;
}) {
  const changeFilter = (index: number) => {
    filters.forEach((filter, i) => {
      filters[i] = i === index ? (filter === 'ascending' ? 'descending' : 'ascending') : 'none';
    });
    const filter = filters[index];

    if (table?.length) {
      const sortedTable = [...table].sort((a, b) => {
        if (a === undefined || b === undefined) return 0;

        const propertyA = a[Object.keys(a)[index]];
        const propertyB = b[Object.keys(b)[index]];

        const getTime = (date: string | number | Date) => new Date(date).getTime();

        if (
          typeof propertyA === 'object' &&
          typeof propertyB === 'object' &&
          !Array.isArray(propertyA) &&
          !Array.isArray(propertyB) &&
          !isNaN(getTime(propertyA)) &&
          !isNaN(getTime(propertyB))
        ) {
          const numA = getTime(propertyA);
          const numB = getTime(propertyB);
          return filter === 'ascending' ? numA - numB : numB - numA;
        } else if (!isNaN(Number(propertyA)) && !isNaN(Number(propertyB))) {
          const numA = Number(propertyA);
          const numB = Number(propertyB);
          return filter === 'ascending' ? numA - numB : numB - numA;
        } else {
          const stringA = String(propertyA);
          const stringB = String(propertyB);
          return filter === 'ascending' ? stringA.localeCompare(stringB) : stringB.localeCompare(stringA);
        }
      });

      setTable(sortedTable);
    }
  };

  return (
    <Flex className="cursor-pointer" onClick={() => changeFilter(index)} justifyContent="start" alignItems="start">
      {label}
      {table?.length && (
        <Icon
          className="w-6 h-6"
          icon={
            filters[index] === 'ascending'
              ? ChevronUpIcon
              : filters[index] === 'descending'
                ? ChevronDownIcon
                : ChevronUpDownIcon
          }
        />
      )}
    </Flex>
  );
}

export default function SortTableHead<T extends tableObject>({
  labels,
  table,
  setTable,
  sizes,
}: {
  labels: string[];
  table: T[] | undefined;
  setTable: (table: T[] | undefined) => void;
  sizes?: Sizes;
}) {
  const [filters] = useState<Filter[]>(Array.from({ length: labels.length }, () => 'none'));

  const tableLength = table?.length ? Object.keys(table[0]).length : 0;

  return (
    <TableHead>
      <TableRow>
        {labels.map((label, index) => (
          <TableHeaderCell
            key={index}
            className={twMerge(getVisibilityClassName(index, sizes), `w-[${(100 / labels.length).toFixed(6)}%] px-1`)}
          >
            {index < tableLength ? (
              <SortHeader label={label} index={index} table={table} setTable={setTable} filters={filters} />
            ) : (
              label
            )}
          </TableHeaderCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
