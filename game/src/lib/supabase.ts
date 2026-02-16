import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

/**
 * Supabase client configuration.
 * 
 * Uses NEXT_PUBLIC_* env vars for client-side access.
 * Falls back to empty strings to avoid throwing at module load time;
 * actual validation happens when the client is first used.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Client-side Supabase client (singleton)
let clientInstance: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Get the Supabase client for client-side use.
 * Uses the anon key for public operations.
 */
export function getSupabaseClient() {
  if (!clientInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }
    clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });
  }
  return clientInstance;
}

/**
 * Create a fresh Supabase client (for server-side use in API routes).
 * Uses the service role key for privileged operations.
 */
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  
  // Use service role key if available (for admin operations), otherwise use anon key
  const key = serviceRoleKey || supabaseAnonKey;
  
  if (!key) {
    throw new Error('Missing Supabase key (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  }
  
  return createClient<Database>(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
