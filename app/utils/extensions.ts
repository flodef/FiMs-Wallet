'use client';

import { MinMax, SymbolPosition } from './types';

// Extend prototype
declare global {
  interface Number {
    toLocaleCurrency(currency?: string): string;
    toShortCurrency(maxDecimals?: number, symbol?: string): string;
    toCurrency(maxDecimals?: number, symbol?: string): string;
    toRatio(maxDecimals?: number): string;
    toLocaleDateString(): string;
    toShortFixed(maxDecimals?: number): string;
    toDecimalPlace(decimalPlace?: number, direction?: RoundingDirection): number;
    toClosestPowerOfTen(direction?: RoundingDirection): number;
    getPrecision(): number;
  }
  interface String {
    fromCurrency(locale?: string): number;
    toFirstUpperCase(): string;
    testLimit(limit: MinMax): boolean;
  }
  interface Date {
    toShortDate(): string;
    toLongDate(): string;
  }
  interface Array<T> {
    removeHeader(): Array<T>;
  }
}

Number.prototype.toLocaleCurrency = function (currency = 'EUR') {
  const precision = this.getPrecision();

  return Intl.NumberFormat(navigator.language, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: precision,
  }).format(Number(this));
};

Number.prototype.toShortCurrency = function (maxDecimals = 0, symbol = '€') {
  return (
    this.toShortFixed(maxDecimals)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
      .replace(/ 000 000/, 'M')
      .replace(/ 000/, 'K') + (symbol ? (Number(this) < 1000 ? ' ' : '') + symbol : '')
  );
};

Number.prototype.toCurrency = function (maxDecimals = 2, symbol = '€', symbolPosition: SymbolPosition = 'after') {
  return `${symbolPosition === 'before' ? symbol : ''}${this.toFixed(maxDecimals)}${symbolPosition === 'after' ? symbol : ''}`;
};

Number.prototype.toRatio = function (maxDecimals = 2) {
  return `${(Number(this) * 100).toFixed(maxDecimals)}%`;
};

Number.prototype.toLocaleDateString = function () {
  return new Date(Math.round((Number(this) - 25569) * 86400 * 1000)).toShortDate();
};

Number.prototype.toShortFixed = function (maxDecimals = 2) {
  return Number.isInteger(this) ? this.toString() : this.toFixed(maxDecimals);
};

export type RoundingDirection = 'up' | 'down';
Number.prototype.toDecimalPlace = function (decimalPlace = 2, direction: RoundingDirection = 'up') {
  const multiplier = 10 ** decimalPlace;
  const roundedValue =
    direction === 'up' ? Math.ceil(Number(this) * multiplier) : Math.floor(Number(this) * multiplier);
  return roundedValue / multiplier;
};

Number.prototype.toClosestPowerOfTen = function (direction: RoundingDirection = 'down') {
  if (Math.abs(Number(this)) < 10) return direction === 'down' ? 0 : 1;

  let absNumber = Math.abs(Number(this));
  let power = 1;

  while (absNumber >= 100) {
    absNumber /= 10;
    power++;
  }

  return Math.pow(10, direction === 'down' ? power : power + 1);
};

Number.prototype.getPrecision = function () {
  // Convert to absolute value to handle negative numbers
  const absNum = Math.abs(Number(this));

  // If number is 10 or greater, return 2 (assuming no need for decimals beyond one place)
  if (absNum >= 10) return 2;

  // Determine precision based on the number's magnitude
  const log10 = Math.floor(Math.log10(absNum));
  const precision = log10 < 0 ? Math.abs(log10) + 1 : 2; // +1 to account for numbers like 0.1 or 0.01

  // Limit the precision to 5
  return Math.min(precision, 5);
};

String.prototype.fromCurrency = function (locale?: string) {
  const number = (locale ?? Intl.NumberFormat(navigator.language).resolvedOptions().locale).startsWith('fr')
    ? this.replace(/,/g, '.')
    : this.replace(/,/g, '');
  return parseFloat(number.replace(/[^0-9\.\-]/g, ''));
};

String.prototype.toFirstUpperCase = function () {
  const label = this.trim();
  return label.charAt(0).toUpperCase() + label.slice(1);
};

String.prototype.testLimit = function (limit: MinMax) {
  return this.length >= limit.min && this.length <= limit.max;
};

Date.prototype.toShortDate = function () {
  return this.toLocaleDateString(navigator.language, { year: 'numeric', month: 'numeric', day: 'numeric' });
};

Date.prototype.toLongDate = function () {
  return this.toLocaleString(navigator.language);
};

Array.prototype.removeHeader = function () {
  return this.filter((_, i) => i !== 0);
};
