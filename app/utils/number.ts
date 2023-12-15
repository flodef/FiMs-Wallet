'use client';

import { IS_LOCAL } from './constants'; // Hack to be able to use the global context in this file

declare global {
  interface Number {
    toLocaleCurrency(currency?: string): string;
    toShortCurrency(maxDecimals?: number, symbol?: string): string;
    toCurrency(maxDecimals?: number, symbol?: string): string;
    toRatio(maxDecimals?: number): string;
  }
  interface String {
    fromCurrency(locale?: string): number;
  }
}

Number.prototype.toLocaleCurrency = function (currency = 'EUR') {
  return Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency,
  }).format(Number(this));
};

Number.prototype.toShortCurrency = function (maxDecimals = 2, symbol = '€') {
  return (
    this.toFixed(maxDecimals)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
      .replace(/\.00/, '')
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
String.prototype.fromCurrency = function (locale = 'fr') {
  const number = locale === 'fr' ? this.replace(/,/g, '.') : this.replace(/,/g, '');
  return parseFloat(number.replace(/[^0-9\.\-]/g, ''));
};
