export type Dataset = {
  [key: string]: string;
};

export type Data = {
  label: string;
  value: number;
  ratio: number;
};

export type MinMax = {
  min: number;
  max: number;
};

export type Sizes = {
  '2xs'?: number;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  '2xl'?: number;
};

export type Filter = 'ascending' | 'descending' | 'none';

export type SymbolPosition = 'before' | 'after';

export type RoundingDirection = 'up' | 'down';

export type Digits = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Confirmations =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32;
