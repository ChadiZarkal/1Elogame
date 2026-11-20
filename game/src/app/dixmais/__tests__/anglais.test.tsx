/**
 * @file anglais.test.tsx
 * @description « C'est un 10 mais… » en anglais (« It's a 10 but… »).
 *
 * Chaque écran est rendu sous `LangueFournie langue="en"`, et aucun ne doit
 * laisser passer un mot de français : ni dans le texte des composants, ni dans
 * ce que le jeu compose lui-même (fins, portraits, phrases de sévérité et de
 * cohorte, libellés de la jauge et des catégories), ni dans les libellés pour
 * lecteurs d'écran. Les nombres s'écrivent à l'anglaise : « 6.4 », « 48% ».
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { LangueFournie } from '@/lib/i18n/LangueContexte';
import { Intro } from '../Intro';
import { ProfileStep } from '../ProfileStep';
import { ProfileCard } from '../ProfileCard';
import { ScoreDial } from '../ScoreDial';
import { Verdict } from '../Verdict';
import { ReportScreen } from '../ReportScreen';
import { PausePub } from '../PausePub';
import DixmaisClient from '../DixmaisClient';
import LeaderboardClient from '../leaderboard/LeaderboardClient';
import { NOMBRE_DE_FINS, choisirFin, construireBilan, type ContexteFin, type ProfilJuge } from '../moyenne';
import { CLES_ARCHETYPES_EN, CLES_FINS_EN } from '../finsEn';
import { TEXTES_DIXMAIS } from '../textes';
import { closeRound, useDixMais } from '../useDixMais';
import { generateIdentity } from '../profile';
import { getDixMaisLeaderboard } from '@/lib/repositories/dixmais';
import { traduireEnonces } from '@/lib/dixmais/traduction';
import { profilJuge } from './fixtures';

const en = TEXTES_DIXMAIS.en;

/** Des mots et des signes qui trahiraient du français. */
const FRANCAIS =
  /\b(Tu|Ton|Ta|Tes|toi|les|des|une|avec|pour|sur|mais|Moyenne|moyenne|Profil|profils|Classement|Jouer|Partager|Recommencer|Réessayer|révélations?|Publicité|Homme|Femme|Il|Elle|lui|aux|De zéros)\b|[àâçéèêîôûù«»]/;

const enAnglais = (enfant: ReactNode) => <LangueFournie langue="en">{enfant}</LangueFournie>;

/** Le texte visible et les libellés pour lecteurs d'écran. */
function francaisDans(container: HTMLElement): string[] {
  const restes: string[] = [];
  const texte = container.textContent ?? '';
  const m = texte.match(FRANCAIS);
  if (m) restes.push(texte.slice(Math.max(0, (m.index ?? 0) - 30), (m.index ?? 0) + 30));
  for (const el of container.querySelectorAll('[aria-label], [aria-valuetext]')) {
    for (const attr of ['aria-label', 'aria-valuetext']) {
      const v = el.getAttribute(attr);
      if (v && FRANCAIS.test(v)) restes.push(v);
    }
  }
  return restes;
}

/** Un énoncé de la base, déjà traduit comme le serveur le renvoie. */
const enonce = (id: string, text: string, type: 'positive' | 'negative') => ({
  id, text, type, category: 'dating', is_active: true, is_approved: true,
  votes_count: 10, total_delta: -20, elimination_count: 1, notes_count: 6, notes_total: 30,
  created_at: '2026-11-14',
});

