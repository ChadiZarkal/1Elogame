/**
 * @module app/red-flags/PageRedFlags
 * « Les pires red flags, d'après les votes », dans les deux langues :
 * `/red-flags` et `/en/red-flags` appellent ce composant (traduction du
 * 2026-11-14). Voir `app/red-flags/page.tsx` pour ce que la page fait.
 *
 * Le français est celui qui était écrit dans la page, déplacé tel quel dans
 * `CorpsFr`. L'anglais est un corps à part (`CorpsEn`) plutôt qu'un
 * dictionnaire de bouts de phrases : les phrases assemblées à partir des
 * chiffres ne se découpent pas pareil dans les deux langues.
 *
 * LES COMPORTEMENTS RESTENT EN FRANÇAIS
 *   Leur texte vient de la base, en français. `traduire` permet de brancher
 *   un dictionnaire (texte français → anglais) quand il existera ; sans lui,
 *   la page anglaise le dit au lecteur et marque chaque texte `lang="fr"`.
 */

import type { ReactNode } from 'react';
import Link from '@/components/ui/LienIntention';
import { withPrerenderTimeout } from '@/lib/prerenderTimeout';
import { cheminLocalise, localeDe, type Langue } from '@/lib/i18n/langue';
import {
  BAROMETRE_VIDE,
  DUELS_MINIMUM,
  getBarometre,
  type Barometre,
  type EntreeBarometre,
} from '@/lib/barometre';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

/** Les thèmes (`TAGS_CONFIG`) en anglais, par identifiant. */
const THEMES_EN: Record<string, string> = {
  metier: 'Work',
  couple: 'Relationships',
  hygiene: 'Hygiene',
  argent: 'Money',
  numerique: 'Digital life',
  social: 'Social',
  sport: 'Sports',
  nourriture: 'Food',
  emotionnel: 'Emotional',
  transport: 'Transportation',
  politique: 'Politics',
};

/** 1er, 2e, 3e… · 1st, 2nd, 3rd… */
function ordinal(n: number, langue: Langue): string {
  if (langue === 'fr') return n === 1 ? '1er' : `${n}e`;
  const centaine = n % 100;
  if (centaine >= 11 && centaine <= 13) return `${n}th`;
  return `${n}${({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th'}`;
}

/** Ce qu'il faut pour écrire la page : chiffres, mise en forme, liens. */
interface Ctx {
  langue: Langue;
  data: Barometre;
  nombre: Intl.NumberFormat;
  miseAJour: string;
  /** Le texte d'un comportement dans la langue de la page (sinon tel quel). */
  tx: (texte: string) => string;
  /** Vrai si les comportements s'affichent dans leur texte français. */
  comportementsEnFrancais: boolean;
  citer: (texte: string) => string;
  enumerer: (textes: string[]) => string;
  ordinal: (n: number) => string;
  lien: (chemin: string) => string;
}

/** `lang="fr"` sur un texte de la base resté en français dans la page anglaise. */
function langDe(c: Ctx, texte: string): 'fr' | undefined {
  return c.langue === 'en' && c.tx(texte) === texte ? 'fr' : undefined;
}

/**
 * Une ligne du classement. La barre dit la gravité relative d'un coup d'œil ;
 * les rangs par sexe disent si le verdict fait l'unanimité.
 */
function Ligne({ entree, teinte, c }: { entree: EntreeBarometre; teinte: string; c: Ctx }) {
  return (
    <li className="barometre-ligne">
      <span className="barometre-rang" aria-hidden="true" style={{ color: teinte }}>
        {entree.rang}
      </span>
      <div className="barometre-corps">
        <p className="barometre-texte" lang={langDe(c, entree.texte)}>{c.tx(entree.texte)}</p>
        <span className="barometre-barre" aria-hidden="true">
          <span style={{ width: `${Math.max(entree.gravite, 3)}%`, backgroundColor: teinte }} />
        </span>
        {c.langue === 'fr' ? (
          <p className="barometre-meta">
            <span className="sr-only">{c.ordinal(entree.rang)} du classement. </span>
            Plus grave que {entree.gravite} % des comportements · {c.nombre.format(entree.duels)} duels ·{' '}
            {c.ordinal(entree.rangFemmes)} chez les femmes, {c.ordinal(entree.rangHommes)} chez les hommes
          </p>
        ) : (
          <p className="barometre-meta">
            <span className="sr-only">Ranked {c.ordinal(entree.rang)}. </span>
            Worse than {entree.gravite}% of behaviors · {c.nombre.format(entree.duels)} duels ·{' '}
            {c.ordinal(entree.rangFemmes)} among women, {c.ordinal(entree.rangHommes)} among men
          </p>
        )}
      </div>
    </li>
  );
}

