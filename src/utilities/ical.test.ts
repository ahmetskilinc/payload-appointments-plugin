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
