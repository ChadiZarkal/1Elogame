/**
 * @file anglais.test.tsx
 * @description Les outils d'auto-évaluation et les pages légales en anglais.
 *
 * Aucun mot de français ne doit passer, sauf ce qu'on garde exprès : les noms
 * des outils, des organismes et des numéros français, listés dans `GARDES`.
 * Les numéros d'aide anglais doivent être exactement les numéros français :
 * on n'en ajoute ni n'en retire aucun.
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { LangueFournie } from '@/lib/i18n/LangueContexte';
import { METERS, getYesAnswersByLevel, type SeverityLevel } from '@/config/meters-data';
import { METERS_EN, NOM_FRANCAIS, metersDe } from '@/config/meters-data-en';
import { meterFaq } from '@/content/meter-faq';
import { meterNotes } from '@/content/meter-notes';
import RessourcesClient from '@/app/ressources/RessourcesClient';
import MeterQuizPage from '@/app/ressources/[slug]/page';
import { IntroPhase } from '@/app/ressources/[slug]/IntroPhase';
import { QuizPhase } from '@/app/ressources/[slug]/QuizPhase';
import { ResultsPhase } from '@/app/ressources/[slug]/ResultsPhase';
import { MeterFaqAndLinks, metadonneesOutil } from '@/app/ressources/[slug]/annexes';
import MentionsLegalesEn from '@/app/en/mentions-legales/page';
import ConfidentialiteEn from '@/app/en/confidentialite/page';
import CguEn from '@/app/en/cgu/page';
import HorsLigneEn from '@/app/en/hors-ligne/page';

let slugCourant = 'violentometre';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/en/ressources',
  useParams: () => ({ slug: slugCourant }),
  useSearchParams: () => new URLSearchParams(),
}));

/**
 * Le français gardé exprès : noms propres d'outils, d'organismes, de numéros
 * et de lois, tous français. Retirés du texte avant la recherche.
 */
const GARDES = [
  'Violentomètre', 'Consentomètre', 'Incestomètre', 'Harcèlomètre', 'Discriminomètre',
  'Violences Femmes Info', 'Police / Gendarmerie', 'Arrêtons les violences',
  'Allô Enfance en Danger', 'Viols Femmes Informations', 'Face à l’inceste',
  'Mémoire Traumatique et Victimologie', 'Mémoire Traumatique', 'Non au harcèlement', 'Net Écoute',
  'Défenseur des droits', 'SOS Racisme', 'SOS Homophobie', 'LICRA', 'DILCRAH', 'e-Enfance',
  'CNAE', 'C.M.U.', 'Centre Hubertine Auclert', 'Seine-Saint-Denis', 'département',
  'Commission Nationale de l’Informatique et des Libertés', 'loi Informatique et Libertés',
  'Conditions Générales d’Utilisation', '“Publicité”', 'gendarme',
];

const MOTS_FRANCAIS =
  /\b(le|la|les|des|du|de|un|une|est|pas|ton|ta|tes|toi|tu|vous|avec|pour|dans|sur|ou|et|en|qui|que|ce|cette|Retour|Quitter|Commencer|Conseil|Appeler|Chargement|Sain|Alerte|Oui|Non|Ressources)\b|[éèêàùçôîœ]/i;

function sansGardes(texte: string): string {
  let t = texte;
  for (const g of [...GARDES].sort((a, b) => b.length - a.length)) t = t.split(g).join(' ');
  // Les adresses citées en clair (netecoute.fr, defenseurdesdroits.fr…).
  return t.replace(/\b[\w.-]+\.(?:fr|org|gouv\.fr)\b/g, ' ');
}

function attendSansFrancais(texte: string) {
  const reste = sansGardes(texte);
  const trouve = reste.match(MOTS_FRANCAIS);
  expect(trouve ? `« ${trouve[0]} » dans : ${reste.slice(Math.max(0, (trouve.index ?? 0) - 60), (trouve.index ?? 0) + 60)}` : null).toBeNull();
}

function enAnglais(ui: React.ReactNode) {
  return render(<LangueFournie langue="en">{ui}</LangueFournie>);
}

/** Tout le texte d'un rendu, libellés pour lecteurs d'écran et titres compris. */
function texteComplet(conteneur: HTMLElement): string {
  const attributs = [...conteneur.querySelectorAll('[aria-label],[title]')]
    .map((e) => `${e.getAttribute('aria-label') ?? ''} ${e.getAttribute('title') ?? ''}`);
  return `${conteneur.textContent ?? ''} ${attributs.join(' ')}`;
}

