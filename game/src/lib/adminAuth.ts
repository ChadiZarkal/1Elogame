/**
 * @module adminAuth
 * @description Centralized admin authentication utilities.
 *
 * Uses **HMAC-signed stateless tokens** so that validity survives server
 * restarts, HMR reloads, and multi-process deployments.
 *
 * Token format: `<expiresAtMs>.<hmacHex>`
 * - The server signs `expiresAt` with a secret; validation only checks the
 *   signature + expiry → nothing is stored in memory.
 *
 * Security:
 * - HMAC-SHA256 signature (crypto built-in)
 * - 4-hour TTL (configurable)
 * - Constant-time comparison via `timingSafeEqual`
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { createApiError } from '@/lib/utils';

/** Token TTL in milliseconds (4 hours — generous to avoid accidental logouts) */
const TOKEN_TTL_MS = 4 * 60 * 60 * 1000;

/**
 * Signing secret — falls back to a deterministic dev key so tokens survive
 * HMR restarts in development.  In production set ADMIN_TOKEN_SECRET.
 */
const SECRET =
  process.env.ADMIN_TOKEN_SECRET ||
  process.env.ADMIN_PASSWORD_HASH ||
  'dev-admin-secret-k3y-do-not-use-in-prod';

/* ────────────────────────── helpers ────────────────────────── */

function hmac(data: string): string {
  return createHmac('sha256', SECRET).update(data).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

/* ───────────────────── public API (unchanged signatures) ───── */

/**
 * Generate a signed admin token.
 * Nothing is stored in memory — the token is self-validating.
 */
export function generateAdminToken(): { token: string; expiresIn: number } {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const sig = hmac(String(expiresAt));
  return {
    token: `${expiresAt}.${sig}`,
    expiresIn: TOKEN_TTL_MS / 1000,
  };
}

/**
 * Validate a signed admin token (stateless).
 */
export function validateAdminToken(token: string): boolean {
  if (!token) return false;

  const dotIdx = token.indexOf('.');
  if (dotIdx === -1) return false;

  const expiresStr = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);

  // Check expiry
  const expiresAt = Number(expiresStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  // Verify HMAC
  const expectedSig = hmac(expiresStr);
  return safeEqual(sig, expectedSig);
}

/**
 * Revoke is a no-op for stateless tokens.
 * (Client should simply delete the token from storage.)
 */
export function revokeAdminToken(_token: string): void {
  /* no-op — stateless */
}

/**
 * Extract bearer token from Authorization header.
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
}

/**
 * Authenticate an admin request.  Returns `null` if OK, or a 401 response.
 */
export function authenticateAdmin(request: NextRequest): NextResponse | null {
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
  const token = extractBearerToken(request);

  if (!token) {
    return NextResponse.json(
      createApiError('UNAUTHORIZED', 'Token d\'authentification requis'),
      { status: 401 },
    );
  }

  // In mock mode, also accept the static mock token
  if (isMockMode && token === 'mock-admin-token') {
    return null;
  }

  if (validateAdminToken(token)) {
    return null;
  }

  return NextResponse.json(
    createApiError('UNAUTHORIZED', 'Token invalide ou expiré'),
    { status: 401 },
  );
}
