import { afterEach, describe, expect, it, vi } from 'vitest';

async function donUrl(valeur: string | undefined) {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_DON_URL', valeur as string);
  return (await import('@/config/contact')).DON_URL;
}

describe('DON_URL — l’adresse de la page de don', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('reprend l’adresse réglée sur Vercel', async () => {
    expect(await donUrl('https://ko-fi.com/autre')).toBe('https://ko-fi.com/autre');
    expect(await donUrl('  https://buymeacoffee.com/redorgreen ')).toBe('https://buymeacoffee.com/redorgreen');
  });

  it('mène à la page Ko-fi sans variable', async () => {
    expect(await donUrl(undefined)).toBe('https://ko-fi.com/redorgreen');
    expect(await donUrl('')).toBe('https://ko-fi.com/redorgreen');
  });

  // Une adresse mal saisie sur Vercel ne doit pas casser le bouton.
  it('ignore une adresse invalide ou non https', async () => {
    expect(await donUrl('ko-fi.com/autre')).toBe('https://ko-fi.com/redorgreen');
    expect(await donUrl('http://ko-fi.com/autre')).toBe('https://ko-fi.com/redorgreen');
    expect(await donUrl('javascript:alert(1)')).toBe('https://ko-fi.com/redorgreen');
  });
});
