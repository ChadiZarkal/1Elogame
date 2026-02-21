/** Sanitize user input: strip XSS vectors, preserve French chars and emojis. */
export function sanitizeText(input: string, maxLength = 500): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .replace(/<[^>]*>/g, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/\bon\w+\s*=/gi, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}
