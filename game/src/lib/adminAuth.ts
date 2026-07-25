/**
 * @module adminAuth
 * Auth currently disabled — open admin access.
 */

import { NextRequest, NextResponse } from 'next/server';

const FALLBACK_SECRET = 'dev-admin-secret-k3y-do-not-use-in-prod';

function getSecret(): string {
  return process.env.ADMIN_TOKEN_SECRET
    ?? process.env.ADMIN_PASSWORD_HASH
    ?? FALLBACK_SECRET;
}

export function generateAdminToken(): { token: string; expiresIn: number } {
  const TTL = 4 * 60 * 60 * 1000;
  // Return a dummy token — auth is bypassed
  return { token: 'open', expiresIn: TTL / 1000 };
}

export function validateAdminToken(_token: string): boolean {
  return true; // Auth bypassed
}

export function revokeAdminToken(_token: string): void {}

export function extractBearerToken(request: NextRequest): string | null {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.substring(7);
}

/** Auth disabled — always allows the request. */
export function authenticateAdmin(_request: NextRequest): NextResponse | null {
  return null;
}

// Keep export for compatibility
export { getSecret };

