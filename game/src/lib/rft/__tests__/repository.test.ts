/**
 * @file repository.test.ts
 * @description Le Red Flag Test sous un pic : une rafale de parties ne relit ni
 * le questionnaire ni les agrégats à chaque fois — c'est ce qui a fait tomber
 * la base le 2026-10-23. Et sans la migration 032, l'ancien calcul reprend.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { base, requete, rpc } = vi.hoisted(() => {
  type Reponse = { data?: unknown; error?: { message: string; code?: string } | null };
  // `@/lib/supabase` lit ces variables au chargement : sans elles, il refuse de créer un client.
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://base.factice';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'cle-factice';
  const base = { appels: new Map<string, number>(), sansMigration: false };

  function compter(cle: string) {
    base.appels.set(cle, (base.appels.get(cle) ?? 0) + 1);
  }

  const absente = (code: string): Reponse => ({ data: null, error: { message: 'absente', code } });

  function lecture(table: string): Reponse {
    switch (table) {
      case 'rft_questions':
        return { data: [{ id: 'q1', position: 0, text: 'Il lit tes messages ?', helper_text: null, is_active: true }] };
      case 'rft_answers':
        return {
          data: [
            { id: 'a1', question_id: 'q1', position: 0, text: 'Oui', points: 10, humor_message: 'Aïe.' },
            { id: 'a2', question_id: 'q1', position: 1, text: 'Non', points: 0, humor_message: null },
          ],
        };
      case 'rft_verdicts':
        return { data: [{ id: 'v', min_score: 0, emoji: null, title: 'Verdict', subtitle: null }] };
      case 'rft_answer_counts':
        return base.sansMigration
          ? absente('PGRST205')
          : { data: [
              { answer_id: 'a1', question_id: 'q1', choix: 3, choix_h: 0, choix_f: 3 },
              { answer_id: 'a2', question_id: 'q1', choix: 1, choix_h: 0, choix_f: 1 },
            ] };
      default:
        return { data: [] };
    }
  }

  function requete(table: string) {
    let op = 'select';
    const b = {
      select: () => b,
      order: () => b,
      eq: () => b,
      single: () => b,
      maybeSingle: () => b,
      insert: () => { op = 'insert'; return b; },
      delete: () => { op = 'delete'; return b; },
      then: (ok: (r: Reponse) => unknown, ko?: (e: unknown) => unknown) => {
        compter(`${table}:${op}`);
        const r = op === 'insert'
          ? { data: table === 'rft_runs' ? { id: 'run' } : null, error: null }
          : { error: null, ...lecture(table) };
        return Promise.resolve(r).then(ok, ko);
      },
    };
    return b;
  }

  async function rpc(nom: string): Promise<Reponse> {
    compter(`rpc:${nom}`);
    switch (nom) {
      case 'rft_distribution':
        return base.sansMigration ? absente('PGRST202') : { data: [['femme', '19-22', 10, 4]], error: null };
      case 'rft_cohortes':
        return { data: [{ cohorte: 'tous', effectif: 5, plus_hauts: 0, moyenne: '10' }], error: null };
      case 'rft_parts_reponses':
        return { data: [{ answer_id: 'a1', choix: 4, total_question: 5 }], error: null };
      default:
        return { data: [], error: null };
    }
  }
  return { base, requete, rpc };
});

// Le faux client est posé sous `@supabase/supabase-js`, et non sous `@/lib/supabase` :
// le dépôt importe ce dernier à la demande, ses lectures partent en parallèle, et
// vitest ne sert le faux qu'au premier de plusieurs imports dynamiques simultanés.
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: requete, rpc }),
}));

const partie = { choix: [{ questionId: 'q1', answerId: 'a1' }], sexe: 'femme' as const, age: '19-22' as const, dureeMs: 1000, test: false, pari: null };

describe('enregistrerPartie sous un pic', () => {
  beforeEach(() => {
    vi.resetModules();
    base.appels.clear();
    base.sansMigration = false;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('relit le questionnaire et les agrégats une seule fois pour cinquante parties', async () => {
    const { enregistrerPartie } = await import('@/lib/rft/repository');
    await Promise.all(Array.from({ length: 50 }, () => enregistrerPartie(partie)));

    expect(base.appels.get('rft_runs:insert')).toBe(50);
    expect(base.appels.get('rft_run_answers:insert')).toBe(50);
    expect(base.appels.get('rft_questions:select')).toBe(1);
    expect(base.appels.get('rft_answers:select')).toBe(1);
    expect(base.appels.get('rpc:rft_distribution')).toBe(1);
    expect(base.appels.get('rft_answer_counts:select')).toBe(1);
    expect(base.appels.get('rpc:rft_paris_moyens')).toBe(1);
    // Les recomptages complets ne sont plus appelés.
    expect(base.appels.get('rpc:rft_cohortes')).toBeUndefined();
    expect(base.appels.get('rpc:rft_parts_reponses')).toBeUndefined();
  });

  it('compte la partie qui vient de finir dans sa population', async () => {
    const { enregistrerPartie } = await import('@/lib/rft/repository');
    const resultat = await enregistrerPartie(partie);

    // Quatre parties en cache, plus la sienne.
    expect(resultat.participants).toBe(5);
    // 3 choix sur 4 en cache, plus le sien : 4 sur 5.
    expect(resultat.highlights).toEqual([expect.objectContaining({ reponse: 'Oui', part: 80 })]);
  });

  it("revient à l'ancien calcul quand la migration 032 n'est pas jouée", async () => {
    base.sansMigration = true;
    const { enregistrerPartie } = await import('@/lib/rft/repository');
    const resultat = await enregistrerPartie(partie);
    await enregistrerPartie(partie);

    // L'ancien calcul lit la base après l'écriture : la partie y est déjà.
    expect(resultat.participants).toBe(5);
    expect(resultat.highlights[0]?.part).toBe(80);
    expect(base.appels.get('rpc:rft_cohortes')).toBe(2);
    expect(base.appels.get('rpc:rft_parts_reponses')).toBe(2);
    // Le questionnaire, lui, reste en cache.
    expect(base.appels.get('rft_questions:select')).toBe(1);
  });

  it("relit le questionnaire après une écriture de l'admin", async () => {
    const { enregistrerPartie, supprimerVerdict } = await import('@/lib/rft/repository');
    await enregistrerPartie(partie);
    await supprimerVerdict('v');
    await enregistrerPartie(partie);
    expect(base.appels.get('rft_questions:select')).toBe(2);
  });
});
