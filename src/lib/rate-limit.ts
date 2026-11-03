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

import { NextRequest, NextResponse } from "next/server";

/** Extract the client IP from proxy headers (Vercel / Caddy set x-forwarded-for). */
export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Sliding-window rate limit for write endpoints (PRD v2.0 §7.2).
 * Keyed by client IP + route bucket. Returns a 429 response when blocked,
 * or null when the request may proceed.
 */
export function checkWriteRateLimit(
  req: NextRequest,
  bucket: string,
  maxRequests = 60,
  windowMs = 60 * 1000
): NextResponse | null {
  const { blocked, retryAfterMs } = rateLimit(`${bucket}:${clientIp(req)}`, {
    maxRequests,
    windowMs,
  });
  if (!blocked) return null;
  const retryAfterSec = Math.ceil(retryAfterMs / 1000);
  return NextResponse.json(
    { error: `Too many requests. Try again in ${retryAfterSec}s.` },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
  );
}