/** Un profil anglais : énoncés traduits, fin écrite en anglais. */
function profilAnglais(notes: number[], communaute: (number | null)[], numero = 1): ProfilJuge {
  const textes = [
    'Il est jaloux maladif', 'Il ment facilement', 'Il fouille dans ton téléphone', 'Il ne lit jamais',
    'Il fume un paquet par jour', 'Il cuisine très bien', 'Il adore les animaux',
  ];
  const statements = traduireEnonces(
    textes.map((t, i) => ({ ...enonce(`s${numero}-${i}`, t, i >= 5 ? 'positive' : 'negative'), notes_count: communaute[i] === null ? 0 : 6, notes_total: (communaute[i] ?? 0) * 6 })),
    'en',
  );
  vi.spyOn(Math, 'random').mockReturnValue(0.3);
  const identity = generateIdentity(statements.map((s) => s.text), 'en');
  vi.restoreAllMocks();
  return closeRound({ statements, identity, notes: [], index: 0 }, notes, numero, [], 'en');
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('It’s a 10 but… — les écrans en anglais', () => {
  it('accueil : titre, démonstration et liens anglais', () => {
    const { container } = render(enAnglais(<Intro onStart={() => {}} failed />));
    expect(container.textContent).toContain('It’s a');
    expect(screen.getByText('Try again')).toBeInTheDocument();
    expect(screen.getByText('Couldn’t connect. Try again.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Leaderboard/ })).toHaveAttribute('href', '/en/dixmais/leaderboard');
    expect(francaisDans(container)).toEqual([]);
  });

  it('étape de profil', () => {
    const { container } = render(enAnglais(<ProfileStep onSubmit={() => {}} />));
    expect(screen.getByText('Who are you?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Woman' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pick both' })).toBeDisabled();
    expect(francaisDans(container)).toEqual([]);
  });

  it('révélation : la phrase, la moyenne, la jauge', () => {
    const statements = traduireEnonces([enonce('a', 'Il ment facilement', 'negative'), enonce('b', 'Il lit beaucoup', 'positive')], 'en');
    const identity = generateIdentity(statements.map((s) => s.text), 'en');
    for (const index of [0, 1]) {
      const { container, unmount } = render(enAnglais(
        <>
          <ProfileCard identity={identity} statements={statements} index={index} moyenne={6.45} flash={index ? { note: 13, moyenne: 7.25 } : null} />
          {[0, 4, 10, 13].map((v) => <ScoreDial key={v} value={v} onChange={() => {}} onCommit={() => {}} disabled={false} />)}
        </>,
      ));
      expect(francaisDans(container)).toEqual([]);
      unmount();
    }
    render(enAnglais(<ProfileCard identity={identity} statements={statements} index={0} moyenne={6.45} flash={null} />));
    expect(screen.getByText('He lies easily')).toBeInTheDocument();
    expect(screen.getByText('🚩 It’s a 10, but…')).toBeInTheDocument();
    expect(screen.getByLabelText('Average 6.5 out of 10')).toBeInTheDocument();
  });

  it('jauge : libellés et boutons', () => {
    const { rerender } = render(enAnglais(<ScoreDial value={0} onChange={() => {}} onCommit={() => {}} disabled={false} />));
    expect(screen.getByRole('button', { name: '0 · Deal-breaker' })).toBeInTheDocument();
    expect(screen.getByText('ELIMINATED')).toBeInTheDocument();
    rerender(enAnglais(<ScoreDial value={10} onChange={() => {}} onCommit={() => {}} disabled={false} />));
    expect(screen.getByRole('button', { name: 'Still a 10' })).toBeInTheDocument();
    rerender(enAnglais(<ScoreDial value={6} onChange={() => {}} onCommit={() => {}} disabled={false} />));
    expect(screen.getByRole('button', { name: 'Lock in 6' })).toBeInTheDocument();
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '6 out of 10, PASSABLE');
  });

  it('verdict : la note à l’anglaise, la fin, le détail', () => {
    const profil = profilAnglais([2, 5, 8, 10, 7, 13, 12], [3, 4, 5, 6, 7, 8, 9]);
    expect(MASCULINS_EN).toContain(profil.nom);
    const { container } = render(enAnglais(
      <Verdict profil={profil} sessionCount={3} onNext={() => {}} onReport={() => {}} loadFailed />,
    ));
    expect(screen.getByLabelText('Average 8.1 out of 10')).toBeInTheDocument();
    expect(screen.getByText('Your 7 scores')).toBeInTheDocument();
    expect(screen.getByText(/knocks 1 point off the average/)).toBeInTheDocument();
    expect(screen.getByText(/My recap · 3 profiles/)).toBeInTheDocument();
    expect(screen.getByText('He’s pathologically jealous')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Leaderboard/ })).toHaveAttribute('href', '/en/dixmais/leaderboard');
    expect(francaisDans(container)).toEqual([]);
  });

  it('verdict : plus dur ou plus indulgent que les autres', () => {
    const dur = profilAnglais([2, 2, 2, 2, 2, 2, 2], [6, 6, 6, 6, 6, 6, 6]);
    const { container } = render(enAnglais(
      <Verdict profil={dur} sessionCount={1} onNext={() => {}} onReport={() => {}} loadFailed={false} />,
    ));
    expect(screen.getByText(/you’re 4 points harsher than everyone else on/)).toBeInTheDocument();
    expect(francaisDans(container)).toEqual([]);
  });

  it('bilan : portrait, chiffres, cohorte, catégories', async () => {
    const soiree = [
      profilAnglais([4, 0, 4, 4, 14, 4, 13], [8, 8, 8, 8, 8, 8, 8], 1),
      profilAnglais([9, 8, 9, 8, 9, 12, 11], [2, 2, 2, 2, 2, 2, 2], 2),
      profilAnglais([0, 6, 6, 6, 6, 1, 0], [null, null, null, null, null, null, null], 3),
    ].map((p, i) => ({ ...p, propositions: p.propositions.map((x, j) => ({ ...x, category: ['dating', 'argent', 'sante', 'politique'][(i + j) % 4] })) }));
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: soiree.flatMap((p) => p.propositions.map((x) => ({ statement_id: x.id, notes: 10, avg_note: 9 }))) }),
    })));
    const { container } = render(enAnglais(
      <ReportScreen rounds={soiree} profile={{ sex: 'femme', age: '23-26' }} onBack={() => {}} onNext={() => {}} />,
    ));
    await waitFor(() => expect(screen.getByText('Your group')).toBeInTheDocument());
    expect(screen.getByText(/Your night · 3 profiles · 21 reveals/)).toBeInTheDocument();
    expect(screen.getByText(/women aged 23-26/)).toBeInTheDocument();
    expect(screen.getByText('What turns you off')).toBeInTheDocument();
    expect(screen.getByText('Money')).toBeInTheDocument();
    // « 14% » et non « 14 % ».
    expect(container.textContent).toMatch(/\d+%Zeros/);
    expect(francaisDans(container)).toEqual([]);
  });

  it('pause publicitaire', () => {
    const { container } = render(enAnglais(<PausePub profilsJuges={5} onContinuer={() => {}} />));
    expect(screen.getByText('5 profiles judged')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next profile in \d+…/ })).toBeDisabled();
    expect(francaisDans(container)).toEqual([]);
  });

  it('classement : énoncés traduits, nombres et liens anglais', async () => {
    const avant = process.env.NEXT_PUBLIC_MOCK_MODE;
    process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
    const lignes = traduireEnonces(await getDixMaisLeaderboard(100), 'en');
    process.env.NEXT_PUBLIC_MOCK_MODE = avant;

    const { container } = render(enAnglais(<LeaderboardClient initialData={lignes} />));
    expect(screen.getByRole('heading', { level: 1, name: 'The leaderboard' })).toBeInTheDocument();
    expect(container.textContent).toMatch(/\d+ ratings/);
    for (const lien of container.querySelectorAll('a')) expect(lien.getAttribute('href')).toBe('/en/dixmais');
    expect(francaisDans(container)).toEqual([]);

    // L'onglet des green flags aussi.
    act(() => screen.getByRole('tab', { name: '🟢 Green flags' }).click());
    expect(screen.getByText('What boosts it the most')).toBeInTheDocument();
    expect(francaisDans(container)).toEqual([]);
  });

  it('le châssis, à l’accueil', () => {
    const { container } = render(enAnglais(<DixmaisClient />));
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    expect(francaisDans(container)).toEqual([]);
  });
});