function Liste({ entrees, teinte, c }: { entrees: EntreeBarometre[]; teinte: string; c: Ctx }) {
  return (
    <ol className="barometre-liste">
      {entrees.map((e) => (
        <Ligne key={e.texte} entree={e} teinte={teinte} c={c} />
      ))}
    </ol>
  );
}

function BarometreJsonLd({ c }: { c: Ctx }) {
  const { data, langue } = c;
  const en = langue === 'en';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: en ? 'The worst red flags, according to the votes' : 'Les pires red flags, d’après les votes',
        description: en
          ? 'Everyday behaviors ranked by the duels of Red or Green players.'
          : 'Comportements du quotidien classés par les duels des joueurs de Red or Green.',
        url: `${SITE_URL}${c.lien('/red-flags')}`,
        numberOfItems: data.pires.length,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        itemListElement: data.pires.map((e) => ({
          '@type': 'ListItem',
          position: e.rang,
          name: c.tx(e.texte),
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: en ? 'Home' : 'Accueil', item: en ? `${SITE_URL}/en` : SITE_URL },
          { '@type': 'ListItem', position: 2, name: en ? 'The worst red flags' : 'Les pires red flags', item: `${SITE_URL}${c.lien('/red-flags')}` },
        ],
      },
    ],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}

// ---------------------------------------------------------------------------
// Français — le texte d'origine de la page
// ---------------------------------------------------------------------------

