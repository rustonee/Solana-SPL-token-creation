import BigNumber from 'bignumber.js';
import { format } from 'date-fns';

import { ENV } from '@/configs';

export const INPUT_DATE_FORMAT = 'yyyy-MM-dd HH:mm';

export const formatNum = (num: number, fixed = 0) => {
  if (!num) return num;
  if (Math.abs(num) > 1000) {
    return num
      .toFixed(fixed)
      .toString()
      .replace(/(\d)(?=(\d{3})+$)/g, '$1,');
  }
  if (Math.abs(num) < 0.01) {
    return num.toFixed(5);
  }
  return num.toFixed(2);
};

export const classNames = (...classes: any[]) =>
  classes.filter(Boolean).join(' ');

export const shortAddress = (address: string, length = 12) => {
  if (!address) return '';
  return address.slice(0, length + 2) + '...' + address.slice(-length);
};

export function bnum(val: string | number | BigNumber | boolean): BigNumber {
  const number = typeof val === 'string' ? val : val ? val.toString() : '0';
  return new BigNumber(number);
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function formatDateInput(date: Date | number) {
  if (date === 0)
    return format(new Date().getTime(), INPUT_DATE_FORMAT, {
      useAdditionalWeekYearTokens: false,
      useAdditionalDayOfYearTokens: false,
    });
  return format(new Date(date).getTime() * 1000, INPUT_DATE_FORMAT, {
    useAdditionalWeekYearTokens: false,
    useAdditionalDayOfYearTokens: false,
  });
}

export function isAvailableTime(
  startDate?: Date | number,
  endDate?: Date | number
) {
  const _start = new Date(startDate || '').getTime();
  const _end = new Date(endDate || '').getTime();
  const _current = new Date().getTime();

  if (endDate) {
    return _start <= _current && _current <= _end;
  } else {
    return _start <= _current;
  }
}

export function durationInSeconds(_from: string, _to?: string) {
  return Math.floor(
    (new Date(_from).getTime() -
      (_to ? new Date(_to).getTime() : new Date().getTime())) /
      1000
  );
}

export function exploreLink(address: string, type: string) {
  return `https://solscan.io/${type}/${address}${
    ENV.IN_PRODUCTION ? '' : '/?cluster=devnet'
  }`;
}
