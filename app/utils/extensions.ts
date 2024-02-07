'use client';

import { MinMax } from './types';

declare global {
  interface Number {
    toLocaleCurrency(currency?: string): string;
    toShortCurrency(maxDecimals?: number, symbol?: string): string;
    toCurrency(maxDecimals?: number, symbol?: string): string;
    toRatio(maxDecimals?: number): string;
    toLocaleDate(): string;
    toShortFixed(maxDecimals?: number): string;
    toDecimalPlace(decimalPlace?: number, direction?: RoundingDirection): number;
  }
  interface String {
    fromCurrency(locale?: string): number;
    normalize(): string;
    testLimit(limit: MinMax): boolean;
  }
}

Number.prototype.toLocaleCurrency = function (currency = 'EUR') {
  return Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency,
  }).format(Number(this));
};

Number.prototype.toShortCurrency = function (maxDecimals = 0, symbol = '€') {
  return (
    this.toShortFixed(maxDecimals)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
      .replace(/ 000/, 'K') +
    ' ' +
    symbol
  );
};

Number.prototype.toCurrency = function (maxDecimals = 2, symbol = '€') {
  return `${this.toFixed(maxDecimals)} ${symbol}`;
};

Number.prototype.toRatio = function (maxDecimals = 2) {
  return `${(Number(this) * 100).toFixed(maxDecimals)}%`;
};

Number.prototype.toLocaleDate = function () {
  return new Date(Math.round((Number(this) - 25569) * 86400 * 1000)).toLocaleDateString();
};

Number.prototype.toShortFixed = function (maxDecimals = 2) {
  return Number.isInteger(this) ? this.toString() : this.toFixed(maxDecimals);
};

export enum RoundingDirection {
  up = 'up',
  down = 'down',
}
Number.prototype.toDecimalPlace = function (decimalPlace = 2, direction = RoundingDirection.down) {
  const multiplier = 10 ** decimalPlace;
  const roundedValue =
    direction === 'up' ? Math.ceil(Number(this) / multiplier) : Math.floor(Number(this) / multiplier);
  return roundedValue * multiplier;
};

String.prototype.fromCurrency = function (locale?: string) {
  const number = (locale ?? Intl.NumberFormat().resolvedOptions().locale).startsWith('fr')
    ? this.replace(/,/g, '.')
    : this.replace(/,/g, '');
  return parseFloat(number.replace(/[^0-9\.\-]/g, ''));
};

String.prototype.normalize = function () {
  const label = this.trim();
  return label.charAt(0).toUpperCase() + label.slice(1);
};

String.prototype.testLimit = function (limit: MinMax) {
  return this.length >= limit.min && this.length <= limit.max;
};
