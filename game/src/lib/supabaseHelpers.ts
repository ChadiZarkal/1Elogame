/**
 * @module supabaseHelpers
 * @description Type-safe helpers for Supabase operations with dynamic field names.
 * 
 * The Supabase typed client is strict about column names. When we compute
 * column names dynamically (e.g., elo_homme, elo_femme based on voter sex),
 * TypeScript can't verify them at compile time. These helpers provide a 
 * single, auditable cast point instead of scattering `as never` throughout
 * the codebase.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Type-safe wrapper for Supabase insert with dynamically-computed fields.
 * Centralizes the single unavoidable cast for dynamic column updates.
 */
export function typedInsert<T extends Record<string, unknown>>(
  client: SupabaseClient,
  table: string,
  data: T
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return client.from(table).insert(data as any);
}

/**
 * Type-safe wrapper for Supabase update with dynamically-computed fields.
 * Centralizes the single unavoidable cast for dynamic column updates.
 */
export function typedUpdate<T extends Record<string, unknown>>(
  client: SupabaseClient,
  table: string,
  data: T
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return client.from(table).update(data as any);
}
