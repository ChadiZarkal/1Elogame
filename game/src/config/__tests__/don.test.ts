import { afterEach, describe, expect, it, vi } from 'vitest';

async function donUrl(valeur: string | undefined) {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_DON_URL', valeur as string);
  return (await import('@/config/contact')).DON_URL;
}

describe('DON_URL — l’adresse de la page de don', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('reprend l’adresse réglée sur Vercel', async () => {
    expect(await donUrl('https://ko-fi.com/redorgreen')).toBe('https://ko-fi.com/redorgreen');
    expect(await donUrl('  https://buymeacoffee.com/redorgreen ')).toBe('https://buymeacoffee.com/redorgreen');
  });

  // Pas de bouton plutôt qu'un bouton qui mène nulle part.
  it('est absente sans variable, ou avec une adresse invalide ou non https', async () => {
    expect(await donUrl(undefined)).toBeNull();
    expect(await donUrl('')).toBeNull();
    expect(await donUrl('ko-fi.com/redorgreen')).toBeNull();
    expect(await donUrl('http://ko-fi.com/redorgreen')).toBeNull();
    expect(await donUrl('javascript:alert(1)')).toBeNull();
  });
});
