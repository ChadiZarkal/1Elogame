/**
 * @file rateLimit.test.ts
 * @description Tests unitaires pour le système de rate limiting.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  checkRateLimit,
  getRateLimitHeaders,
  resetRateLimitStore,
  RATE_LIMITS,
} from '@/lib/rateLimit';

function createMockRequest(ip = '127.0.0.1'): NextRequest {
  const req = new NextRequest('http://localhost/api/test', {
    headers: {
      'x-forwarded-for': ip,
    },
  });
  return req;
}

beforeEach(() => {
  resetRateLimitStore();
});

describe('checkRateLimit', () => {
  it('autorise les requêtes sous la limite', () => {
    const req = createMockRequest();
    const result = checkRateLimit(req, 'public');
    expect(result).toBeNull();
  });

  it('autorise exactement le nombre max de requêtes', () => {
    const req = createMockRequest();
    for (let i = 0; i < RATE_LIMITS.public.maxRequests; i++) {
      const result = checkRateLimit(req, 'public');
      expect(result).toBeNull();
    }
  });

  it('bloque au-delà de la limite', () => {
    const req = createMockRequest();
    // Exhaust the limit
    for (let i = 0; i < RATE_LIMITS.public.maxRequests; i++) {
      checkRateLimit(req, 'public');
    }
    // This should be blocked
    const result = checkRateLimit(req, 'public');
    expect(result).not.toBeNull();
    expect(result!.status).toBe(429);
  });

  it('retourne les headers Retry-After quand limité', async () => {
    const req = createMockRequest();
    for (let i = 0; i < RATE_LIMITS.auth.maxRequests; i++) {
      checkRateLimit(req, 'auth');
    }
    const result = checkRateLimit(req, 'auth');
    expect(result).not.toBeNull();
    expect(result!.headers.get('Retry-After')).toBeTruthy();
    expect(result!.headers.get('X-RateLimit-Remaining')).toBe('0');
  });

  it('isole les IPs différentes', () => {
    const req1 = createMockRequest('1.2.3.4');
    const req2 = createMockRequest('5.6.7.8');

    // Exhaust limit for IP 1
    for (let i = 0; i < RATE_LIMITS.auth.maxRequests; i++) {
      checkRateLimit(req1, 'auth');
    }
    const blocked = checkRateLimit(req1, 'auth');
    expect(blocked).not.toBeNull();

    // IP 2 should still be allowed
    const allowed = checkRateLimit(req2, 'auth');
    expect(allowed).toBeNull();
  });

  it('isole les config keys différentes', () => {
    const req = createMockRequest();

    // Exhaust auth limit (5/min)
    for (let i = 0; i < RATE_LIMITS.auth.maxRequests; i++) {
      checkRateLimit(req, 'auth');
    }
    const blocked = checkRateLimit(req, 'auth');
    expect(blocked).not.toBeNull();

    // Public limit (60/min) should still be available
    const allowed = checkRateLimit(req, 'public');
    expect(allowed).toBeNull();
  });
});

describe('getRateLimitHeaders', () => {
  it('retourne les headers pour un client sans historique', () => {
    const req = createMockRequest();
    const headers = getRateLimitHeaders(req, 'public');
    expect(headers['X-RateLimit-Limit']).toBe(String(RATE_LIMITS.public.maxRequests));
    expect(headers['X-RateLimit-Remaining']).toBe(String(RATE_LIMITS.public.maxRequests));
  });

  it('décompte les requêtes restantes', () => {
    const req = createMockRequest();
    checkRateLimit(req, 'public');
    checkRateLimit(req, 'public');
    const headers = getRateLimitHeaders(req, 'public');
    expect(headers['X-RateLimit-Remaining']).toBe(
      String(RATE_LIMITS.public.maxRequests - 2)
    );
  });
});

describe('resetRateLimitStore', () => {
  it('réinitialise le compteur', () => {
    const req = createMockRequest();
    // Exhaust auth limit
    for (let i = 0; i < RATE_LIMITS.auth.maxRequests; i++) {
      checkRateLimit(req, 'auth');
    }
    expect(checkRateLimit(req, 'auth')).not.toBeNull();

    resetRateLimitStore();
    expect(checkRateLimit(req, 'auth')).toBeNull();
  });
});
