/**
 * @module apiHelpers
 * Shared helpers for API route handlers — eliminates duplicated patterns
 * across all 14 routes (error handling, validation, response formatting).
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ZodSchema, ZodError } from 'zod';
import { createApiError, createApiSuccess } from './utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Standard API handler signature. */
type ApiHandler = (req: NextRequest, ctx?: Record<string, unknown>) => Promise<NextResponse>;

/** Options for the API handler wrapper. */
interface ApiHandlerOptions {
  /** Add rate limiting to this route. Specify the config key. */
  rateLimit?: boolean | 'public' | 'auth' | 'ai';
  /** Require admin authentication. */
  requireAdmin?: boolean;
}

// ---------------------------------------------------------------------------
// Mock mode check (single source of truth)
// ---------------------------------------------------------------------------

/** Returns true when running in mock/dev mode (no Supabase). */
export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
}

// ---------------------------------------------------------------------------
// Zod validation helper
// ---------------------------------------------------------------------------

/**
 * Validate a request body against a Zod schema.
 * Returns { data } on success or { error: NextResponse } on failure.
 */
export function validateBody<T>(body: unknown, schema: ZodSchema<T>):
  | { data: T; error?: never }
  | { data?: never; error: NextResponse } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { data: result.data };
  }
  const details = result.error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
  return {
    error: NextResponse.json(
      createApiError('VALIDATION_ERROR', 'Données invalides', details),
      { status: 400 },
    ),
  };
}

// ---------------------------------------------------------------------------
// Response helpers (shorthand)
// ---------------------------------------------------------------------------

/** Send a JSON success response. */
export function apiSuccess<T>(data: T, meta?: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(createApiSuccess(data, meta), { status });
}

/** Send a JSON error response. */
export function apiError(code: string, message: string, status = 500): NextResponse {
  return NextResponse.json(createApiError(code, message), { status });
}

// ---------------------------------------------------------------------------
// Wrapper: handles try/catch + optional rate-limit + optional admin auth
// ---------------------------------------------------------------------------

/**
 * Wraps an API handler with standardized error handling.
 *
 * - Catches all thrown errors and returns a consistent 500 response.
 * - Optionally checks rate limit (pass `{ rateLimit: true }`).
 * - Optionally requires admin auth (pass `{ requireAdmin: true }`).
 *
 * @example
 * export const GET = withApiHandler(async (req) => {
 *   const data = await getData();
 *   return apiSuccess(data);
 * });
 *
 * export const POST = withApiHandler(async (req) => {
 *   const body = await req.json();
 *   const { data, error } = validateBody(body, mySchema);
 *   if (error) return error;
 *   return apiSuccess(data);
 * }, { rateLimit: true });
 */
export function withApiHandler(handler: ApiHandler, options: ApiHandlerOptions = {}): ApiHandler {
  return async (req: NextRequest, ctx?: Record<string, unknown>) => {
    try {
      // Rate limiting
      if (options.rateLimit) {
        const { checkRateLimit } = await import('./rateLimit');
        const configKey = typeof options.rateLimit === 'string' ? options.rateLimit : 'public';
        const rateLimitResult = checkRateLimit(req, configKey);
        if (rateLimitResult) return rateLimitResult;
      }

      // Admin authentication
      if (options.requireAdmin) {
        const { authenticateAdmin } = await import('./adminAuth');
        const authError = authenticateAdmin(req);
        if (authError) return authError;
      }

      return await handler(req, ctx);
    } catch (error) {
      console.error(`[API Error] ${req.method} ${req.nextUrl.pathname}:`, error);
      return apiError('INTERNAL_ERROR', 'Une erreur interne est survenue');
    }
  };
}
