/**
 * @module app/red-flags
 * « Les pires red flags, d'après les votes » — le baromètre.
 *
 * C'est la page qui répond à « liste de red flags », « exemples de red
 * flags », « pire red flag » : ce que tous les sites concurrents écrivent de
 * mémoire, et que ce site est le seul à pouvoir mesurer. La définition, elle,
 * reste au guide — une page par intention, pour qu'elles ne se disputent pas
 * la même requête.
 *
 * Rendue côté serveur, régénérée toutes les heures. Si la base se tait, la
 * page le dit et renvoie au classement plutôt que d'afficher des zéros.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { withPrerenderTimeout } from '@/lib/prerenderTimeout';
import {
  BAROMETRE_VIDE,
  DUELS_MINIMUM,
  getBarometre,
  type Barometre,
  type EntreeBarometre,
} from '@/lib/barometre';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Les pires red flags : la liste classée par les votes des joueurs',
  description:
    'La liste des red flags du quotidien, classée par des milliers de duels : les pires, les moins graves, par thème, et ce que les femmes et les hommes placent en tête. Mise à jour chaque heure.',
  keywords: ['liste red flag', 'exemples de red flags', 'pire red flag', 'red flags', 'redflag', 'classement red flag'],
  alternates: { canonical: '/red-flags' },
  openGraph: {
    title: 'Les pires red flags, d’après les votes',
    description: 'La liste des red flags classée par des milliers de duels, mise à jour chaque heure.',
    url: '/red-flags',
  },
};

const nombre = new Intl.NumberFormat('fr-FR');

/** 1er, 2e, 3e… */
function ordinal(n: number): string {
  return n === 1 ? '1er' : `${n}e`;
}

function citer(texte: string): string {
  return `« ${texte} »`;
}

/** « A, B et C » */
function enumerer(textes: string[]): string {
  if (textes.length <= 1) return textes.join('');
  return `${textes.slice(0, -1).join(', ')} et ${textes[textes.length - 1]}`;
}

/**
 * Une ligne du classement. La barre dit la gravité relative d'un coup d'œil ;
 * les rangs par sexe disent si le verdict fait l'unanimité.
 */
function Ligne({ entree, teinte }: { entree: EntreeBarometre; teinte: string }) {
  return (
    <li className="barometre-ligne">
      <span className="barometre-rang" aria-hidden="true" style={{ color: teinte }}>
        {entree.rang}
      </span>
      <div className="barometre-corps">
        <p className="barometre-texte">{entree.texte}</p>
        <span className="barometre-barre" aria-hidden="true">
          <span style={{ width: `${Math.max(entree.gravite, 3)}%`, backgroundColor: teinte }} />
        </span>
        <p className="barometre-meta">
          <span className="sr-only">{ordinal(entree.rang)} du classement. </span>
          Plus grave que {entree.gravite} % des comportements · {nombre.format(entree.duels)} duels ·{' '}
          {ordinal(entree.rangFemmes)} chez les femmes, {ordinal(entree.rangHommes)} chez les hommes
        </p>
      </div>
    </li>
  );
}

function Liste({ entrees, teinte }: { entrees: EntreeBarometre[]; teinte: string }) {
  return (
    <ol className="barometre-liste">
      {entrees.map((e) => (
        <Ligne key={e.texte} entree={e} teinte={teinte} />
      ))}
    </ol>
  );
}

function BarometreJsonLd({ data }: { data: Barometre }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: 'Les pires red flags, d’après les votes',
        description: 'Comportements du quotidien classés par les duels des joueurs de Red or Green.',
        url: `${SITE_URL}/red-flags`,
        numberOfItems: data.pires.length,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        itemListElement: data.pires.map((e) => ({
          '@type': 'ListItem',
          position: e.rang,
          name: e.texte,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Les pires red flags', item: `${SITE_URL}/red-flags` },
        ],
      },
    ],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}

