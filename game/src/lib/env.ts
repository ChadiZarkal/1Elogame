/**
 * @module env
 * @description Runtime validation of critical environment variables.
 *
 * Provides a `validateEnv()` function that should be called at server
 * startup / first request — NOT at import time (to avoid blocking the
 * Next.js build which also evaluates server modules).
 *
 * In production, missing critical vars cause a thrown error.
 * In development, a warning is logged.
 */

// ─── CRITICAL: These must NEVER be missing in production ───

const isProduction = process.env.NODE_ENV === 'production';
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

let validated = false;

/**
 * Validate that all critical env vars are present.
 * Safe to call multiple times — only runs once.
 */
export function validateEnv(): void {
  if (validated || isBuild) return;
  validated = true;

  const errors: string[] = [];

  if (!process.env.ADMIN_TOKEN_SECRET) {
    errors.push(
      'ADMIN_TOKEN_SECRET is not set. Admin tokens would use a fallback key — this is a critical security vulnerability.',
    );
  }

  if (!process.env.ADMIN_PASSWORD_HASH) {
    errors.push(
      'ADMIN_PASSWORD_HASH is not set. Admin login will not work in production.',
    );
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push(
      'NEXT_PUBLIC_SUPABASE_URL is not set. The app may run in mock mode with an insecure admin login.',
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Database operations will fail.',
    );
  }

  if (errors.length > 0) {
    const msg = [
      '',
      '╔══════════════════════════════════════════════════════════╗',
      '║  ⚠️  CRITICAL ENVIRONMENT VARIABLES MISSING             ║',
      '╚══════════════════════════════════════════════════════════╝',
      '',
      ...errors.map((e, i) => `  ${i + 1}. ${e}`),
      '',
      '  Set these variables in your Vercel dashboard or .env.local',
      '',
    ].join('\n');

    if (isProduction) {
      throw new Error(msg);
    }
    console.warn(msg);
  }
}

// ─── Typed exports (convenience) ───

/** Whether the app is running in mock/dev mode (no Supabase). */
export const IS_MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

/** The admin token signing secret. */
export const ADMIN_TOKEN_SECRET =
  process.env.ADMIN_TOKEN_SECRET ||
  process.env.ADMIN_PASSWORD_HASH ||
  'dev-admin-secret-k3y-do-not-use-in-prod';

/** The bcrypt hash of the admin password. */
export const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

/** Supabase URL. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/** Supabase service role key (server-only). */
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
