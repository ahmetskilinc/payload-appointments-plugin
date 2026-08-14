import type { CollectionBeforeOperationHook, PayloadHandler, PayloadRequest } from 'payload';

import { APIError } from 'payload';

export type RateLimitOptions = {
  /** Turn rate limiting off entirely. */
  disabled?: boolean;
  /** Requests allowed per client per window. @default 60 */
  max?: number;
  /** Window length in milliseconds. @default 60000 */
  windowMs?: number;
};

type Bucket = { count: number; resetAt: number };

export type RateLimiter = {
  check: (key: string, now?: number) => { allowed: boolean; retryAfterSeconds: number };
};

/**
 * Fixed-window in-memory rate limiter. State is per server instance — good
 * abuse protection for a single server; use an edge/WAF limiter as well when
 * running many serverless instances.
 */
export const createRateLimiter = ({ max = 60, windowMs = 60_000 }: RateLimitOptions = {}): RateLimiter => {
  const buckets = new Map<string, Bucket>();

  const prune = (now: number) => {
    if (buckets.size < 10_000) {
      return;
    }
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) {
        buckets.delete(key);
      }
    }
  };

  return {
    check(key, now = Date.now()) {
      prune(now);

      const bucket = buckets.get(key);
      if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, retryAfterSeconds: 0 };
      }

      bucket.count += 1;
      if (bucket.count > max) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
        };
      }
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
};

export const getClientIp = (req: Pick<PayloadRequest, 'headers'>): string => {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || 'unknown';
};

/** Wraps a public endpoint handler with a per-IP rate limit. */
export const withEndpointRateLimit = (
  limiter: RateLimiter | null,
  route: string,
  handler: PayloadHandler,
): PayloadHandler => {
  if (!limiter) {
    return handler;
  }
  return async (req) => {
    const { allowed, retryAfterSeconds } = limiter.check(`${route}:${getClientIp(req)}`);
    if (!allowed) {
      return Response.json(
        { error: 'Too many requests' },
        { headers: { 'Retry-After': String(retryAfterSeconds) }, status: 429 },
      );
    }
    return handler(req);
  };
};

/**
 * Rate-limits unauthenticated create operations on a publicly writable
 * collection (booking, guest customer, waitlist entries via REST/GraphQL).
 */
export const createCollectionRateLimitHook = (
  limiter: RateLimiter,
  collection: string,
): CollectionBeforeOperationHook => {
  return ({ args, operation, req }) => {
    if (operation !== 'create' || req.user) {
      return args;
    }
    const { allowed, retryAfterSeconds } = limiter.check(`create:${collection}:${getClientIp(req)}`);
    if (!allowed) {
      throw new APIError(
        `Too many requests — try again in ${retryAfterSeconds}s`,
        429,
        undefined,
        true,
      );
    }
    return args;
  };
};
