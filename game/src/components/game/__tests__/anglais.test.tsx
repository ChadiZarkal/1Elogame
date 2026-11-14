/**
 * @file anglais.test.tsx
 * @description « The Worse of Two » : les écrans du jeu rendus en anglais
 * (sous `LangueFournie langue="en"`) ne laissent passer aucun mot français ;
 * sans fournisseur, le français est inchangé.
 *
 * Les comportements affichés sont ceux que le serveur renvoie déjà traduits
 * (voir `lib/jeu/__tests__/traduction.test.ts`) : on les passe ici en anglais.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import type { ReactElement } from 'react';
import { LangueFournie } from '@/lib/i18n/LangueContexte';
import { DuelInterface } from '../DuelInterface';
import { ResultDisplay } from '../ResultDisplay';
import { CompactResult } from '../CompactResult';
import { GameRecap } from '../GameRecap';
import { CategorySelector } from '../CategorySelector';
import { ProfileForm } from '../ProfileForm';
import { PausePubDuel } from '../PausePubDuel';
import { AllDuelsExhausted } from '../AllDuelsExhausted';
import type { Duel, VoteResult } from '@/types/game';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/en/jeu',
  useSearchParams: () => new URLSearchParams(),
}));

// Les encarts publicitaires ne sont pas l'objet de ce test.
vi.mock('@/components/ads/NativeAd', () => ({ NativeAd: () => null }));
vi.mock('@/components/ads/CadreRegie', () => ({ CadreRegie: () => null }));

const etat = vi.hoisted(() => ({
  partyStats: null as unknown,
  partyConfig: { size: 10, originalSize: 10, categories: ['quotidien'] },
  profile: { sex: 'femme', age: '23-26' },
  resetGame: () => {},
  continueParty: () => {},
  setProfile: () => {},
}));
vi.mock('@/stores/gameStore', () => {
  const useGameStore = Object.assign(
    (selecteur?: (s: typeof etat) => unknown) => (selecteur ? selecteur(etat) : etat),
    { getState: () => etat },
  );
  return { useGameStore };
});

/**
 * Ce qui trahirait du français resté à l'écran : les lettres accentuées, et
 * des mots courts qui n'existent pas en anglais.
 */
const FRANCAIS = /[àâçéèêëîïôûùœ«»]|\b(le|la|les|des|du|un|une|et|ou|ton|tes|ta|pour|avec|sur|dans|pas|suivant|raté|moins|pire|accueil|rejouer|touchez|joués?|catégories?|partager|classements?)\b/i;

/** Tout le texte lisible, y compris les libellés d'accessibilité et les indications de champ. */
function texteLisible(conteneur: HTMLElement): string {
  const attributs = Array.from(conteneur.querySelectorAll('[aria-label],[placeholder]'))
    .flatMap((el) => [el.getAttribute('aria-label') ?? '', el.getAttribute('placeholder') ?? '']);
  return [conteneur.textContent ?? '', ...attributs].join(' \n ');
}

function enAnglais(ui: ReactElement) {
  return render(<LangueFournie langue="en">{ui}</LangueFournie>);
}

const duel: Duel = {
  elementA: { id: 'a', texte: 'Drunk-calling your ex', categorie: 'sexe' },
  elementB: { id: 'b', texte: 'Microwaving fish', categorie: 'quotidien' },
};

const resultat: VoteResult = {
  winner: { id: 'a', percentage: 64, participations: 1234, rank: 3, totalElements: 183 },
  loser: { id: 'b', percentage: 36, participations: 694, rank: 80, totalElements: 183 },
  streak: { matched: true, current: 2 },
};

describe('The Worse of Two — écran du duel', () => {
  it('affiche les catégories en anglais, sans un mot de français', () => {
    const { container } = enAnglais(<DuelInterface elementA={duel.elementA} elementB={duel.elementB} onVote={vi.fn()} disabledReason="📡 Reconnect to vote" />);
    expect(screen.getByText('Love & Sex')).toBeInTheDocument();
    expect(screen.getByText('Everyday Life')).toBeInTheDocument();
    expect(texteLisible(container)).not.toMatch(FRANCAIS);
  });

  it('garde la pastille française sans fournisseur de langue', () => {
    render(<DuelInterface elementA={duel.elementA} elementB={duel.elementB} onVote={vi.fn()} />);
    expect(screen.getByText('Amour & Sexe')).toBeInTheDocument();
    expect(screen.getByText('Quotidien')).toBeInTheDocument();
  });
});

