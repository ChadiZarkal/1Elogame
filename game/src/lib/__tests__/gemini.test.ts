/**
 * @file gemini.test.ts
 * @description Tests unitaires pour le module Gemini (@google/genai).
 * Couvre: judgeWithGemini, credential loading, error handling.
 * Note: On mock les appels externes. Le vrai appel API sera testé en e2e.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fs before importing gemini
vi.mock(import('fs'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      ...actual,
      readFileSync: vi.fn(),
      existsSync: vi.fn().mockReturnValue(false),
      readdirSync: vi.fn().mockReturnValue([]),
      writeFileSync: vi.fn(),
      unlinkSync: vi.fn(),
    },
    readFileSync: vi.fn(),
    existsSync: vi.fn().mockReturnValue(false),
    readdirSync: vi.fn().mockReturnValue([]),
    writeFileSync: vi.fn(),
    unlinkSync: vi.fn(),
  };
});

vi.mock(import('os'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: { ...actual, tmpdir: () => '/tmp' },
    tmpdir: () => '/tmp',
  };
});

// Mock @google/genai with a stable generateContent ref
const { mockGenerateContent } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
}));

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class MockGoogleGenAI {
      models = { generateContent: mockGenerateContent };
    },
  };
});

// Set credentials BEFORE import so module-level code can find them
process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify({
  type: 'service_account',
  project_id: 'test-project',
  private_key_id: 'key-id',
  private_key: '-----BEGIN RSA PRIVATE KEY-----\ntest\n-----END RSA PRIVATE KEY-----',
  client_email: 'test@test.iam.gserviceaccount.com',
  client_id: '123',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/test',
});

// Import at top-level (no resetModules needed since we mock at module level)
import { judgeWithGemini } from '@/lib/gemini';

describe('judgeWithGemini', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne un verdict red avec justification', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: '{"verdict":"red","justification":"C\'est toxique."}',
    });

    const result = await judgeWithGemini('Ghoster quelqu\'un', 'Tu es un juge...');
    expect(result.verdict).toBe('red');
    expect(result.justification).toBe('C\'est toxique.');
  });

  it('retourne un verdict green avec justification', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: '{"verdict":"green","justification":"C\'est sain."}',
    });

    const result = await judgeWithGemini('Écouter activement', 'Tu es un juge...');
    expect(result.verdict).toBe('green');
  });

  it('lance une erreur si la réponse est vide', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: null,
    });

    await expect(judgeWithGemini('test', 'prompt')).rejects.toThrow('Gemini API error');
  });

  it('lance une erreur si le verdict est invalide', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: '{"verdict":"yellow","justification":"hmm"}',
    });

    await expect(judgeWithGemini('test', 'prompt')).rejects.toThrow('Gemini API error');
  });

  it('lance une erreur sur JSON malformé', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: 'not json at all',
    });

    await expect(judgeWithGemini('test', 'prompt')).rejects.toThrow('Gemini API error');
  });

  it('fournit une justification par défaut si absente', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: '{"verdict":"red"}',
    });

    const result = await judgeWithGemini('test', 'prompt');
    expect(result.justification).toBe('Pas de justification.');
  });

  it('lance une erreur si l\'API Gemini échoue', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Network error'));

    await expect(judgeWithGemini('test', 'prompt')).rejects.toThrow('Gemini API error');
  });

  it('valide que generateContent est appelé avec le bon modèle et contenu', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: '{"verdict":"green","justification":"ok"}',
    });

    await judgeWithGemini('Ma phrase test', 'Mon prompt');
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.any(String),
        contents: 'Juge cette phrase: "Ma phrase test"',
        config: expect.objectContaining({
          systemInstruction: 'Mon prompt',
        }),
      }),
    );
  });
});
