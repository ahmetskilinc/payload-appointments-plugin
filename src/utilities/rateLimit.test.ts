import { describe, expect, it } from 'vitest';

import { createRateLimiter, getClientIp } from './rateLimit';

describe('createRateLimiter', () => {
  it('allows up to max requests per window, then blocks', () => {
    const limiter = createRateLimiter({ max: 3, windowMs: 60_000 });
    const now = 1_000_000;

    expect(limiter.check('k', now).allowed).toBe(true);
    expect(limiter.check('k', now + 1).allowed).toBe(true);
    expect(limiter.check('k', now + 2).allowed).toBe(true);

    const blocked = limiter.check('k', now + 3);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('tracks keys independently', () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000 });
    const now = 1_000_000;

    expect(limiter.check('a', now).allowed).toBe(true);
    expect(limiter.check('b', now).allowed).toBe(true);
    expect(limiter.check('a', now + 1).allowed).toBe(false);
  });

  it('resets after the window elapses', () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 1_000 });
    const now = 1_000_000;

    expect(limiter.check('k', now).allowed).toBe(true);
    expect(limiter.check('k', now + 500).allowed).toBe(false);
    expect(limiter.check('k', now + 1_001).allowed).toBe(true);
  });
});

describe('getClientIp', () => {
  const reqWith = (headers: Record<string, string>) =>
    ({ headers: new Headers(headers) }) as { headers: Headers };

  it('uses the first x-forwarded-for entry', () => {
    expect(getClientIp(reqWith({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }))).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip, then unknown', () => {
    expect(getClientIp(reqWith({ 'x-real-ip': '9.9.9.9' }))).toBe('9.9.9.9');
    expect(getClientIp(reqWith({}))).toBe('unknown');
  });
});
