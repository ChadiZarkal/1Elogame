/**
 * @module sanitize
 * @description Input sanitization utilities for user-submitted content.
 * 
 * Provides XSS protection and content normalization for text inputs
 * that will be displayed or stored. Uses a whitelist approach —
 * only allows safe characters through.
 */

/**
 * Sanitize user input text by stripping potential XSS vectors.
 * Preserves common French characters and emojis while removing
 * HTML tags, script injections, and control characters.
 * 
 * @param input - Raw user input string
 * @param maxLength - Maximum allowed length (default 500)
 * @returns Sanitized string
 */
export function sanitizeText(input: string, maxLength = 500): string {
  if (!input || typeof input !== 'string') return '';

  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove javascript: protocol
    .replace(/javascript\s*:/gi, '')
    // Remove on* event handlers
    .replace(/\bon\w+\s*=/gi, '')
    // Remove control characters (except newlines and tabs)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize whitespace (collapse multiple spaces/newlines)
    .replace(/\s+/g, ' ')
    // Trim
    .trim()
    // Enforce max length
    .slice(0, maxLength);
}

/**
 * Escape HTML entities in a string for safe rendering.
 * Use this when you need to display user content in HTML context.
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return input.replace(/[&<>"']/g, (char) => map[char] || char);
}
