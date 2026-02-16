/**
 * @module adminAuth
 * @description Centralized admin authentication utilities.
 * 
 * Provides token generation, validation, and a reusable request authenticator
 * for all admin API routes. Tokens are stored in-memory with TTL expiry.
 * 
 * Security features:
 * - Cryptographically random tokens (crypto.randomUUID)
 * - Time-limited tokens (1 hour TTL)
 * - Automatic cleanup of expired tokens
 * - Max token limit to prevent memory abuse
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiError } from '@/lib/utils';

/** Token TTL in milliseconds (1 hour) */
const TOKEN_TTL_MS = 60 * 60 * 1000;

/** Maximum number of active tokens (prevents memory abuse) */
const MAX_ACTIVE_TOKENS = 100;

/** Cleanup interval for expired tokens (5 minutes) */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

interface TokenEntry {
  token: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory token store (persists via globalThis for Turbopack HMR)
declare global {
  // eslint-disable-next-line no-var
  var __adminTokenStore: Map<string, TokenEntry> | undefined;
  // eslint-disable-next-line no-var
  var __adminTokenCleanupTimer: ReturnType<typeof setInterval> | undefined;
}

function getTokenStore(): Map<string, TokenEntry> {
  if (!globalThis.__adminTokenStore) {
    globalThis.__adminTokenStore = new Map();
  }
  return globalThis.__adminTokenStore;
}

/** Remove all expired tokens from the store. */
function cleanupExpiredTokens(): void {
  const store = getTokenStore();
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.expiresAt) {
      store.delete(key);
    }
  }
}

// Start periodic cleanup (idempotent)
if (typeof globalThis !== 'undefined' && !globalThis.__adminTokenCleanupTimer) {
  globalThis.__adminTokenCleanupTimer = setInterval(cleanupExpiredTokens, CLEANUP_INTERVAL_MS);
  // Don't prevent process from exiting
  if (globalThis.__adminTokenCleanupTimer?.unref) {
    globalThis.__adminTokenCleanupTimer.unref();
  }
}

/**
 * Generate a cryptographically secure admin token and store it.
 * @returns The generated token string and its TTL in seconds.
 */
export function generateAdminToken(): { token: string; expiresIn: number } {
  const store = getTokenStore();

  // Evict oldest tokens if at capacity
  if (store.size >= MAX_ACTIVE_TOKENS) {
    cleanupExpiredTokens();
    // If still at capacity after cleanup, remove oldest
    if (store.size >= MAX_ACTIVE_TOKENS) {
      const oldest = [...store.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt);
      const toRemove = oldest.slice(0, Math.ceil(MAX_ACTIVE_TOKENS / 4));
      toRemove.forEach(([key]) => store.delete(key));
    }
  }

  const now = Date.now();
  const token = `admin_${crypto.randomUUID()}`;
  const entry: TokenEntry = {
    token,
    createdAt: now,
    expiresAt: now + TOKEN_TTL_MS,
  };

  store.set(token, entry);

  return { token, expiresIn: TOKEN_TTL_MS / 1000 };
}

/**
 * Validate an admin token.
 * @param token - The token to validate (without "Bearer " prefix).
 * @returns true if the token is valid and not expired.
 */
export function validateAdminToken(token: string): boolean {
  if (!token || !token.startsWith('admin_')) return false;

  const store = getTokenStore();
  const entry = store.get(token);

  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(token);
    return false;
  }

  return true;
}

/**
 * Revoke an admin token (e.g., on logout).
 */
export function revokeAdminToken(token: string): void {
  getTokenStore().delete(token);
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
 * Authenticate an admin request. Returns null if authenticated,
 * or a NextResponse error if not.
 * 
 * Usage in route handlers:
 * ```ts
 * const authError = authenticateAdmin(request);
 * if (authError) return authError;
 * // ... proceed with handler
 * ```
 */
export function authenticateAdmin(request: NextRequest): NextResponse | null {
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

  const token = extractBearerToken(request);

  if (!token) {
    return NextResponse.json(
      createApiError('UNAUTHORIZED', 'Token d\'authentification requis'),
      { status: 401 }
    );
  }

  // In mock mode, accept mock tokens AND real generated tokens
  if (isMockMode) {
    if (token === 'mock-admin-token' || validateAdminToken(token)) {
      return null; // Authenticated
    }
  } else {
    if (validateAdminToken(token)) {
      return null; // Authenticated
    }
  }

  return NextResponse.json(
    createApiError('UNAUTHORIZED', 'Token invalide ou expiré'),
    { status: 401 }
  );
}
