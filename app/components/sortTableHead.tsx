import { ChevronDownIcon, ChevronUpDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import { Flex, Icon, TableHead, TableHeaderCell, TableRow } from '@tremor/react';
import { useState } from 'react';
import { Filter } from '../utils/types';

export function SortHeader({
  label,
  index,
  filters,
  table,
  setTable,
}: {
  label: string;
  index: number;
  filters: Filter[];
  table: any[] | undefined;
  setTable: (table: any[] | undefined) => void;
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

export default function SortTableHead({
  labels,
  table,
  setTable,
}: {
  labels: string[];
  table: any[] | undefined;
  setTable: (table: any[] | undefined) => void;
}) {
  const [filters, _] = useState<Filter[]>(Array.from({ length: labels.length }, () => 'none'));

  const length = table?.length ? Object.keys(table[0]).length : 0;

  return (
    <TableHead>
      <TableRow>
        {labels.map((label, index) => (
          <TableHeaderCell key={index} className={`w-[${(100 / labels.length).toFixed(6)}%] px-1`}>
            {index < length ? (
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
