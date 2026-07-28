import type { Metadata } from 'next';
import Link from 'next/link';
import { METERS } from '@/config/meters-data';

export const metadata: Metadata = {
  title: 'Sources — sur quoi reposent nos outils',
  description:
    "Les outils d'auto-évaluation de Red or Green s'appuient sur des barèmes produits par des institutions publiques et des associations spécialisées. Références et limites.",
  alternates: { canonical: '/sources' },
};

interface SourceEntry {
  slug: string;
  origin: string;
  detail: string;
}

/**
 * Références des barèmes repris par nos outils.
 * Ces sources figuraient jusqu'ici en commentaire dans le code : les publier
 * est autant une question d'honnêteté que de crédibilité.
 */
const SOURCES: SourceEntry[] = [
  {
    slug: 'violentometre',
    origin: 'Département de Seine-Saint-Denis / Centre Hubertine Auclert',
    detail:
      "Le violentomètre est un outil de prévention diffusé par le Département de Seine-Saint-Denis avec l'Observatoire des violences envers les femmes, repris et diffusé par le Centre Hubertine Auclert.",
  },
  {
    slug: 'consentometre',
    origin: 'Université de Poitiers — mission égalité-diversité (CC BY-NC-ND)',
    detail:
      "Le consentomètre a été conçu par la mission égalité-diversité de l'Université de Poitiers et diffusé sous licence Creative Commons (attribution, pas d'utilisation commerciale, pas de modification).",
  },
  {
    slug: 'incestometre',
    origin: "Association Face à l'inceste / Mémoire Traumatique et Victimologie",
    detail:
      "Les repères utilisés s'appuient sur les travaux de sensibilisation de l'association Face à l'inceste et de l'association Mémoire Traumatique et Victimologie.",
  },
];

const EMERGENCY_LINES = [
  { number: '3919', label: 'Violences Femmes Info — écoute nationale, 24h/24 et 7j/7' },
  { number: '119', label: 'Enfance en danger — 24h/24 et 7j/7' },
  { number: '17', label: 'Police et gendarmerie — urgences' },
  { number: '114', label: 'Urgences pour personnes sourdes ou malentendantes — par SMS' },
];

export default function SourcesPage() {
  return (
    <main id="main-content" className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">Sources</h1>
        <p className="legal-page__updated">
          Sur quoi reposent les outils d&apos;auto-évaluation
        </p>

        <section className="legal-page__section">
          <h2>Deux types de contenus, deux origines</h2>
          <p>
            Le site mêle deux choses qu&apos;il faut distinguer.
          </p>
          <p>
            Les <strong>jeux</strong> reposent sur les votes de la communauté : le classement des
            red flags est produit par les joueurs eux-mêmes, selon la{' '}
            <Link href="/methodologie">méthode décrite ici</Link>. Il n&apos;a aucune valeur
            clinique.
          </p>
          <p>
            Les <strong>outils d&apos;auto-évaluation</strong> sont d&apos;une autre nature : ils
            reprennent des barèmes produits par des institutions publiques et des associations
            spécialisées. Nous n&apos;en sommes pas les auteurs.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>Références par outil</h2>
          {SOURCES.map((source) => {
            const meter = METERS.find((m) => m.slug === source.slug);
            if (!meter) return null;
            return (
              <div key={source.slug} style={{ marginBottom: 24 }}>
                <h3>
                  {meter.emoji} <Link href={`/ressources/${meter.slug}`}>{meter.name}</Link>
                </h3>
                <p>
                  <strong>Source :</strong> {source.origin}
                </p>
                <p>{source.detail}</p>
                <p>
                  Notre version en ligne compte {meter.questions.length} questions.
                </p>
              </div>
            );
          })}
          <p>
            Le harcélomètre et le discriminomètre sont des adaptations rédigées par nos soins à
            partir des mêmes principes de gradation. Ils ne reprennent pas un barème institutionnel
            existant et doivent être lus comme des outils de sensibilisation.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>Limites</h2>
          <p>
            Ces outils sont fournis à titre informatif. <strong>Ils ne constituent pas un
            diagnostic</strong> et ne remplacent pas l&apos;avis d&apos;un professionnel. Un
            questionnaire ne connaît ni le contexte, ni l&apos;histoire, ni les rapports de force
            propres à une situation.
          </p>
          <p>
            Aucune réponse n&apos;est transmise ni conservée : les questionnaires s&apos;exécutent
            dans le navigateur.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>En cas de danger</h2>
          <ul>
            {EMERGENCY_LINES.map((line) => (
              <li key={line.number}>
                <strong>{line.number}</strong> — {line.label}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