describe('outils d’auto-évaluation — barèmes anglais', () => {
  it('ont la même structure que les barèmes français', () => {
    expect(METERS_EN.map((m) => m.slug)).toEqual(METERS.map((m) => m.slug));
    for (const [i, fr] of METERS.entries()) {
      const en = METERS_EN[i];
      expect(en.emoji).toBe(fr.emoji);
      expect(en.questions.map((q) => [q.id, q.level, Boolean(q.negatedText)]))
        .toEqual(fr.questions.map((q) => [q.id, q.level, Boolean(q.negatedText)]));
      for (const niveau of ['green', 'yellow', 'orange', 'red'] as SeverityLevel[]) {
        expect(en.levels[niveau].color).toBe(fr.levels[niveau].color);
        expect(en.levels[niveau].emoji).toBe(fr.levels[niveau].emoji);
      }
    }
  });

  it('gardent exactement les numéros et les sites d’aide français, sans en inventer', () => {
    for (const [i, fr] of METERS.entries()) {
      const en = METERS_EN[i];
      expect(en.resources.map((r) => [r.number ?? null, r.url ?? null]))
        .toEqual(fr.resources.map((r) => [r.number ?? null, r.url ?? null]));
    }
  });

  it('ne laissent passer aucun mot de français', () => {
    for (const m of METERS_EN) {
      const textes = [
        m.name, m.tagline, m.description, m.intro, m.questionPrefix,
        ...m.questions.flatMap((q) => [q.text, q.negatedText ?? '']),
        ...Object.values(m.levels).flatMap((l) => [l.label, l.title, l.message, l.advice]),
        ...m.resources.flatMap((r) => [r.name, r.description]),
        ...meterNotes(m.slug, 'en').flatMap((n) => [n.heading, ...n.body]),
        ...meterFaq(m.slug, m.questions.length, 'en').flatMap((f) => [f.question, f.answer]),
      ];
      attendSansFrancais(textes.join(' \n '));
    }
  });

  it('laissent la version française intacte par défaut', () => {
    expect(metersDe('fr')).toBe(METERS);
    expect(meterNotes('violentometre')[0].heading).toBe('D\'où vient cet outil');
    expect(meterFaq('violentometre', 24)[0].question).toBe('Qu\'est-ce que le violentomètre ?');
  });
});

describe('ressources en anglais', () => {
  it('le détecteur repère bien le français (témoin)', () => {
    const { container } = render(<RessourcesClient />);
    expect(sansGardes(texteComplet(container))).toMatch(MOTS_FRANCAIS);
    expect(container.textContent).toContain('Ressources & Auto-évaluation');
    expect(container.querySelector('a[href="/ressources/violentometre"]')).not.toBeNull();
  });

  it('l’accueil des ressources est en anglais et mène aux pages anglaises', () => {
    const { container } = enAnglais(<RessourcesClient />);
    attendSansFrancais(texteComplet(container));
    expect(container.textContent).toContain('Outside France, call your local emergency number');
    for (const m of METERS_EN) {
      expect(container.textContent).toContain(`${m.name} (${NOM_FRANCAIS[m.slug]})`);
      expect(container.querySelector(`a[href="/en/ressources/${m.slug}"]`)).not.toBeNull();
    }
    // Les numéros français sont là, tels quels.
    expect(container.textContent).toMatch(/17.*112.*3919/);
  });

  it('chaque outil est en anglais, de l’accueil au résultat', () => {
    for (const meter of METERS_EN) {
      slugCourant = meter.slug;
      const page = enAnglais(<MeterQuizPage />);
      attendSansFrancais(texteComplet(page.container));
      expect(page.container.querySelector('a[href="/en"]')).not.toBeNull();
      page.unmount();

      const intro = enAnglais(<IntroPhase meter={meter} totalQuestions={meter.questions.length} onStart={() => {}} />);
      expect(intro.container.textContent).toContain(`French name: ${NOM_FRANCAIS[meter.slug]}`);
      intro.unmount();

      for (const [i, q] of meter.questions.entries()) {
        const quiz = enAnglais(
          <QuizPhase meter={meter} currentIdx={i} totalQuestions={meter.questions.length} currentQuestion={q} animDir="in" progress={50} onAnswer={() => {}} />,
        );
        attendSansFrancais(texteComplet(quiz.container));
        quiz.unmount();
      }

      for (const oui of [true, false]) {
        const reponses = new Map(meter.questions.map((q) => [q.id, oui]));
        const parNiveau = getYesAnswersByLevel(reponses, meter.questions);
        for (const niveau of ['green', 'yellow', 'orange', 'red'] as SeverityLevel[]) {
          const res = enAnglais(
            <ResultsPhase meter={meter} resultLevel={niveau} yesByLevel={parNiveau} problemCount={oui ? 2 : 1} onRestart={() => {}} />,
          );
          attendSansFrancais(texteComplet(res.container));
          expect(res.container.textContent).toContain('These numbers and organizations are in France');
          expect(res.container.querySelector('a[href="/en/ressources"]')).not.toBeNull();
          res.unmount();
        }
      }

      const annexes = render(<MeterFaqAndLinks slug={meter.slug} langue="en" />);
      attendSansFrancais(texteComplet(annexes.container));
      expect(annexes.container.querySelector('a[href="/en/ressources"]')).not.toBeNull();
      annexes.unmount();

      const meta = metadonneesOutil('en', meter.slug);
      attendSansFrancais(`${String(meta.title)} ${meta.description}`);
      expect(meta.alternates?.canonical).toBe(`/en/ressources/${meter.slug}`);
    }
  });
});

describe('pages légales en anglais', () => {
  it.each([
    ['mentions-legales', MentionsLegalesEn],
    ['confidentialite', ConfidentialiteEn],
    ['cgu', CguEn],
  ])('%s : traduite, et renvoie à la version française qui fait foi', (chemin, Page) => {
    const { container } = render(<Page />);
    expect(container.textContent).toContain('Only the French version is legally binding');
    expect(container.querySelector(`a[href="/${chemin}"]`)).not.toBeNull();
    attendSansFrancais(texteComplet(container));
  });

  it('la page hors ligne est en anglais', () => {
    const { container } = render(<HorsLigneEn />);
    attendSansFrancais(texteComplet(container));
    expect(container.querySelector('a[href="/en"]')).not.toBeNull();
  });
});
