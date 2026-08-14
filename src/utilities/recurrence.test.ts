import moment from 'moment';
import { describe, expect, it } from 'vitest';

import { calculateOccurrenceDates, MAX_OCCURRENCES } from './recurrence';

const START = moment('2026-01-05T10:00:00.000Z'); // a Monday

describe('calculateOccurrenceDates', () => {
  it('returns occurrences - 1 follow-up dates for weekly recurrence', () => {
    const dates = calculateOccurrenceDates(START, 'weekly', 'occurrences', 4);
    expect(dates).toHaveLength(3);
    expect(dates[0].toISOString()).toBe('2026-01-12T10:00:00.000Z');
    expect(dates[2].toISOString()).toBe('2026-01-26T10:00:00.000Z');
  });

  it('spaces biweekly occurrences two weeks apart', () => {
    const dates = calculateOccurrenceDates(START, 'biweekly', 'occurrences', 3);
    expect(dates.map((d) => d.toISOString())).toEqual([
      '2026-01-19T10:00:00.000Z',
      '2026-02-02T10:00:00.000Z',
    ]);
  });

  it('advances monthly recurrence by calendar month', () => {
    const dates = calculateOccurrenceDates(START, 'monthly', 'occurrences', 3);
    expect(dates.map((d) => d.toISOString())).toEqual([
      '2026-02-05T10:00:00.000Z',
      '2026-03-05T10:00:00.000Z',
    ]);
  });

  it('stops at the end date (inclusive of same-day occurrences)', () => {
    const dates = calculateOccurrenceDates(START, 'weekly', 'endDate', undefined, '2026-01-19');
    expect(dates.map((d) => d.toISOString())).toEqual([
      '2026-01-12T10:00:00.000Z',
      '2026-01-19T10:00:00.000Z',
    ]);
  });

  it('caps the series at MAX_OCCURRENCES total', () => {
    const byCount = calculateOccurrenceDates(START, 'weekly', 'occurrences', 500);
    expect(byCount).toHaveLength(MAX_OCCURRENCES - 1);

    const byDate = calculateOccurrenceDates(START, 'weekly', 'endDate', undefined, '2036-01-01');
    expect(byDate.length).toBeLessThanOrEqual(MAX_OCCURRENCES - 1);
  });

  it('caps open-ended endDate recurrence at one year', () => {
    const dates = calculateOccurrenceDates(START, 'monthly', 'endDate');
    expect(dates.length).toBeLessThanOrEqual(12);
    const last = dates[dates.length - 1];
    expect(last.isSameOrBefore(START.clone().add(1, 'year'))).toBe(true);
  });
});