const MASCULINS_EN = ['Jake', 'Ethan', 'Noah', 'Liam', 'Mason', 'Logan', 'Lucas', 'Owen', 'Ryan', 'Tyler', 'Dylan', 'Nathan', 'Caleb', 'Jack', 'Max', 'Luke', 'Evan', 'Austin', 'Connor', 'Brandon'];

describe('It’s a 10 but… — ce que le jeu compose', () => {
  it('a une version anglaise pour chaque fin et chaque portrait', () => {
    expect(CLES_FINS_EN).toHaveLength(NOMBRE_DE_FINS);
    expect(CLES_ARCHETYPES_EN).toHaveLength(11);
  });

  it('écrit toutes les fins en anglais, pronom accordé', () => {
    const grilles = [
      [15, 15, 15, 14, 13, 13, 14], [10, 10, 11, 12, 10, 10, 10], [2, 2, 3, 14, 13, 2, 3], [0, 0, 0, 0, 0, 0, 0],
      [0, 7, 7, 8, 9, 8, 6], [0, 6, 2, 3, 2, 3, 2], [2, 9, 9, 8, 9, 10, 9], [5, 5, 5, 5, 5, 5, 5], [1, 12, 5, 6, 4, 5, 6],
      [11, 11, 11, 11, 12, 11, 11], [9, 9, 10, 9, 9, 10, 9], [8, 8, 7, 8, 8, 7, 9], [7, 6, 7, 6, 7, 6, 7],
      [5, 4, 6, 5, 4, 5, 6], [4, 3, 4, 3, 4, 3, 4], [2, 2, 1, 2, 3, 2, 2], [1, 1, 0, 1, 2, 1, 1], [3, 9, 4, 8, 3, 9, 4],
      [9, 9, 9, 9, 9, 10, 10], [6, 5, 7, 6, 5, 9, 9],
    ];
    const vues = new Set<string>();
    for (const notes of grilles) {
      for (const pronom of ['il', 'elle'] as const) {
        for (const moyenneCommunaute of [null, 2, 12]) {
          for (const verts of [[], [5, 6], [3, 4]]) {
            const c: ContexteFin = {
              propositions: notes.map((_, i) => ({ id: `p${i}`, text: `Does thing number ${i}`, type: verts.includes(i) ? 'positive' : 'negative', category: 'dating' })),
              notes,
              moyenne: notes.reduce((a, b) => a + b, 0) / notes.length,
              moyenneCommunaute,
              pronom,
            };
            for (const eviter of [[], ['hors-bareme', 'sans-faute', 'grand-ecart', 'tu-l-as-acheve', 'tolerance-zero']]) {
              const fr = choisirFin(c, eviter);
              const fin = en.fin(fr, c);
              vues.add(fin.key);
              expect(fin.key).toBe(fr.key);
              expect(fin.tone).toBe(fr.tone);
              expect(fin.title, fr.key).not.toBe(fr.title);
              expect(`${fin.title} ${fin.subtitle}`, fr.key).not.toMatch(FRANCAIS);
              if (pronom === 'elle') expect(`${fin.title} ${fin.subtitle}`, fr.key).not.toMatch(/\b(he|him|his|He|His|HIM)\b/);
              expect(fin.subtitle, fr.key).not.toMatch(/\d,\d/);
            }
          }
        }
      }
    }
    expect(vues.size).toBeGreaterThanOrEqual(16);
  });

  it('écrit tous les portraits en anglais', () => {
    const vus = new Set<string>();
    for (const base of [0, 2, 4, 6, 8, 10, 12, 14]) {
      for (const communaute of [null, 2, 8, 14]) {
        for (const ecart of [0, 7]) {
          const notes = Array.from({ length: 7 }, (_, i) => Math.min(15, base + (i % 2 ? ecart : 0)));
          const ps = [1, 2].map((n) => profilJuge(notes, { numero: n, nom: `P${n}`, verts: [5, 6], communaute: notes.map(() => communaute) }));
          const a = en.archetype(construireBilan(ps).archetype);
          vus.add(a.key);
          expect(`${a.title} ${a.tagline}`, a.key).not.toMatch(FRANCAIS);
        }
      }
    }
    expect(vus.size).toBeGreaterThanOrEqual(6);
  });

  it('écrit les nombres à l’anglaise', () => {
    expect(en.note(6.44)).toBe('6.4');
    expect(en.note(12)).toBe('12');
    expect(en.points(1)).toBe('1 point');
    expect(en.points(1.4)).toBe('1.4 points');
    expect(en.pct(48)).toBe('48%');
    expect(TEXTES_DIXMAIS.fr.note(6.44)).toBe('6,4');
    expect(TEXTES_DIXMAIS.fr.pct(48)).toBe('48 %');
  });

  it('nomme les catégories et les paliers de la jauge en anglais', () => {
    for (const c of ['general', 'politique', 'caractere', 'dating', 'lifestyle', 'social', 'argent', 'travail', 'sante', 'famille']) {
      expect(en.categorie(c)).not.toBe(c);
      expect(en.categorie(c)).not.toMatch(FRANCAIS);
    }
    for (let n = 0; n <= 15; n++) expect(en.label(n)).not.toMatch(FRANCAIS);
  });
});

