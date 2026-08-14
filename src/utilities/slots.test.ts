import { describe, expect, it } from 'vitest';

import { curateSlots, dayOfWeekInTimezone, filterOverlappingSlots, resolveTimeOnDay } from './slots';

const NOW = new Date('2026-01-01T00:00:00.000Z');

describe('curateSlots', () => {
  it('generates slots that fully fit before closing', () => {
    // 09:00 - 12:00, 60-minute slots → 09:00, 10:00, 11:00 (11:00 + 60m = 12:00 fits)
    const slots = curateSlots(
      60,
      '2026-06-01T09:00:00.000Z',
      '2026-06-01T12:00:00.000Z',
      { earliestBookableTime: null },
      NOW,
    );
    expect(slots).toEqual([
      '2026-06-01T09:00:00.000Z',
      '2026-06-01T10:00:00.000Z',
      '2026-06-01T11:00:00.000Z',
    ]);
  });

  it('never emits a slot that would overflow closing time', () => {
    // 09:00 - 12:30 with 60-minute slots → 12:00 would end at 13:00, past close
    const slots = curateSlots(
      60,
      '2026-06-01T09:00:00.000Z',
      '2026-06-01T12:30:00.000Z',
      { earliestBookableTime: null },
      NOW,
    );
    expect(slots[slots.length - 1]).toBe('2026-06-01T11:00:00.000Z');
  });

  it('respects lead time via earliestBookableTime', () => {
    const slots = curateSlots(
      60,
      '2026-06-01T09:00:00.000Z',
      '2026-06-01T12:00:00.000Z',
      { earliestBookableTime: '2026-06-01T10:00:00.000Z' },
      NOW,
    );
    expect(slots).toEqual(['2026-06-01T11:00:00.000Z']);
  });

  it('excludes past slots relative to now', () => {
    const slots = curateSlots(
      60,
      '2026-06-01T09:00:00.000Z',
      '2026-06-01T12:00:00.000Z',
      { earliestBookableTime: null },
      new Date('2026-06-01T09:30:00.000Z'),
    );
    expect(slots).toEqual(['2026-06-01T10:00:00.000Z', '2026-06-01T11:00:00.000Z']);
  });

  it('returns nothing for a non-positive slot duration', () => {
    expect(
      curateSlots(
        0,
        '2026-06-01T09:00:00.000Z',
        '2026-06-01T12:00:00.000Z',
        { earliestBookableTime: null },
        NOW,
      ),
    ).toEqual([]);
  });
});

describe('filterOverlappingSlots', () => {
  const slots = [
    '2026-06-01T09:00:00.000Z',
    '2026-06-01T10:00:00.000Z',
    '2026-06-01T11:00:00.000Z',
  ];

  it('removes slots overlapping an existing booking', () => {
    const filtered = filterOverlappingSlots(slots, 60, [
      { start: '2026-06-01T09:30:00.000Z', end: '2026-06-01T10:30:00.000Z' },
    ]);
    expect(filtered).toEqual(['2026-06-01T11:00:00.000Z']);
  });

  it('keeps slots that touch a booking edge exactly', () => {
    const filtered = filterOverlappingSlots(slots, 60, [
      { start: '2026-06-01T10:00:00.000Z', end: '2026-06-01T11:00:00.000Z' },
    ]);
    expect(filtered).toEqual(['2026-06-01T09:00:00.000Z', '2026-06-01T11:00:00.000Z']);
  });

  it('keeps everything when there are no bookings', () => {
    expect(filterOverlappingSlots(slots, 60, [])).toEqual(slots);
  });
});

describe('resolveTimeOnDay', () => {
  it('applies a wall-clock time to a day in the business timezone', () => {
    // 09:00 New York time on June 1st = 13:00 UTC (EDT, UTC-4)
    const instant = resolveTimeOnDay(
      '2026-06-01',
      '2026-01-01T14:00:00.000Z', // 09:00 in America/New_York (EST, UTC-5)
      'America/New_York',
    );
    expect(instant).toBe('2026-06-01T13:00:00.000Z');
  });
});

describe('dayOfWeekInTimezone', () => {
  it('resolves the weekday in the business timezone', () => {
    // 2026-06-01 is a Monday
    expect(dayOfWeekInTimezone('2026-06-01', 'UTC')).toBe('monday');
    expect(dayOfWeekInTimezone('2026-06-01', 'Pacific/Auckland')).toBe('monday');
  });
});
