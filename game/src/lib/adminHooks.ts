'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ---------------------------------------------------------------------------
// useAdminAuth — handles sessionStorage token check + 401 redirect
// ---------------------------------------------------------------------------

/**
 * Returns the admin token from sessionStorage, redirecting to /admin if absent.
 * Provides `clearAuth()` for 401 responses and `getToken()` for mutations.
 */
export function useAdminAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('adminToken');
    if (!stored) {
      router.push('/admin');
      return;
    }
    setToken(stored);
  }, [router]);

  const clearAuth = useCallback(() => {
    sessionStorage.removeItem('adminToken');
    router.push('/admin');
  }, [router]);

  /** Get the current token (for mutations). Returns null if not authed. */
  const getToken = useCallback(() => sessionStorage.getItem('adminToken'), []);

  return { token, clearAuth, getToken };
}

// ---------------------------------------------------------------------------
// useAdminFetch — fetches data with auth, loading, error, 401 handling
// ---------------------------------------------------------------------------

interface UseAdminFetchOptions {
  /** Polling interval in ms. Set to 0 to disable. */
  pollInterval?: number;
}

interface UseAdminFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

/**
 * Authenticated fetch hook for admin pages.
 * Handles auth, loading, error, 401 redirect, and optional polling.
 *
 * @example
 * const { data, isLoading, error } = useAdminFetch<StatsData>('/api/admin/stats');
 */
export function useAdminFetch<T>(url: string, options: UseAdminFetchOptions = {}): UseAdminFetchResult<T> {
  const { token, clearAuth } = useAdminAuth();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (authToken: string) => {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!mountedRef.current) return;
      if (res.status === 401) { clearAuth(); return; }
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setError('');
      } else {
        setError(json.error?.message || 'Erreur de chargement');
      }
    } catch {
      if (mountedRef.current) setError('Erreur de connexion');
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [url, clearAuth]);

  // Initial fetch when token is available
  useEffect(() => {
    if (token) fetchData(token);
  }, [token, fetchData]);

  // Optional polling
  useEffect(() => {
    if (!token || !options.pollInterval) return;
    const interval = setInterval(() => fetchData(token), options.pollInterval);
    return () => clearInterval(interval);
  }, [token, options.pollInterval, fetchData]);

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const refetch = useCallback(() => {
    if (token) fetchData(token);
  }, [token, fetchData]);

  return { data, isLoading, error, refetch };
}

// ---------------------------------------------------------------------------
// adminMutate — helper for authenticated POST/PATCH/DELETE
// ---------------------------------------------------------------------------

interface MutateOptions {
  method?: string;
  body?: unknown;
}

interface MutateResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

/**
 * Execute an authenticated mutation (POST, PATCH, DELETE) against an admin API.
 * Returns the parsed response with success/error info.
 *
 * @example
 * const result = await adminMutate('/api/admin/elements', { method: 'POST', body: { texte: 'test' } });
 */
export async function adminMutate<T = unknown>(
  url: string,
  options: MutateOptions = {},
): Promise<MutateResult<T>> {
  const token = sessionStorage.getItem('adminToken');
  if (!token) return { success: false, error: 'Not authenticated', status: 0 };

  try {
    const res = await fetch(url, {
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      ...(options.body !== undefined && { body: JSON.stringify(options.body) }),
    });

    if (res.status === 401) {
      sessionStorage.removeItem('adminToken');
      return { success: false, error: 'Session expirée', status: 401 };
    }

    const json = await res.json();
    return {
      success: json.success ?? false,
      data: json.data,
      error: json.error?.message,
      status: res.status,
    };
  } catch {
    return { success: false, error: 'Erreur de connexion', status: 0 };
  }
}
