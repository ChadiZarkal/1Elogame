import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_FLAGORNOT_TEXT_LENGTH } from '@/config/constants';

const { typedInsertMock, createServerClientMock } = vi.hoisted(() => ({
  typedInsertMock: vi.fn(),
  createServerClientMock: vi.fn(() => ({})),
}));

vi.mock('@/lib/supabase', () => ({
  createServerClient: createServerClientMock,
  typedInsert: typedInsertMock,
}));

describe('repositories/community.saveSubmission', () => {
  beforeEach(() => {
    vi.resetModules();
    typedInsertMock.mockReset();
    createServerClientMock.mockClear();
    process.env.NEXT_PUBLIC_MOCK_MODE = 'false';
  });

  it('falls back to base payload when optional columns are missing', async () => {
    typedInsertMock.mockImplementation(async (_client: unknown, _table: string, payload: Record<string, unknown>) => {
      const hasOptionalColumns = ['justification', 'justification_ai', 'justification_ia', 'justif', 'gender', 'genre', 'sexe']
        .some((column) => column in payload);

      if (hasOptionalColumns) {
        return {
          error: {
            message: "Could not find the 'justification' column of 'flagornot_submissions' in the schema cache",
          },
        };
      }

      return { error: null };
    });

    const { saveSubmission } = await import('@/lib/repositories/community');

    await expect(
      saveSubmission('x'.repeat(MAX_FLAGORNOT_TEXT_LENGTH), 'red', 'Justification tres longue '.repeat(18), 'homme')
    ).resolves.toMatchObject({
      verdict: 'red',
    });

    const basePayloadWasAttempted = typedInsertMock.mock.calls.some(([, , payload]) => {
      if (!payload || typeof payload !== 'object') return false;
      const record = payload as Record<string, unknown>;
      const text = typeof record.text === 'string' ? record.text : '';
      return (
        !('justification' in record)
        && !('justification_ai' in record)
        && !('justification_ia' in record)
        && !('justif' in record)
        && !('gender' in record)
        && !('genre' in record)
        && !('sexe' in record)
        && !text.includes('<<<ORACLE_META>>>')
      );
    });

    expect(basePayloadWasAttempted).toBe(true);
  });
});
