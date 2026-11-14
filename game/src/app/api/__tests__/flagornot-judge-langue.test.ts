/**
 * @file flagornot-judge-langue.test.ts
 * @description POST /api/flagornot/judge — la langue de la page.
 *
 * Depuis `/en/flagornot`, la demande porte `langue: 'en'` : la consigne
 * envoyée à l'IA lui dit d'écrire la justification en anglais, et les repli
 * (juge local, refus, avertissement) parlent anglais. Sans ce champ, la route
 * fait exactement ce qu'elle faisait : consigne française, appel à deux
 * arguments.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn().mockReturnValue(null),
  resetRateLimitStore: vi.fn(),
}));

const { judgeWithGemini, consommerQuota } = vi.hoisted(() => ({
  judgeWithGemini: vi.fn(),
  consommerQuota: vi.fn(),
}));
vi.mock('@/lib/gemini', () => ({ judgeWithGemini }));
vi.mock('@/lib/oracleQuota', () => ({ consommerQuota }));

const mockFetch = vi.fn();

const requete = (body: Record<string, unknown>) =>
  new NextRequest('http://localhost/api/flagornot/judge', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

async function juger(body: Record<string, unknown>) {
  const { POST } = await import('@/app/api/flagornot/judge/route');
  const response = await POST(requete(body));
  return { status: response.status, json: await response.json() };
}

describe('POST /api/flagornot/judge — langue', () => {
  beforeEach(() => {
    vi.resetModules();
    judgeWithGemini.mockReset().mockResolvedValue({ verdict: 'red', justification: 'Yikes.' });
    consommerQuota.mockReset().mockResolvedValue('ia');
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
    vi.stubEnv('NEXT_PUBLIC_MOCK_MODE', 'true');
    vi.stubEnv('OPENAI_API_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('en anglais : la consigne demande une justification en anglais', async () => {
    const { json } = await juger({ text: 'They check your phone', private: true, langue: 'en' });

    expect(json.provider).toBe('gemini');
    expect(judgeWithGemini).toHaveBeenCalledTimes(1);
    const [texte, consigne, langue] = judgeWithGemini.mock.calls[0];
    expect(texte).toBe('They check your phone');
    expect(consigne).toMatch(/RESPONSE LANGUAGE — ENGLISH/);
    expect(consigne).toMatch(/"justification" in English ONLY/);
    // Le personnage reste celui de la consigne française.
    expect(consigne).toMatch(/^Tu es un juge jeune, sarcastique/);
    expect(langue).toBe('en');
  });

  it('en français (sans champ `langue`) : la consigne d’origine, appel inchangé', async () => {
    await juger({ text: 'Il regarde ton téléphone', private: true });

    const appel = judgeWithGemini.mock.calls[0];
    expect(appel).toHaveLength(2);
    expect(appel[1]).not.toMatch(/ENGLISH/);
    expect(appel[1]).toMatch(/Pas révolutionnaire à chaque coin de rue$/);
  });

  it('une langue inconnue retombe sur le français', async () => {
    await juger({ text: 'Hola', private: true, langue: 'es' });
    expect(judgeWithGemini.mock.calls[0]).toHaveLength(2);
  });

  it('en anglais, OpenAI reçoit aussi la consigne anglaise', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key');
    judgeWithGemini.mockRejectedValueOnce(new Error('Gemini down'));
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: '{"verdict":"green","justification":"Love that."}' } }] }),
    });

    const { json } = await juger({ text: 'They cook for you', private: true, langue: 'en' });

    expect(json.provider).toBe('openai');
    const corps = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(corps.messages[0].role).toBe('system');
    expect(corps.messages[0].content).toMatch(/RESPONSE LANGUAGE — ENGLISH/);
  });

  it('en anglais, le juge local répond en anglais', async () => {
    judgeWithGemini.mockRejectedValue(new Error('Gemini down'));

    const rouge = await juger({ text: 'They cheat and lie and ghost me', private: true, langue: 'en' });
    expect(rouge.json.provider).toBe('local');
    expect(rouge.json.verdict).toBe('red');
    expect(rouge.json.justification).not.toMatch(/\b(c'est|tellement|même|panneau|pays)\b/i);

    const vert = await juger({ text: 'They listen, support and encourage me', private: true, langue: 'en' });
    expect(vert.json.verdict).toBe('green');
  });

  it('en anglais, le refus de quota est en anglais', async () => {
    consommerQuota.mockResolvedValueOnce('refuse');
    const { status, json } = await juger({ text: 'Spam', langue: 'en' });
    expect(status).toBe(429);
    expect(json.error.message).toBe('Easy there: the Oracle needs a breather. Try again in a minute.');
  });

  it('en français, le refus de quota reste en français', async () => {
    consommerQuota.mockResolvedValueOnce('refuse');
    const { json } = await juger({ text: 'Spam' });
    expect(json.error.message).toMatch(/souffler/);
  });
});
