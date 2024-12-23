import tailwindConfig from '@/tailwind.config';
import { SyntheticEvent } from 'react';
import { Data } from './types';

export const handleEvent = (event: SyntheticEvent) => {
  if (event instanceof KeyboardEvent) {
    if (event.key !== 'Enter') return false;
    event.preventDefault();
  }
  return true;
};

export const findValue = (data: Data[], label: string | undefined) => {
  return label ? data.find(d => d.label.toLowerCase().includes(label.toLowerCase())) : undefined;
};
export const getCurrency = (data: Data[], label: string | undefined, defaultValue = 0) => {
  return (findValue(data, label)?.value ?? defaultValue).toLocaleCurrency();
};
export const getRatio = (data: Data[], label: string | undefined, defaultValue = 0) => {
  return (findValue(data, label)?.ratio ?? defaultValue).toRatio();
};

export const getCurrentLanguage = () => {
  return typeof navigator !== 'undefined' ? navigator.language : 'fr-FR';
};

export const getFormattedDate = (date = new Date(), precision = 3) =>
  !isNaN(date.getTime())
    ? date.getFullYear() +
      (precision > 1 ? '-' + ('0' + (date.getMonth() + 1)).slice(-2) : '') +
      (precision > 2 ? '-' + ('0' + date.getDate()).slice(-2) : '')
    : '';

export const transitionDuration = parseInt(tailwindConfig.theme.extend.transitionDuration.DEFAULT);