export default async function RedFlagsPage() {
  let data = BAROMETRE_VIDE;
  try {
    data = await withPrerenderTimeout(getBarometre());
  } catch {
    // Base indisponible : la page reste lisible, sans les listes.
  }

  const miseAJour = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris',
  }).format(new Date());

  const [premier, deuxieme, troisieme] = data.pires;
  const femmesEnTete = data.selonFemmes[0];
  const hommesEnTete = data.selonHommes[0];
  const moinsGrave = data.moinsGraves[0];

  return (
    <main id="main-content" className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">Les pires red flags, d&apos;après les votes</h1>
        <p className="legal-page__updated">
          Classement mis à jour le {miseAJour}
          {data.duels ? ` · ${nombre.format(data.duels)} duels tranchés sur le site` : ''}
        </p>

        <section className="legal-page__section">
          <h2>Une liste de red flags qui n&apos;est pas une opinion</h2>
          <p>
            Les listes de red flags qu&apos;on trouve en ligne sont presque toujours
            l&apos;avis d&apos;une personne. Celle-ci est tirée d&apos;un jeu : dans{' '}
            <Link href="/jeu">Le pire des deux</Link>, chaque joueur voit deux
            comportements et désigne le plus grave. Chaque duel déplace un score ; des
            milliers de duels donnent un classement.
          </p>
          {premier && deuxieme && troisieme && (
            <p>
              À ce jour, {citer(premier.texte)} arrive en tête des{' '}
              {nombre.format(data.classes)} comportements classés, devant{' '}
              {citer(deuxieme.texte)} et {citer(troisieme.texte)}.
              {femmesEnTete && hommesEnTete && femmesEnTete.texte !== hommesEnTete.texte
                ? ` Les femmes et les hommes ne placent pas la même chose en tête : ${citer(femmesEnTete.texte)} pour les unes, ${citer(hommesEnTete.texte)} pour les autres.`
                : ''}
            </p>
          )}
          <p>
            Ce que « red flag » veut dire, et la différence avec un green flag ou un
            black flag : voir le <Link href="/guide">guide des flags</Link>.
          </p>
        </section>

        {data.pires.length > 0 ? (
          <>
            <section className="legal-page__section" aria-labelledby="titre-pires">
              <h2 id="titre-pires">Le top {data.pires.length} des red flags</h2>
              <p>
                « Plus grave que 95 % » veut dire que 95 % des comportements classés
                ont été jugés moins graves que celui-ci. Les rangs chez les femmes et
                chez les hommes sont calculés sur les votes de chaque groupe.
              </p>
              <Liste entrees={data.pires} teinte="#FF6B5E" />
            </section>

            {(data.selonFemmes.length > 0 || data.selonHommes.length > 0) && (
              <section className="legal-page__section" aria-labelledby="titre-sexes">
                <h2 id="titre-sexes">Les red flags selon les femmes, selon les hommes</h2>
                <p>
                  Le même classement, relu avec les seuls votes de chaque groupe.
                  {data.plusGrandEcart
                    ? ` Le désaccord le plus net porte sur ${citer(data.plusGrandEcart.texte)} : ${data.plusGrandEcart.plusSeveres === 'femmes' ? 'les femmes' : 'les hommes'} le jugent nettement plus grave, avec ${nombre.format(data.plusGrandEcart.ecart)} points d'écart.`
                    : ''}{' '}
                  Les écarts par âge et les sujets qui divisent le plus sont détaillés
                  dans l&apos;<Link href="/observatoire">Observatoire</Link>.
                </p>
                <div className="barometre-deux">
                  <div>
                    <h3>Ce que les femmes jugent le plus grave</h3>
                    <ol className="barometre-court">
                      {data.selonFemmes.map((e) => (
                        <li key={e.texte}>
                          {e.texte} <span>{ordinal(e.rang)} au général</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h3>Ce que les hommes jugent le plus grave</h3>
                    <ol className="barometre-court">
                      {data.selonHommes.map((e) => (
                        <li key={e.texte}>
                          {e.texte} <span>{ordinal(e.rang)} au général</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </section>
            )}

            {data.themes.length > 0 && (
              <section className="legal-page__section" aria-labelledby="titre-themes">
                <h2 id="titre-themes">Les red flags par thème</h2>
                <p>
                  Les comportements sont rangés par thème quand ils s&apos;y prêtent.
                  Voici les plus graves de chacun
                  {data.themes.length > 1
                    ? ` : ${enumerer(data.themes.map((t) => t.label.toLowerCase()))}`
                    : ''}.
                </p>
                {data.themes.map((theme) => (
                  <div key={theme.id} id={`theme-${theme.id}`} className="barometre-theme">
                    <h3>
                      <span aria-hidden="true">{theme.emoji}</span> {theme.label}
                      <span className="barometre-theme-total"> · {theme.total} comportements</span>
                    </h3>
                    <Liste entrees={theme.entrees} teinte="#F59E0B" />
                  </div>
                ))}
              </section>
            )}

            {data.moinsGraves.length > 0 && moinsGrave && (
              <section className="legal-page__section" aria-labelledby="titre-moins">
                <h2 id="titre-moins">À l&apos;autre bout : ce que presque personne ne juge grave</h2>
                <p>
                  Le bas du classement compte autant que le haut. {citer(moinsGrave.texte)}{' '}
                  est le comportement le moins souvent désigné comme le pire. Un
                  comportement qui perd presque tous ses duels n&apos;est pas un green flag
                  pour autant : il est simplement, pour les joueurs, sans gravité.
                </p>
                <Liste entrees={data.moinsGraves} teinte="#5FE39B" />
              </section>
            )}
          </>
        ) : (
          <section className="legal-page__section">
            <h2>Classement momentanément indisponible</h2>
            <p>
              Les scores n&apos;ont pas pu être chargés. Le{' '}
              <Link href="/classement">classement complet</Link> reste consultable.
            </p>
          </section>
        )}

        <section className="legal-page__section">
          <h2>Ce que ce classement mesure, et ce qu&apos;il ne mesure pas</h2>
          <p>
            Il mesure un jugement collectif sur des comportements du quotidien —
            hygiène, argent, travail, vie en ligne —, souvent sur le ton de la
            blague. Il ne mesure pas un danger. Un comportement qui abîme vraiment
            quelqu&apos;un — contrôle, humiliation, violence — ne se tranche pas par un
            vote : les <Link href="/ressources">outils d&apos;auto-évaluation</Link>{' '}
            (violentomètre, consentomètre) et les numéros d&apos;aide sont faits pour
            ça.
          </p>
          <p>
            Seuls les comportements ayant pris part à au moins {DUELS_MINIMUM} duels
            sont classés ici : en dessous, un score dit surtout le hasard des premiers
            votes. Les propositions de la catégorie « Amour &amp; Sexe », jouées entre
            adultes, ne sont pas publiées. Les joueurs forment un échantillon
            volontaire : ces chiffres décrivent la communauté du site, pas la
            population française. Le calcul est détaillé dans la{' '}
            <Link href="/methodologie">méthodologie</Link>.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>Faire bouger le classement</h2>
          <p>
            Chaque duel tranché déplace les scores : <Link href="/jeu">jouer au pire
            des deux</Link> contribue à cette page. Pour savoir où vous vous situez
            vous-même, il y a le <Link href="/redflagtest">Red Flag Test</Link>. Et le{' '}
            <Link href="/classement">classement complet</Link> se filtre par sexe, par
            âge et par thème.
          </p>
        </section>
      </div>
      <BarometreJsonLd data={data} />
    </main>
  );
}
