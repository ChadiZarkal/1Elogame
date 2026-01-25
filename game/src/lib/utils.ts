/**
 * Utility functions for the Red or Green Game
 */

import { clsx, type ClassValue } from 'clsx';

/**
 * Simple class name merger (alternative to clsx if needed).
 */
export function cn(...classes: ClassValue[]): string {
  return clsx(classes);
}

/**
 * Format a number with thousands separators.
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}

/**
 * Format a percentage for display.
 */
export function formatPercentage(value: number): string {
  return `${value}%`;
}

/**
 * Generate a random delay within a range (for staggered animations).
 */
export function randomDelay(min: number = 0, max: number = 200): number {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Sleep for a specified duration (useful for animations).
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Create an API error response object.
 */
export function createApiError(code: string, message: string, details?: Array<{ field: string; message: string }>) {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

/**
 * Create an API success response object.
 */
export function createApiSuccess<T>(data: T, meta?: Record<string, unknown>) {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

/**
 * Validate that required environment variables are set.
 */
export function validateEnvVars(vars: string[]): void {
  const missing = vars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Safe JSON parse with fallback.
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
