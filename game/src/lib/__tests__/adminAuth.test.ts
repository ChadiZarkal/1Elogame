/**
 * @file adminAuth.test.ts
 * @description Unit tests for the HMAC-based stateless admin auth system.
 */

import { describe, it, expect } from 'vitest';
import {
  generateAdminToken,
  validateAdminToken,
  revokeAdminToken,
} from '@/lib/adminAuth';

describe('generateAdminToken', () => {
  it('generates a token in <expiresAt>.<hmac> format', () => {
    const { token } = generateAdminToken();
    expect(token).toContain('.');
    const [expiresStr, sig] = token.split('.');
    expect(Number(expiresStr)).toBeGreaterThan(Date.now());
    expect(sig.length).toBeGreaterThan(0);
  });

  it('generates unique tokens across time ticks', async () => {
    const { token: t1 } = generateAdminToken();
    // Ensure at least 1ms passes so Date.now() differs
    await new Promise(r => setTimeout(r, 2));
    const { token: t2 } = generateAdminToken();
    expect(t1).not.toBe(t2);
  });

  it('returns expiresIn in seconds (4h)', () => {
    const { expiresIn } = generateAdminToken();
    expect(expiresIn).toBe(4 * 3600);
  });

  it('produces a valid token', () => {
    const { token } = generateAdminToken();
    expect(validateAdminToken(token)).toBe(true);
  });
});

describe('validateAdminToken', () => {
  it('validates a freshly generated token', () => {
    const { token } = generateAdminToken();
    expect(validateAdminToken(token)).toBe(true);
  });

  it('rejects an empty token', () => {
    expect(validateAdminToken('')).toBe(false);
  });

  it('rejects a token without a dot separator', () => {
    expect(validateAdminToken('noseparator')).toBe(false);
  });

  it('rejects a token with invalid HMAC', () => {
    const { token } = generateAdminToken();
    const [expiresStr] = token.split('.');
    expect(validateAdminToken(`${expiresStr}.fakesig`)).toBe(false);
  });

  it('rejects an expired token', () => {
    const pastExpiry = Date.now() - 1000;
    const fakeToken = `${pastExpiry}.anysig`;
    expect(validateAdminToken(fakeToken)).toBe(false);
  });
});

describe('revokeAdminToken', () => {
  it('is a no-op and does not throw', () => {
    const { token } = generateAdminToken();
    expect(() => revokeAdminToken(token)).not.toThrow();
  });

  it('token remains valid after revoke (stateless design)', () => {
    const { token } = generateAdminToken();
    revokeAdminToken(token);
    expect(validateAdminToken(token)).toBe(true);
  });
});