describe('It’s a 10 but… — la manche en anglais', () => {
  it('demande les énoncés en anglais, donne un prénom anglais et une fin anglaise', async () => {
    const appels: string[] = [];
    const textes = ['He lies easily', 'He never reads', 'He smokes a pack a day', 'He’s super cheap', 'He’s manipulative', 'He reads a lot', 'He loves animals'];
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      appels.push(String(url));
      return { ok: true, json: async () => ({ data: textes.map((t, i) => enonce(`e${i}`, t, i >= 5 ? 'positive' : 'negative')) }) };
    }));
    const { result } = renderHook(() => useDixMais(), { wrapper: ({ children }) => enAnglais(children) });
    act(() => result.current.submitProfile({ sex: 'homme', age: '19-22' }));
    await waitFor(() => expect(result.current.phase).toBe('reveal'));
    expect(appels[0]).toBe('/api/dixmais/statements?count=7&verts=2&lang=en');
    expect(MASCULINS_EN).toContain(result.current.round?.identity.name);

    vi.useFakeTimers();
    for (let i = 0; i < 7; i++) {
      act(() => result.current.setDraft(i < 5 ? 3 : 13));
      act(() => result.current.commit());
      act(() => { vi.advanceTimersByTime(700); });
    }
    vi.useRealTimers();
    expect(result.current.phase).toBe('verdict');
    const fin = result.current.history[0].fin;
    expect(`${fin.title} ${fin.subtitle}`).not.toMatch(FRANCAIS);
    expect(appels.filter((u) => u.startsWith('/api/dixmais/note'))).toHaveLength(7);
  });

  it('reconnaît un profil féminin en anglais', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const id = generateIdentity(['She lies', 'She reads', 'He votes'], 'en');
    expect(id.pronoun).toBe('elle');
    expect(id.name).toBe('Emma');
  });
});

