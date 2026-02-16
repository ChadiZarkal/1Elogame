/**
 * @module rateLimit
 * @description In-memory rate limiting for API routes.
 * 
 * Uses a sliding window counter per IP address. Designed for serverless
 * environments where each instance has its own memory (no shared state).
 * For production at scale, replace with Redis-based rate limiting.
 * 
 * Features:
 * - Configurable window size and max requests
 * - Automatic cleanup of stale entries
 * - Per-IP tracking via X-Forwarded-For or fallback
 * - Standard rate limit headers (X-RateLimit-*)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiError } from '@/lib/utils';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  /** Maximum requests per window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

/** Default rate limit configs for different route types */
export const RATE_LIMITS = {
  /** Public API routes (duel, vote, leaderboard) */
  public: { maxRequests: 60, windowMs: 60_000 } as RateLimitConfig,
  /** AI/expensive routes (judge) */
  ai: { maxRequests: 10, windowMs: 60_000 } as RateLimitConfig,
  /** Auth routes (login) */
  auth: { maxRequests: 5, windowMs: 60_000 } as RateLimitConfig,
  /** Admin routes */
  admin: { maxRequests: 30, windowMs: 60_000 } as RateLimitConfig,
} as const;

// In-memory store (per-instance in serverless)
const rateLimitStore = new Map<string, RateLimitEntry>();

/** Cleanup interval for stale entries (every 5 minutes) */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStale(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Extract client IP from request headers.
 */
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

/**
 * Check rate limit for a request. Returns null if allowed,
 * or a 429 NextResponse if rate limited.
 * 
 * Also sets standard rate limit headers on allowed requests
 * (call setRateLimitHeaders on the response).
 * 
 * @example
 * ```ts
 * const rateLimited = checkRateLimit(request, 'public');
 * if (rateLimited) return rateLimited;
 * ```
 */
export function checkRateLimit(
  request: NextRequest,
  configKey: keyof typeof RATE_LIMITS
): NextResponse | null {
  const config = RATE_LIMITS[configKey];
  const ip = getClientIP(request);
  const key = `${configKey}:${ip}`;
  const now = Date.now();

  // Lazy cleanup
  cleanupStale();

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
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

/**
 * Get rate limit info for adding headers to successful responses.
 */
export function getRateLimitHeaders(
  request: NextRequest,
  configKey: keyof typeof RATE_LIMITS
): Record<string, string> {
  const config = RATE_LIMITS[configKey];
  const ip = getClientIP(request);
  const key = `${configKey}:${ip}`;
  const entry = rateLimitStore.get(key);

  if (!entry) {
    return {
      'X-RateLimit-Limit': String(config.maxRequests),
      'X-RateLimit-Remaining': String(config.maxRequests),
    };
  }

  return {
    'X-RateLimit-Limit': String(config.maxRequests),
    'X-RateLimit-Remaining': String(Math.max(0, config.maxRequests - entry.count)),
    'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
  };
}

/**
 * Reset rate limit store (for testing).
 */
export function resetRateLimitStore(): void {
  rateLimitStore.clear();
}
