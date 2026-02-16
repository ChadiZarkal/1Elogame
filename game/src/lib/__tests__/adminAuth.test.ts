/**
 * @file adminAuth.test.ts
 * @description Tests unitaires pour le système d'authentification admin centralisé.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateAdminToken,
  validateAdminToken,
  revokeAdminToken,
} from '@/lib/adminAuth';

beforeEach(() => {
  // Clear the global token store between tests
  if (globalThis.__adminTokenStore) {
    globalThis.__adminTokenStore.clear();
  }
});

describe('generateAdminToken', () => {
  it('génère un token avec le préfixe admin_', () => {
    const { token } = generateAdminToken();
    expect(token).toMatch(/^admin_/);
  });

  it('génère des tokens uniques', () => {
    const { token: token1 } = generateAdminToken();
    const { token: token2 } = generateAdminToken();
    expect(token1).not.toBe(token2);
  });

  it('retourne un expiresIn en secondes (1h)', () => {
    const { expiresIn } = generateAdminToken();
    expect(expiresIn).toBe(3600);
  });

  it('stocke le token dans le store', () => {
    const { token } = generateAdminToken();
    expect(validateAdminToken(token)).toBe(true);
  });

  it('gère la limite de tokens actifs', () => {
    // Generate many tokens
    const tokens: string[] = [];
    for (let i = 0; i < 110; i++) {
      tokens.push(generateAdminToken().token);
    }
    // The most recent tokens should still be valid
    const lastToken = tokens[tokens.length - 1];
    expect(validateAdminToken(lastToken)).toBe(true);
  });
});

describe('validateAdminToken', () => {
  it('valide un token fraîchement généré', () => {
    const { token } = generateAdminToken();
    expect(validateAdminToken(token)).toBe(true);
  });

  it('rejette un token vide', () => {
    expect(validateAdminToken('')).toBe(false);
  });

  it('rejette un token sans le préfixe admin_', () => {
    expect(validateAdminToken('fake_token_123')).toBe(false);
  });

  it('rejette un token admin_ inexistant dans le store', () => {
    expect(validateAdminToken('admin_fake_nonexistent')).toBe(false);
  });

  it('rejette un token révoqué', () => {
    const { token } = generateAdminToken();
    revokeAdminToken(token);
    expect(validateAdminToken(token)).toBe(false);
  });
});

describe('revokeAdminToken', () => {
  it('révoque un token existant', () => {
    const { token } = generateAdminToken();
    expect(validateAdminToken(token)).toBe(true);
    revokeAdminToken(token);
    expect(validateAdminToken(token)).toBe(false);
  });

  it('ne crashe pas en révoquant un token inexistant', () => {
    expect(() => revokeAdminToken('admin_nonexistent')).not.toThrow();
  });
});
