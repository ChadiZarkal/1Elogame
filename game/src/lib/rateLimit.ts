/**
 * In-memory rate limiting for API routes.
 * Sliding window counter per IP. For production at scale, replace with Redis.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiError } from '@/lib/utils';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export const RATE_LIMITS = {
  public: { maxRequests: 60, windowMs: 60_000 } as RateLimitConfig,
  ai: { maxRequests: 10, windowMs: 60_000 } as RateLimitConfig,
  auth: { maxRequests: 5, windowMs: 60_000 } as RateLimitConfig,
  admin: { maxRequests: 30, windowMs: 60_000 } as RateLimitConfig,
} as const;

const rateLimitStore = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStale(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) rateLimitStore.delete(key);
  }
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

/** Returns null if allowed, or a 429 response if rate limited. */
export function checkRateLimit(
  request: NextRequest,
  configKey: keyof typeof RATE_LIMITS
): NextResponse | null {
  const config = RATE_LIMITS[configKey];
  const ip = getClientIP(request);
  const key = `${configKey}:${ip}`;
  const now = Date.now();

  cleanupStale();

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return null;
  }

  entry.count++;

  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    const response = NextResponse.json(
      createApiError('RATE_LIMITED', `Trop de requêtes. Réessayez dans ${retryAfter}s.`),
      { status: 429 }
    );
    response.headers.set('Retry-After', String(retryAfter));
    response.headers.set('X-RateLimit-Limit', String(config.maxRequests));
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));
    return response;
  }

  return null;
}

/** Reset rate limit store (for testing). */
export function resetRateLimitStore(): void {
  rateLimitStore.clear();
}
