/**
 * Minimal in-memory sliding-window rate limiter (per process). Good enough for a
 * single-instance deployment (Hostinger Docker); revisit if we scale out.
 * Time is injectable (`now`) so it is deterministically testable.
 */

export interface RateLimiter {
  /** Returns true if this hit is allowed; false if the key is over the limit. */
  check(key: string, now?: number): boolean;
}

export function createRateLimiter(opts: { max: number; windowMs: number }): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
    check(key, now = Date.now()) {
      const cutoff = now - opts.windowMs;
      const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);
      if (recent.length >= opts.max) {
        hits.set(key, recent);
        return false;
      }
      recent.push(now);
      hits.set(key, recent);
      return true;
    },
  };
}
