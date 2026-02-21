import { describe, it, expect } from 'vitest';
import {
  cn,
  formatNumber,
  createApiError,
  createApiSuccess,
  getPairKey,
} from '@/lib/utils';

describe('cn (className merger)', () => {
  it('fusionne des classes simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('gère les conditions', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('gère les undefined', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
  });
});

describe('formatNumber', () => {
  it('formate un entier en locale FR', () => {
    const result = formatNumber(1234);
    // FR locale uses non-breaking space or period as separator
    expect(result).toMatch(/1[\s.]?234/);
  });

  it('gère 0', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('gère les négatifs', () => {
    const result = formatNumber(-500);
    expect(result).toContain('500');
  });
});

describe('createApiError', () => {
  it('crée une réponse erreur structurée', () => {
    const error = createApiError('INVALID_INPUT', 'Champ requis');
    expect(error.success).toBe(false);
    expect(error.error?.code).toBe('INVALID_INPUT');
    expect(error.error?.message).toBe('Champ requis');
  });
});

describe('createApiSuccess', () => {
  it('crée une réponse succès avec données', () => {
    const success = createApiSuccess({ id: '1' });
    expect(success.success).toBe(true);
    expect(success.data).toEqual({ id: '1' });
  });

  it('gère les données null', () => {
    const success = createApiSuccess(null);
    expect(success.success).toBe(true);
    expect(success.data).toBeNull();
  });
});

describe('getPairKey', () => {
  it('trie les IDs alphabétiquement', () => {
    expect(getPairKey('b', 'a')).toBe('a-b');
    expect(getPairKey('a', 'b')).toBe('a-b');
  });
});
