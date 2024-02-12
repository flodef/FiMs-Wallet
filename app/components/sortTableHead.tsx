import { ChevronDownIcon, ChevronUpDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import { Flex, Icon, TableHead, TableHeaderCell, TableRow } from '@tremor/react';
import { useState } from 'react';
import { Filter } from '../utils/types';

export function SortHeader({
  label,
  index,
  table,
  setTable,
}: {
  label: string;
  index: number;
  table: any[] | undefined;
  setTable: (table: any[] | undefined) => void;
}) {
  const [filters, setFilters] = useState<Filter[]>(['descending', 'none', 'none']);
  const changeFilter = (index: number) => {
    const newFilters = [...filters];
    newFilters.forEach((filter, i) => {
      newFilters[i] = i === index ? (filter === 'ascending' ? 'descending' : 'ascending') : 'none';
    });
    setFilters(newFilters);

    if (table?.length) {
      const sortedTable = [...table].sort((a, b) => {
        if (a === undefined || b === undefined) return 0;

        const propertyA = a[Object.keys(a)[index]];
        const propertyB = b[Object.keys(b)[index]];

        const getTime = (date: string | number | Date) => new Date(date).getTime();

        if (!isNaN(getTime(propertyA)) && !isNaN(getTime(propertyB))) {
          const numA = getTime(propertyA);
          const numB = getTime(propertyB);
          return newFilters[index] === 'ascending' ? numA - numB : numB - numA;
        } else if (!isNaN(Number(propertyA)) && !isNaN(Number(propertyA))) {
          const numA = Number(propertyA);
          const numB = Number(propertyB);
          return newFilters[index] === 'ascending' ? numA - numB : numB - numA;
        } else {
          const stringA = String(propertyA);
          const stringB = String(propertyB);
          return newFilters[index] === 'ascending' ? stringA.localeCompare(stringB) : stringB.localeCompare(stringA);
        }
      });

      setTable(sortedTable);
    }
  };

  return (
    <Flex justifyContent="start" alignItems="start">
      {label}
      {table?.length && (
        <Icon
          icon={
            filters[index] === 'ascending'
              ? ChevronUpIcon
              : filters[index] === 'descending'
                ? ChevronDownIcon
                : ChevronUpDownIcon
          }
          className="w-6 h-6 cursor-pointer"
          onClick={() => changeFilter(index)}
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
  const length = table?.length ? Object.keys(table[0]).length : 0;
  return (
    <TableHead>
      <TableRow>
        {labels.map((label, index) => (
          <TableHeaderCell key={index} className={`w-[${(100 / labels.length).toFixed(6)}%] px-2.5`}>
            {index < length ? <SortHeader label={label} index={index} table={table} setTable={setTable} /> : label}
          </TableHeaderCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
