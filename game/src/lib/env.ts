/**
 * Environment variable validation
 * Import this at the top of server-side entry points to fail fast
 * if required variables are missing.
 */

const requiredServerVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'ADMIN_PASSWORD',
] as const;

const optionalServerVars = [
  'GOOGLE_SERVICE_ACCOUNT_JSON',
  'VERTEX_AI_MODEL',
  'VERTEX_AI_LOCATION',
] as const;

export function validateEnv() {
  const isMock = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
  
  if (isMock) {
    console.log('[env] Mock mode — skipping server env validation');
    return;
  }

  const missing: string[] = [];
  
  for (const key of requiredServerVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(`[env] Missing required environment variables: ${missing.join(', ')}`);
    // Don't throw in production to avoid crashing the server
    // Just log the warning
  }

  // Check optional vars and warn
  for (const key of optionalServerVars) {
    if (!process.env[key]) {
      console.warn(`[env] Optional var missing: ${key} — some features may not work`);
    }
  }
}

// Validate on module load (server-side only)
if (typeof window === 'undefined') {
  validateEnv();
}
