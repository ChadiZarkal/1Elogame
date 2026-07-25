import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

/**
 * Dedicated Supabase client for the "C'est un 10 mais..." game.
 *
 * This game lives on its OWN Supabase project, separate from the main
 * project used by every other game (Red Flag Duel, Flag or Not, etc.).
 * Do not merge this with @/lib/supabase — that client's env vars must
 * stay untouched or the rest of the app breaks.
 */
const supabaseDixmaisUrl = process.env.NEXT_PUBLIC_SUPABASE_DIXMAIS_URL ?? '';
const supabaseDixmaisAnonKey = process.env.NEXT_PUBLIC_SUPABASE_DIXMAIS_ANON_KEY ?? '';

/**
 * Create a fresh Supabase client for the dixmais project (server-side use).
 * Uses the service role key for privileged operations.
 */
export function createDixmaisServerClient() {
  const serviceRoleKey = process.env.SUPABASE_DIXMAIS_SERVICE_ROLE_KEY;

  if (!supabaseDixmaisUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_DIXMAIS_URL');
  }

  const key = serviceRoleKey || supabaseDixmaisAnonKey;

  if (!key) {
    throw new Error('Missing Supabase key (SUPABASE_DIXMAIS_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_DIXMAIS_ANON_KEY)');
  }

  return createClient<Database>(supabaseDixmaisUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
