/**
 * In-memory rate limiter for login brute-force protection.
 * For multi-server deployments, replace with Redis-backed store.
 * Resets on server restart — acceptable for a single-church SaaS.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
if (typeof globalThis !== 'undefined' && typeof setInterval === 'function') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) store.delete(key);
    }
  }, CLEANUP_INTERVAL);
}

/**
 * Check rate limit for a given key.
 * @returns true if the request should be blocked (rate limit exceeded)
 */
export function rateLimit(
  key: string,
  options: { maxRequests: number; windowMs: number } = { maxRequests: 5, windowMs: 60 * 1000 }
): { blocked: boolean; retryAfterMs: number } {
  const { maxRequests, windowMs } = options;
  const now = Date.now();

  const entry = store.get(key);
  if (!entry || now >= entry.resetAt) {
    // First request or window expired — create fresh entry
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { blocked: false, retryAfterMs: 0 };
  }

  if (entry.count >= maxRequests) {
    const retryAfterMs = entry.resetAt - now;
    return { blocked: true, retryAfterMs };
  }

  entry.count++;
  return { blocked: false, retryAfterMs: 0 };
}

/** Get remaining attempts before rate limit kicks in */
export function rateLimitRemaining(
  key: string,
  options: { maxRequests: number; windowMs: number } = { maxRequests: 5, windowMs: 60 * 1000 }
): number {
  const { maxRequests, windowMs } = options;
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now >= entry.resetAt) return maxRequests;
  return Math.max(0, maxRequests - entry.count);
}