describe('The Worse of Two — résultat', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('affiche le résultat en anglais, nombres à l’américaine', () => {
    const { container } = enAnglais(<ResultDisplay duel={duel} result={resultat} streak={2} streakEmoji="🔥" onNext={vi.fn()} />);
    act(() => { vi.advanceTimersByTime(600); });
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('BIGGER RED FLAG')).toBeInTheDocument();
    expect(screen.getByText('Less bad')).toBeInTheDocument();
    expect(screen.getByText('1,234 votes')).toBeInTheDocument();
    expect(texteLisible(container)).not.toMatch(FRANCAIS);
  });

  it('affiche l’attente des votes en anglais', () => {
    const { container } = enAnglais(<ResultDisplay duel={duel} result={{ ...resultat, isOptimistic: true }} streak={0} streakEmoji="" onNext={vi.fn()} />);
    expect(screen.getAllByText('Counting votes...')).toHaveLength(2);
    expect(texteLisible(container)).not.toMatch(FRANCAIS);
  });

  it('reste en français sans fournisseur', () => {
    render(<ResultDisplay duel={duel} result={resultat} streak={2} streakEmoji="🔥" onNext={vi.fn()} />);
    act(() => { vi.advanceTimersByTime(600); });
    expect(screen.getByText('Suivant')).toBeInTheDocument();
    expect(screen.getByText('PLUS RED FLAG')).toBeInTheDocument();
    expect(screen.getByText('1 234 votes')).toBeInTheDocument();
  });

  it('affiche l’historique compact en anglais', () => {
    const { container } = enAnglais(<CompactResult duel={duel} result={resultat} index={0} />);
    expect(screen.getByText('🎯 Called it!')).toBeInTheDocument();
    expect(texteLisible(container)).not.toMatch(FRANCAIS);
  });
});

describe('The Worse of Two — récapitulatif', () => {
  beforeEach(() => {
    etat.partyStats = {
      results: [
        { duel, result: resultat, reactionTimeMs: 1500 },
        {
          duel: {
            elementA: { id: 'c', texte: 'Peeing in the pool', categorie: 'quotidien' },
            elementB: { id: 'd', texte: 'Never flushing', categorie: 'quotidien' },
          },
          result: { ...resultat, winner: { ...resultat.winner, id: 'c', percentage: 22 }, loser: { ...resultat.loser, id: 'd', percentage: 78 } },
          reactionTimeMs: 2500,
        },
        {
          duel: {
            elementA: { id: 'e', texte: 'Wearing Crocs', categorie: 'quotidien' },
            elementB: { id: 'f', texte: 'Vaping indoors', categorie: 'quotidien' },
          },
          result: { ...resultat, winner: { ...resultat.winner, id: 'f', percentage: 51 }, loser: { ...resultat.loser, id: 'e', percentage: 49 } },
          reactionTimeMs: 3000,
        },
      ],
      bestStreak: 2,
      correctGuesses: 2,
      startedAt: 0,
      endedAt: 1,
      categories: ['quotidien'],
      size: 3,
    };
  });

  it('rend le récapitulatif en anglais, liens vers les pages anglaises', () => {
    const { container } = enAnglais(<GameRecap />);
    expect(screen.getByText('Your key moments')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
    expect(screen.getByText(/Everyday Life/)).toBeInTheDocument();
    expect(screen.getByText('🏆 Rankings').closest('a')).toHaveAttribute('href', '/en/classement');
    expect(screen.getByText('🏠 Home').closest('a')).toHaveAttribute('href', '/en');
    expect(texteLisible(container)).not.toMatch(FRANCAIS);
  });

  it('reste en français sans fournisseur', () => {
    const { container } = render(<GameRecap />);
    // Le détecteur voit bien le français quand il y en a.
    expect(texteLisible(container)).toMatch(FRANCAIS);
    expect(screen.getByText('Tes moments clés')).toBeInTheDocument();
    expect(screen.getByText('🏆 Classements').closest('a')).toHaveAttribute('href', '/classement');
  });
});

describe('The Worse of Two — écrans d’entrée et de pause', () => {
  it('le profil, le choix des catégories, la pause et la fin sont en anglais', () => {
    for (const ui of [
      <ProfileForm key="p" />,
      <CategorySelector key="c" onStart={vi.fn()} />,
      <PausePubDuel key="pp" duelsJoues={5} onContinuer={vi.fn()} />,
      <AllDuelsExhausted key="a" duelCount={42} onReset={vi.fn()} />,
    ]) {
      const { container, unmount } = enAnglais(ui);
      expect(texteLisible(container)).not.toMatch(FRANCAIS);
      unmount();
    }
  });

  it('les liens du choix des catégories restent sous /en', () => {
    enAnglais(<CategorySelector onStart={vi.fn()} />);
    expect(screen.getByText('← Back').closest('a')).toHaveAttribute('href', '/en/jeu');
  });
});