function CorpsFr({ c }: { c: Ctx }): ReactNode {
  const { data, nombre, miseAJour, citer, enumerer } = c;
  const ordinal = c.ordinal;
  const [premier, deuxieme, troisieme] = data.pires;
  const femmesEnTete = data.selonFemmes[0];
  const hommesEnTete = data.selonHommes[0];
  const moinsGrave = data.moinsGraves[0];

  return (
    <>
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
              <Liste entrees={data.pires} teinte="#FF6B5E" c={c} />
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
                    <Liste entrees={theme.entrees} teinte="#F59E0B" c={c} />
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
                <Liste entrees={data.moinsGraves} teinte="#5FE39B" c={c} />
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
            des deux</Link> contribue à cette page. Les{' '}
            <Link href="/articles">articles</Link> lisent ces chiffres de plus près —
            dont ce que les hommes et les femmes{' '}
            <Link href="/articles/coucher-avec-son-boss-draguer-ses-collegues">ne jugent
            pas de la même façon au travail</Link>. Pour savoir où vous vous situez
            vous-même, il y a le <Link href="/redflagtest">Red Flag Test</Link>. Et le{' '}
            <Link href="/classement">classement complet</Link> se filtre par sexe, par
            âge et par thème.
          </p>
        </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// English
// ---------------------------------------------------------------------------

function CorpsEn({ c }: { c: Ctx }): ReactNode {
  const { data, nombre, miseAJour, citer, enumerer, ordinal, lien, tx } = c;
  const [premier, deuxieme, troisieme] = data.pires;
  const femmesEnTete = data.selonFemmes[0];
  const hommesEnTete = data.selonHommes[0];
  const moinsGrave = data.moinsGraves[0];

  return (
    <>
        <h1 className="legal-page__title">The worst red flags, according to the votes</h1>
        <p className="legal-page__updated">
          Ranking updated {miseAJour}
          {data.duels ? ` · ${nombre.format(data.duels)} duels decided on the site` : ''}
        </p>

        <section className="legal-page__section">
          <h2>A red flag list that isn’t just someone’s opinion</h2>
          <p>
            The red flag lists you find online are almost always one person’s
            opinion. This one comes from a game: in{' '}
            <Link href={lien('/jeu')}>The Worse of Two</Link>, each player sees two
            behaviors and picks the worse one. Each duel moves a score; thousands of
            duels make a ranking.
          </p>
          {premier && deuxieme && troisieme && (
            <p>
              Right now, {citer(premier.texte)} tops the{' '}
              {nombre.format(data.classes)} ranked behaviors, ahead of{' '}
              {citer(deuxieme.texte)} and {citer(troisieme.texte)}.
              {femmesEnTete && hommesEnTete && femmesEnTete.texte !== hommesEnTete.texte
                ? ` Women and men don’t put the same thing at the top: ${citer(femmesEnTete.texte)} for women, ${citer(hommesEnTete.texte)} for men.`
                : ''}
            </p>
          )}
          {c.comportementsEnFrancais && data.pires.length > 0 && (
            <p>
              The behaviors are shown in their original French wording: that’s how
              players see them and vote on them in the game.
            </p>
          )}
          <p>
            What “red flag” means, and how it differs from a green flag or a black
            flag: see the <Link href={lien('/guide')}>flag guide</Link>.
          </p>
        </section>

        {data.pires.length > 0 ? (
          <>
            <section className="legal-page__section" aria-labelledby="titre-pires">
              <h2 id="titre-pires">The top {data.pires.length} red flags</h2>
              <p>
                “Worse than 95%” means 95% of ranked behaviors were judged less
                serious than this one. The ranks among women and among men are
                calculated from each group’s votes.
              </p>
              <Liste entrees={data.pires} teinte="#FF6B5E" c={c} />
            </section>

            {(data.selonFemmes.length > 0 || data.selonHommes.length > 0) && (
              <section className="legal-page__section" aria-labelledby="titre-sexes">
                <h2 id="titre-sexes">Red flags according to women, according to men</h2>
                <p>
                  The same ranking, recalculated with only each group’s votes.
                  {data.plusGrandEcart
                    ? ` The sharpest disagreement is over ${citer(data.plusGrandEcart.texte)}: ${data.plusGrandEcart.plusSeveres === 'femmes' ? 'women' : 'men'} judge it much more serious, by ${nombre.format(data.plusGrandEcart.ecart)} points.`
                    : ''}{' '}
                  The gaps by age and the most divisive topics are detailed in the{' '}
                  <Link href={lien('/observatoire')}>Observatory</Link>.
                </p>
                <div className="barometre-deux">
                  <div>
                    <h3>What women judge most serious</h3>
                    <ol className="barometre-court">
                      {data.selonFemmes.map((e) => (
                        <li key={e.texte}>
                          <span lang={langDe(c, e.texte)}>{tx(e.texte)}</span> <span>{ordinal(e.rang)} overall</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h3>What men judge most serious</h3>
                    <ol className="barometre-court">
                      {data.selonHommes.map((e) => (
                        <li key={e.texte}>
                          <span lang={langDe(c, e.texte)}>{tx(e.texte)}</span> <span>{ordinal(e.rang)} overall</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </section>
            )}

            {data.themes.length > 0 && (
              <section className="legal-page__section" aria-labelledby="titre-themes">
                <h2 id="titre-themes">Red flags by theme</h2>
                <p>
                  Behaviors are grouped by theme when they fit one. Here are the most
                  serious in each
                  {data.themes.length > 1
                    ? `: ${enumerer(data.themes.map((t) => (THEMES_EN[t.id] ?? t.label).toLowerCase()))}`
                    : ''}.
                </p>
                {data.themes.map((theme) => (
                  <div key={theme.id} id={`theme-${theme.id}`} className="barometre-theme">
                    <h3>
                      <span aria-hidden="true">{theme.emoji}</span> {THEMES_EN[theme.id] ?? theme.label}
                      <span className="barometre-theme-total"> · {theme.total} behaviors</span>
                    </h3>
                    <Liste entrees={theme.entrees} teinte="#F59E0B" c={c} />
                  </div>
                ))}
              </section>
            )}

            {data.moinsGraves.length > 0 && moinsGrave && (
              <section className="legal-page__section" aria-labelledby="titre-moins">
                <h2 id="titre-moins">At the other end: what almost nobody finds serious</h2>
                <p>
                  The bottom of the ranking matters as much as the top.{' '}
                  {citer(moinsGrave.texte)} is the behavior least often picked as the
                  worse one. A behavior that loses almost all its duels isn’t a green
                  flag for all that: for players, it’s simply harmless.
                </p>
                <Liste entrees={data.moinsGraves} teinte="#5FE39B" c={c} />
              </section>
            )}
          </>
        ) : (
          <section className="legal-page__section">
            <h2>Ranking temporarily unavailable</h2>
            <p>
              The scores couldn’t be loaded. The{' '}
              <Link href={lien('/classement')}>full ranking</Link> is still available.
            </p>
          </section>
        )}

        <section className="legal-page__section">
          <h2>What this ranking measures, and what it doesn’t</h2>
          <p>
            It measures a collective judgment on everyday behaviors — hygiene,
            money, work, online life — often tongue-in-cheek. It doesn’t measure
            danger. Behavior that truly hurts someone — control, humiliation,
            violence — can’t be settled by a vote: the{' '}
            <Link href={lien('/ressources')}>self-assessment tools</Link> (violence
            meter, consent meter) and helplines are there for that.
          </p>
          <p>
            Only behaviors that have been in at least {DUELS_MINIMUM} duels are
            ranked here: below that, a score mostly reflects the luck of the first
            votes. Prompts in the “Love &amp; Sex” category, played between adults,
            aren’t published. Players are a self-selected sample: these numbers
            describe the site’s community, not the French population. The math is
            explained in the <Link href={lien('/methodologie')}>methodology</Link>.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>Move the ranking</h2>
          <p>
            Every duel decided moves the scores: <Link href={lien('/jeu')}>playing
            The Worse of Two</Link> feeds this page. The{' '}
            <Link href={lien('/articles')}>articles</Link> take a closer look at these
            numbers — including what men and women{' '}
            <Link href={lien('/articles/coucher-avec-son-boss-draguer-ses-collegues')}>don’t
            judge the same way at work</Link>. To find out where you stand yourself,
            there’s the <Link href={lien('/redflagtest')}>Red Flag Test</Link>. And the{' '}
            <Link href={lien('/classement')}>full ranking</Link> can be filtered by
            gender, age and theme.
          </p>
        </section>
    </>
  );
}

export async function PageRedFlags({
  langue,
  traduire,
}: {
  langue: Langue;
  /** Texte français d'un comportement → son texte anglais. Facultatif. */
  traduire?: (texte: string) => string;
}) {
  let data = BAROMETRE_VIDE;
  try {
    data = await withPrerenderTimeout(getBarometre());
  } catch {
    // Base indisponible : la page reste lisible, sans les listes.
  }

  const en = langue === 'en';
  const tx = en && traduire ? traduire : (texte: string) => texte;
  const c: Ctx = {
    langue,
    data,
    nombre: new Intl.NumberFormat(localeDe(langue)),
    miseAJour: new Intl.DateTimeFormat(localeDe(langue), {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris',
    }).format(new Date()),
    tx,
    comportementsEnFrancais: en && !traduire,
    citer: en ? (texte) => `“${tx(texte)}”` : (texte) => `« ${texte} »`,
    /** « A, B et C » · “A, B, and C” */
    enumerer: (textes) => {
      if (textes.length <= 1) return textes.join('');
      if (en) {
        return textes.length === 2
          ? `${textes[0]} and ${textes[1]}`
          : `${textes.slice(0, -1).join(', ')}, and ${textes[textes.length - 1]}`;
      }
      return `${textes.slice(0, -1).join(', ')} et ${textes[textes.length - 1]}`;
    },
    ordinal: (n) => ordinal(n, langue),
    lien: (chemin) => cheminLocalise(langue, chemin),
  };

  return (
    <main id="main-content" className="legal-page">
      <div className="legal-page__container">
        {en ? <CorpsEn c={c} /> : <CorpsFr c={c} />}
      </div>
      <BarometreJsonLd c={c} />
    </main>
  );
}
