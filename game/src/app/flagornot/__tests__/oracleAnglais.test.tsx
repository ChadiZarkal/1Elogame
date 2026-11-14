/**
 * @file oracleAnglais.test.tsx
 * @description L'Oracle en anglais (`/en/flagornot`).
 *
 * Chaque écran — profil, saisie, attente, verdict, verdict manqué,
 * statistiques — est rendu sous `LangueFournie langue="en"`, et aucun ne doit
 * laisser passer un mot de français : ni dans le texte, ni dans les libellés
 * pour lecteurs d'écran, ni dans les exemples du champ de saisie.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { LangueFournie } from '@/lib/i18n/LangueContexte';
import { GenderSelect } from '@/app/flagornot/GenderSelect';
import { IdlePhase } from '@/app/flagornot/IdlePhase';
import { LoadingPhase } from '@/app/flagornot/LoadingPhase';
import { RevealPhase } from '@/app/flagornot/RevealPhase';
import { PageStatsOracle } from '@/app/flagornot/stats/PageStatsOracle';
import { useFlagOrNot } from '@/app/flagornot/useFlagOrNot';
import { TEXTES_ORACLE } from '@/app/flagornot/textes';

// L'encart publicitaire n'est pas l'objet de ce test (et il a sa propre langue).
vi.mock('@/components/ads/NativeAd', () => ({ NativeAd: () => null }));
vi.mock('@/lib/analytics', () => ({ trackAIRequest: vi.fn() }));

const FRANCAIS =
  /\b(Sexe|Âge|Homme|Femme|Autre|Hommes|Femmes|Décris|comportement|obtiens|Consulter|Sélectionne|Données|uniquement|Comment|Soumets|ton|cas|Mon|histo|historique|Communauté|Privé|Envoyer|Dicter|Écris|Analyse|Partager|Offrir|café|sur|tout|Encore|Réessayer|AUCUN|injoignable|Retour|jugements|rendus|observe|genre|réponses|Tester|Chargement|Il|Elle|Les|des|le|la|les|une?)\b/;

/** Le texte et tous les libellés accessibles d'un rendu. */
function toutLeTexte(conteneur: HTMLElement): string[] {
  const morceaux = [conteneur.textContent ?? ''];
  for (const el of conteneur.querySelectorAll('[aria-label],[placeholder],[title]')) {
    for (const attr of ['aria-label', 'placeholder', 'title']) {
      const v = el.getAttribute(attr);
      if (v) morceaux.push(v);
    }
  }
  return morceaux;
}

function sansFrancais(conteneur: HTMLElement) {
  for (const morceau of toutLeTexte(conteneur)) expect(morceau).not.toMatch(FRANCAIS);
}

const enAnglais = (ui: React.ReactElement) => render(<LangueFournie langue="en">{ui}</LangueFournie>);

