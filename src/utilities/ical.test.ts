import { describe, expect, it } from 'vitest';

import { generateICalFeed } from './ical';
import type { Appointment } from '../types';

const makeAppointment = (overrides: Partial<Appointment> = {}): Appointment =>
  ({
    id: 'appt-1',
    appointmentType: 'appointment',
    start: '2026-06-01T09:00:00.000Z',
    end: '2026-06-01T10:00:00.000Z',
    status: 'confirmed',
    host: {
      id: 'host-1',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
    },
    services: [{ id: 's1', title: 'Haircut; Deluxe, Extra' }],
    ...overrides,
  }) as unknown as Appointment;

describe('generateICalFeed', () => {
  const feed = generateICalFeed([makeAppointment()], 'Jane, Doe; Schedule', 'https://example.com');

  it('produces a structurally valid VCALENDAR', () => {
    expect(feed.startsWith('BEGIN:VCALENDAR')).toBe(true);
    expect(feed.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
    expect(feed).toContain('BEGIN:VEVENT');
    expect(feed).toContain('END:VEVENT');
    expect(feed).toContain('VERSION:2.0');
  });

  it('uses CRLF line endings throughout', () => {
    const lines = feed.split('\r\n');
    expect(lines.length).toBeGreaterThan(5);
    // No bare \n outside of CRLF pairs
    expect(feed.replace(/\r\n/g, '').includes('\n')).toBe(false);
  });

  it('escapes special characters in text fields', () => {
    expect(feed).toContain('Haircut\\; Deluxe\\, Extra');
    expect(feed).toContain('X-WR-CALNAME:Jane\\, Doe\\; Schedule');
  });

  it('folds lines longer than 75 characters', () => {
    const longTitle = 'A'.repeat(200);
    const longFeed = generateICalFeed(
      [makeAppointment({ services: [{ id: 's1', title: longTitle }] as never })],
      'Calendar',
      'https://example.com',
    );
    for (const line of longFeed.split('\r\n')) {
      expect(line.length).toBeLessThanOrEqual(76); // 75 + leading fold space
    }
  });

  it('formats dates as UTC basic format', () => {
    expect(feed).toMatch(/DTSTART:20260601T090000Z/);
    expect(feed).toMatch(/DTEND:20260601T100000Z/);
  });
});

describe('generateICalFeed recurrence (RRULE)', () => {
  const seriesAppointment = (
    id: string,
    start: string,
    end: string,
    recurrence: Record<string, unknown> = {},
  ) =>
    makeAppointment({
      id,
      start,
      end,
      recurrence: {
        isRecurring: true,
        pattern: 'weekly',
        endType: 'occurrences',
        occurrences: 4,
        seriesId: 'series-1',
        ...recurrence,
      },
    } as never);

  const window = {
    start: new Date('2026-06-01T00:00:00.000Z'),
    end: new Date('2026-06-30T00:00:00.000Z'),
  };

  it('collapses a weekly series into one master VEVENT with an RRULE', () => {
    const feed = generateICalFeed(
      [
        seriesAppointment('a1', '2026-06-01T09:00:00.000Z', '2026-06-01T10:00:00.000Z'),
        seriesAppointment('a2', '2026-06-08T09:00:00.000Z', '2026-06-08T10:00:00.000Z'),
        seriesAppointment('a3', '2026-06-15T09:00:00.000Z', '2026-06-15T10:00:00.000Z'),
        seriesAppointment('a4', '2026-06-22T09:00:00.000Z', '2026-06-22T10:00:00.000Z'),
      ],
      'Cal',
      'https://example.com',
      window,
    );

    expect(feed.match(/BEGIN:VEVENT/g)?.length).toBe(1);
    expect(feed).toContain('RRULE:FREQ=WEEKLY;COUNT=4');
    expect(feed).toContain('UID:series-1@example.com');
    expect(feed).not.toContain('EXDATE');
  });

  it('emits EXDATE for a cancelled occurrence inside the window', () => {
    const feed = generateICalFeed(
      [
        seriesAppointment('a1', '2026-06-01T09:00:00.000Z', '2026-06-01T10:00:00.000Z'),
        // 8 June cancelled (absent from the feed data)
        seriesAppointment('a3', '2026-06-15T09:00:00.000Z', '2026-06-15T10:00:00.000Z'),
        seriesAppointment('a4', '2026-06-22T09:00:00.000Z', '2026-06-22T10:00:00.000Z'),
      ],
      'Cal',
      'https://example.com',
      window,
    );

    expect(feed).toContain('EXDATE:20260608T090000Z');
  });

  it('emits rescheduled off-pattern occurrences as standalone events', () => {
    const feed = generateICalFeed(
      [
        seriesAppointment('a1', '2026-06-01T09:00:00.000Z', '2026-06-01T10:00:00.000Z'),
        // moved from 8 June 09:00 to 9 June 11:00
        seriesAppointment('a2', '2026-06-09T11:00:00.000Z', '2026-06-09T12:00:00.000Z'),
      ],
      'Cal',
      'https://example.com',
      window,
    );

    expect(feed.match(/BEGIN:VEVENT/g)?.length).toBe(2);
    expect(feed).toContain('EXDATE:20260608T090000Z');
    expect(feed).toContain('DTSTART:20260609T110000Z');
  });

  it('uses UNTIL for endDate-bounded series and biweekly interval', () => {
    const feed = generateICalFeed(
      [
        seriesAppointment('a1', '2026-06-01T09:00:00.000Z', '2026-06-01T10:00:00.000Z', {
          pattern: 'biweekly',
          endType: 'endDate',
          endDate: '2026-07-13',
          occurrences: undefined,
        }),
      ],
      'Cal',
      'https://example.com',
      window,
    );

    expect(feed).toContain('RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=');
  });

  it('falls back to per-occurrence events when no bounded rule exists', () => {
    const feed = generateICalFeed(
      [
        seriesAppointment('a1', '2026-06-01T09:00:00.000Z', '2026-06-01T10:00:00.000Z', {
          pattern: undefined,
        }),
        seriesAppointment('a2', '2026-06-08T09:00:00.000Z', '2026-06-08T10:00:00.000Z', {
          pattern: undefined,
        }),
      ],
      'Cal',
      'https://example.com',
      window,
    );

    expect(feed.match(/BEGIN:VEVENT/g)?.length).toBe(2);
    expect(feed).not.toContain('RRULE');
  });
});
