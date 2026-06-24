/**
 * @file supabaseHelpers.test.ts
 * @description Tests unitaires pour les helpers Supabase typés.
 */

import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { typedInsert, typedUpdate } from '@/lib/supabase';

// Create a minimal mock SupabaseClient
function createMockClient() {
  const mockChain = {
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: {}, error: null }),
  };

  const mockFrom = vi.fn().mockReturnValue({
    insert: vi.fn().mockReturnValue(mockChain),
    update: vi.fn().mockReturnValue(mockChain),
  });

  return {
    from: mockFrom,
    _mockFrom: mockFrom,
    _mockChain: mockChain,
  };
}

function asSupabaseClient(client: ReturnType<typeof createMockClient>): SupabaseClient {
  return client as unknown as SupabaseClient;
}

describe('typedInsert', () => {
  it('appelle from(table).insert(data)', () => {
    const client = createMockClient();
    typedInsert(asSupabaseClient(client), 'elements', { texte: 'test', elo_global: 1000 });
    
    expect(client._mockFrom).toHaveBeenCalledWith('elements');
    const fromReturn = client._mockFrom.mock.results[0].value;
    expect(fromReturn.insert).toHaveBeenCalledWith(
      expect.objectContaining({ texte: 'test', elo_global: 1000 })
    );
  });
});

describe('typedUpdate', () => {
  it('appelle from(table).update(data)', () => {
    const client = createMockClient();
    typedUpdate(asSupabaseClient(client), 'elements', { elo_global: 1200 });
    
    expect(client._mockFrom).toHaveBeenCalledWith('elements');
    const fromReturn = client._mockFrom.mock.results[0].value;
    expect(fromReturn.update).toHaveBeenCalledWith(
      expect.objectContaining({ elo_global: 1200 })
    );
  });
});
