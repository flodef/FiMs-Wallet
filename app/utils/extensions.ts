'use client';

import { getCurrentLanguage } from './functions';
import { MinMax, RoundingDirection, SymbolPosition } from './types';

// Extend prototype
declare global {
  interface Number {
    toLocaleCurrency(maxDecimals?: number, currency?: string): string;
    toShortCurrency(maxDecimals?: number, symbol?: string): string;
    toCurrency(maxDecimals?: number, symbol?: string, symbolPosition?: SymbolPosition): string;
    toRatio(maxDecimals?: number): string;
    toLocaleDateString(): string;
    toShortFixed(maxDecimals?: number): string;
    toDecimalPlace(decimalPlace?: number, direction?: RoundingDirection): number;
    toClosestPowerOfTen(direction?: RoundingDirection): number;
    getPrecision(maxDecimals?: number): number;
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

Number.prototype.toLocaleCurrency = function (maxDecimals?: number, currency = 'EUR') {
  const num = Number(this);

  maxDecimals = this.getPrecision(maxDecimals);
  const formatter = (curr: string) =>
    Intl.NumberFormat(getCurrentLanguage(), {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: maxDecimals,
      maximumFractionDigits: maxDecimals,
    }).format(num);

  try {
    return formatter(currency);
  } catch {
    // If currency is invalid, use EUR as template and replace € with the custom currency
    return formatter('EUR').replace('€', currency);
  }
};

Number.prototype.toShortCurrency = function (maxDecimals?: number, currency = 'EUR') {
  const billion = 1000000000;
  const million = 1000000;
  const thousand = 1000;

  const addSuffix = (formattedNum: string, suffix: string) => {
    // If currency is at the start (e.g., $123), add suffix at the end
    if (formattedNum.match(/^[^\d]/)) {
      return formattedNum + suffix;
    }
    // If currency is at the end (e.g., 123 €), add suffix before currency
    // Look for the last number followed by any whitespace and then the currency
    const match = formattedNum.match(/^(.*?\d)(\s*[^\d]+)$/);
    if (match) {
      return match[1] + suffix + match[2];
    }
    return formattedNum + suffix;
  };

  const num = Number(this);
  if (num >= billion) {
    return addSuffix((num / billion).toLocaleCurrency(maxDecimals, currency), 'B');
  }
  if (num >= million) {
    return addSuffix((num / million).toLocaleCurrency(maxDecimals, currency), 'M');
  }
  if (num >= thousand) {
    return addSuffix((num / thousand).toLocaleCurrency(maxDecimals, currency), 'K');
  }
  return num.toLocaleCurrency(maxDecimals, currency);
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

Number.prototype.getPrecision = function (maxDecimals = 5) {
  const absNum = Math.abs(Number(this));

  if (absNum >= 10) return Math.min(maxDecimals, 2);
  if (absNum === 0) return 0;

  // Determine precision based on the number's magnitude
  const log10 = Math.floor(Math.log10(absNum));
  const initialPrecision = log10 <= 0 ? Math.abs(log10) + (log10 === 0 ? 3 : 2) : 2;

  // Remove trailing zeros after the decimal point
  const numStr = absNum.toFixed(initialPrecision);
  const trimmedNumStr = numStr.replace(/0*$/, '');

  // Calculate the new precision based on the trimmed string
  const precision = trimmedNumStr.includes('.') ? trimmedNumStr.length - trimmedNumStr.indexOf('.') - 1 : 0;

  return Math.min(precision, maxDecimals);
};

String.prototype.fromCurrency = function (locale?: string) {
  const number = (locale ?? Intl.NumberFormat(getCurrentLanguage()).resolvedOptions().locale).startsWith('fr')
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
  return this.toLocaleDateString(getCurrentLanguage(), {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
};

Date.prototype.toLongDate = function () {
  return this.toLocaleString(getCurrentLanguage(), {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
};

Array.prototype.removeHeader = function () {
  return this.filter((_, i) => i !== 0);
};