describe('It’s a 10 but… — les pages /en/dixmais', () => {
  it('la page du jeu : le châssis et les notes éditoriales en anglais', async () => {
    const { default: Page } = await import('@/app/en/dixmais/page');
    const { container } = render(enAnglais(<Page />));
    expect(screen.getByRole('heading', { level: 2, name: 'How the “He’s a 10 but…” game works' })).toBeInTheDocument();
    expect(francaisDans(container)).toEqual([]);
    for (const lien of container.querySelectorAll('a')) {
      const href = lien.getAttribute('href') ?? '';
      if (href.startsWith('/')) expect(href).toMatch(/^\/en(\/|$)/);
    }
  });

  it('le classement, rendu côté serveur en mode simulé', async () => {
    const avant = process.env.NEXT_PUBLIC_MOCK_MODE;
    process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
    const { default: Page, revalidate } = await import('@/app/en/dixmais/leaderboard/page');
    const element = await Page();
    process.env.NEXT_PUBLIC_MOCK_MODE = avant;
    expect(revalidate).toBe(300);
    const { container } = render(enAnglais(element));
    expect(container.querySelectorAll('li').length).toBeGreaterThan(5);
    expect(francaisDans(container)).toEqual([]);
  });

  it('les métadonnées et l’image de partage, ouvertes aux moteurs', async () => {
    const jeu = await import('@/app/en/dixmais/layout');
    const classement = await import('@/app/en/dixmais/leaderboard/layout');
    const og = await import('@/app/en/dixmais/opengraph-image');
    for (const meta of [jeu.metadata, classement.metadata]) {
      // Ouvert aux moteurs le 2026-11-14 : plus de noindex, et le lien vers le français.
      expect(meta.robots).toBeUndefined();
      expect((meta.alternates?.languages as Record<string, string>)?.fr).toMatch(/^\/dixmais/);
      expect(JSON.stringify(meta)).not.toMatch(FRANCAIS);
      expect(String(meta.alternates?.canonical)).toMatch(/^\/en\/dixmais/);
    }
    expect(og.alt).not.toMatch(FRANCAIS);
    const { container } = render(<jeu.default><p>x</p></jeu.default>);
    const jsonLd = JSON.parse(container.querySelector('script')?.textContent ?? '{}');
    expect(jsonLd.inLanguage).toBe('en-US');
    expect(jsonLd.url).toMatch(/\/en\/dixmais$/);
  });
});