describe('L’Oracle en anglais — les écrans', () => {
  it('écran de profil', () => {
    const { container } = enAnglais(<GenderSelect onSelect={() => {}} />);
    expect(screen.getByText('THE ORACLE')).toBeTruthy();
    expect(screen.getByText('Pick gender + age')).toBeTruthy();
    // Les notes anglaises sont rendues sous le jeu : le lien y mène.
    expect(container.querySelector('a[href="#page-notes-title"]')?.textContent).toBe('How it works ↓');
    sansFrancais(container);
  });

  it('témoin : le même écran en français est bien détecté (le filtre n’est pas vide)', () => {
    const { container } = render(<GenderSelect onSelect={() => {}} />);
    expect(container.textContent).toMatch(FRANCAIS);
    expect(container.querySelector('a[href="#page-notes-title"]')?.textContent).toBe('Comment ça marche ↓');
  });

  it('écran de saisie, avec historique', () => {
    const { container } = enAnglais(
      <IdlePhase
        input=""
        setInput={() => {}}
        history={[{ text: 'They text back in 3 days', verdict: 'red', justification: 'Nope.' }]}
        communitySubmissions={[]}
        showCommunityTab={false}
        setShowCommunityTab={() => {}}
        placeholderIdx={2}
        inputRef={createRef<HTMLInputElement>()}
        onSubmit={() => {}}
        onKeyDown={() => {}}
        privateMode={false}
        setPrivateMode={() => {}}
      />,
    );
    expect(screen.getByText('Submit your case')).toBeTruthy();
    expect(screen.getByLabelText('Type a behavior to judge')).toBeTruthy();
    sansFrancais(container);
  });

  it('les exemples du champ et les phrases d’attente sont tous en anglais', () => {
    for (const phrase of [...TEXTES_ORACLE.en.placeholders, ...TEXTES_ORACLE.en.phrasesChargement]) {
      expect(phrase).not.toMatch(FRANCAIS);
    }
    expect(TEXTES_ORACLE.en.placeholders).toHaveLength(TEXTES_ORACLE.fr.placeholders.length);
  });

  it('écran d’attente', () => {
    const { container } = enAnglais(
      <LoadingPhase loadingPhrase={TEXTES_ORACLE.en.phrasesChargement[0]} submittedText="They plan surprises" />,
    );
    sansFrancais(container);
  });

  it('verdict', () => {
    const { container } = enAnglais(
      <RevealPhase
        result={{ verdict: 'green', justification: 'Chef’s kiss.' }}
        submittedText="They remember your favorite food"
        showJustification
        isMounted
        redCount={1234}
        greenCount={5678}
        onShare={() => {}}
        onNext={() => {}}
      />,
    );
    expect(screen.getByText('The Oracle’s take')).toBeTruthy();
    expect(screen.getByText('across the site')).toBeTruthy();
    expect(screen.getByText('🚩 1,234')).toBeTruthy();
    expect(screen.getByText('Again 🔮')).toBeTruthy();
    sansFrancais(container);
  });

  it('verdict manqué (Oracle injoignable)', () => {
    const { container } = enAnglais(
      <RevealPhase
        result={{ verdict: 'red', justification: TEXTES_ORACLE.en.injoignable, degraded: true }}
        submittedText="They ghost you"
        showJustification
        isMounted
        redCount={0}
        greenCount={0}
        onShare={() => {}}
        onNext={() => {}}
      />,
    );
    expect(screen.getByText('Try again 🔮')).toBeTruthy();
    sansFrancais(container);
  });
});

describe('L’Oracle en anglais — les statistiques', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('demande les constats en anglais et ne laisse passer aucun mot de français', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        data: {
          total: 30,
          byGender: [
            { gender: 'homme', total: 20, red: 12, green: 8, redPercent: 60 },
            { gender: 'femme', total: 10, red: 3, green: 7, redPercent: 30 },
          ],
          insights: ['🚩 Men get 30% more Red Flags than women'],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { container } = enAnglais(<PageStatsOracle />);
    await waitFor(() => expect(screen.getByText('📊 Oracle stats')).toBeTruthy());

    expect(fetchMock).toHaveBeenCalledWith('/api/flagornot/stats?lang=en');
    expect(screen.getByText('Men')).toBeTruthy();
    expect(screen.getByText('20 submissions')).toBeTruthy();
    for (const a of container.querySelectorAll('a')) {
      expect(a.getAttribute('href')).toBe('/en/flagornot');
    }
    sansFrancais(container);
  });
});

describe('L’Oracle en anglais — la demande de verdict', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('flagornot_gender', 'autre');
    localStorage.setItem('flagornot_age', '23-26');
  });
  afterEach(() => vi.unstubAllGlobals());

  it('envoie `langue: en`, ne charge pas le fil de la communauté, et partage le lien anglais', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/judge')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ verdict: 'red', justification: 'Yikes.' }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: { red: 0, green: 0 } }) });
    });
    vi.stubGlobal('fetch', fetchMock);
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });

    const { result } = renderHook(() => useFlagOrNot(), {
      wrapper: ({ children }) => <LangueFournie langue="en">{children}</LangueFournie>,
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls.some(([u]) => String(u).includes('/community'))).toBe(false);

    act(() => result.current.setInput('They read my texts'));
    await act(async () => {
      await result.current.handleSubmit();
    });

    const appel = fetchMock.mock.calls.find(([u]) => String(u).includes('/judge'));
    expect(JSON.parse(appel![1].body)).toMatchObject({ text: 'They read my texts', langue: 'en' });

    await act(async () => {
      await result.current.handleShare();
    });
    expect(share).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://redorgreen.fr/en/flagornot?ref=share',
      text: expect.stringContaining('Try it yourself on Red or Green!'),
    }));
    Reflect.deleteProperty(navigator, 'share');
  });
});
