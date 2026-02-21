import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a number with French thousands separators. */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}

/** Create an API error response object. */
export function createApiError(code: string, message: string, details?: Array<{ field: string; message: string }>) {
  return { success: false, error: { code, message, details } };
}

/** Create an API success response object. */
export function createApiSuccess<T>(data: T, meta?: Record<string, unknown>) {
  return { success: true, data, ...(meta && { meta }) };
}

/** Generate a consistent pair key for two IDs (sorted alphabetically). */
export function getPairKey(idA: string, idB: string): string {
  return idA < idB ? `${idA}-${idB}` : `${idB}-${idA}`;
}
