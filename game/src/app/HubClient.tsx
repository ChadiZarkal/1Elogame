'use client';

/**
 * @module app/HubClient
 * Accueil : ce que propose le site, visible sans rien toucher.
 *
 * La version précédente était un carrousel à onglets. Sur les quatre jeux, un
 * seul était rendu ; les trois autres se résumaient à des intitulés de 7,5 px
 * dans une rangée d'onglets — mesurés dans le navigateur, pas estimés. Or la
 * seule question que pose un visiteur qui arrive ici est « qu'est-ce qu'on
 * peut faire ? », et y répondre demandait quatre gestes sur une cible qu'on ne
 * peut pas lire. Un cinquième jeu, Flash Flag, n'était même pas dans la
 * rangée : décrit dans le tiroir « Comment jouer » de cette page, présent dans
 * le pied de page et dans la barre de navigation — laquelle est justement
 * masquée sur l'accueil. Il n'existait donc aucun chemin vers lui depuis ici.
 *
 * D'où le parti pris inverse : les jeux sont posés les uns sous les autres,
 * chacun avec sa promesse en une phrase et son format. La page défile, comme
 * toutes les pages. C'est la contrainte de tenir en une fenêtre sans
 * défilement qui avait poussé la typographie sous le seuil de lisibilité — les
 * deux points de rupture `max-height` du fichier précédent ne faisaient que
 * répartir la pénurie. Rien n'est plus petit que 11 px ici.
 *
 * La page montre aussi ce que le site produit — le compte des votes et les
 * trois comportements les plus mal jugés, lus dans la base par `page.tsx`.
 * Elle affirmait que « ce sont les joueurs qui tranchent » sans jamais montrer
 * ce qu'ils avaient tranché.
 *
 * Les deux tiroirs ont disparu. « Comment jouer » redisait, en cinq
 * paragraphes cachés derrière un bouton, ce que chaque carte dit désormais sur
 * la page. « Safe zone » cachait deux liens qui figuraient déjà dans la rangée
 * du dessous ; c'est le seul contenu du site qui ne devrait jamais demander un
 * geste pour apparaître, il est maintenant en clair, en bas de page.
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Shield, Trophy } from 'lucide-react';
import { useHaptics } from '@/lib/hooks';

type Jeu = {
  id: string;
  /** Teinte du jeu, reprise de la version précédente : elle sert déjà ailleurs. */
  couleur: string;
  emoji: string;
  titre: string;
  /** Une phrase : ce qu'on fait, pas ce que c'est. */
  promesse: string;
  /** Format et durée. Le visiteur choisit surtout là-dessus. */
  format: string;
  /**
   * Le verbe. Un titre et une flèche disent qu'il se passe quelque chose, pas
   * quoi : la recherche sur les intitulés est constante là-dessus — verbe +
   * objet, tourné vers le résultat pour la personne.
   */
  action: string;
  href: string;
  externe?: boolean;
};

/**
 * L'ordre de ce tableau est l'ordre de la page, et c'est la seule chose qui
 * hiérarchise les jeux : ils ont tous la même carte, la même taille, le même
 * poids visuel. Changer la vitrine revient donc à déplacer une ligne, sans
 * toucher à la mise en page.
 *
 * Flash Flag n'y figure pas : choix éditorial, il n'est pas mis en avant. Il
 * reste joignable par le pied de page et par la barre de navigation, présents
 * sur toutes les autres routes — c'est sa seule voie d'accès depuis l'accueil,
 * et elle passe par le bas de cette page.
 */
const JEUX: Jeu[] = [
  {
    id: 'redflagtest',
    couleur: '#FFB4AA',
    emoji: '🧪',
    titre: 'RED FLAG TEST',
    promesse: 'Ce que les autres voient comme red flag chez toi.',
    format: 'Solo · anonyme',
    action: 'Faire le test',
    href: 'https://redflagtest.redorgreen.fr/',
    externe: true,
  },
  {
    id: 'dixmais',
    couleur: '#F59E0B',
    emoji: '⭐',
    titre: "C'EST UN 10 MAIS…",
    promesse: 'Il part de 10 sur 10. Cinq révélations le font chuter.',
    format: 'Solo · 3 min · le 0 élimine',
    action: 'Noter un profil',
    href: '/dixmais',
  },
  {
    id: 'oracle',
    couleur: '#88CEFF',
    emoji: '🔮',
    titre: "L'ORACLE",
    promesse: 'Tu racontes ta situation, l’IA tranche.',
    format: 'Solo · 30 s · une amorce',
    action: 'Soumettre mon cas',
    href: '/flagornot',
  },
  {
    id: 'jeu',
    couleur: '#2ECC71',
    emoji: '🔥',
    titre: 'LE PIRE DES DEUX',
    promesse: 'Deux comportements, tu désignes le plus grave.',
    format: 'Solo ou à plusieurs · 2 min',
    action: 'Lancer un duel',
    href: '/jeu',
  },
];

/**
 * Le second rayon : ce qu'on vient lire plutôt que jouer. Ces pages sont parmi
 * les plus utiles du site et étaient atteignables par un pied de page situé
 * sous une vitrine qui, elle, ne défilait pas.
 */
const REPERES: { emoji: string; titre: string; sous: string; href: string; couleur: string }[] = [
  {
    emoji: '🚩',
    titre: 'GUIDE DES FLAGS',
    sous: 'Green, white, orange, red, black : ce que chaque couleur veut dire',
    href: '/guide',
    couleur: '#2ECC71',
  },
  {
    emoji: '📊',
    titre: "L'OBSERVATOIRE",
    sous: 'Là où hommes, femmes et générations ne sont pas d’accord',
    href: '/observatoire',
    couleur: '#88CEFF',
  },
];
/** Ce que `page.tsx` a pu lire. `null` et liste vide = base muette. */
export type DonneesHub = {
  votes: number | null;
  comportementsClasses: number | null;
  pires: { rang: number; texte: string; votes: number }[];
};

/** Séparateur de milliers français, pour que 128394 se lise. */
const nombre = new Intl.NumberFormat('fr-FR');

export function HubClient({ votes, comportementsClasses, pires }: DonneesHub) {
  const { tap } = useHaptics();

  return (
    <div className="relative min-h-dvh bg-black text-[#E2E2E2] selection:bg-[#FF3B30]/30 selection:text-white">
      {/* Décor. `fixed` plutôt qu'`absolute` : la page défile désormais, et un
          halo ancré en haut du document disparaîtrait au premier écran. */}
      <div
        aria-hidden
        /* `transform-gpu` : ce calque est `fixed` sous une page qui defile
           desormais. Sans promotion explicite, les deux halos de 130-150 px de
           flou se repeignent a chaque image sur telephone. Promu, il est
           composite une fois et ne coute plus rien au defilement. */
        className="pointer-events-none fixed inset-0 z-0 transform-gpu overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-size-[32px_32px] opacity-60" />
        <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#FF3B30] opacity-15 blur-[110px]" />
        <div className="absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-[#2ECC71] opacity-10 blur-[100px]" />
      </div>

      <main
        id="main-content"
        className="relative z-10 mx-auto w-full max-w-110 px-5 pb-14 sm:max-w-3xl sm:px-8"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)' }}
      >
        {/* ── Ce qu'est le site ─────────────────────────────────────────── */}
        <header className="flex flex-col items-center text-center">
          <h1>
            <Image
              src="/logo-rog-new.svg"
              alt="Red or Green — repérer les toxicités ordinaires"
              /* 192 × 86 : les dimensions réelles du fichier. */
              width={192}
              height={86}
              priority
              draggable={false}
              className="h-auto w-[64vw] max-w-64 object-contain drop-shadow-[0_0_28px_rgba(255,59,48,0.3)] [@media(max-height:700px)]:w-[54vw] sm:w-60"
            />
          </h1>

          {/* La page ne disait nulle part ce qu'elle proposait : on passait du
              logo aux onglets. Deux phrases, rendues côté serveur, lisibles
              avant toute interaction. */}
          <p className="mt-4 max-w-[32ch] text-[15px] font-semibold leading-relaxed text-[#B8B8C0] [@media(max-height:700px)]:mt-3">
            « Red flag » désigne tout et n&apos;importe quoi. Ici, les joueurs
            tranchent.
          </p>
          {/* Le chiffre remplace un adjectif. « Ce sont les joueurs qui
              tranchent » ne veut rien dire tant qu'on ne sait pas combien ils
              sont ; s'il manque, la ligne se réduit aux garanties. */}
          <p className="mt-3 text-[12px] font-black uppercase tracking-[0.16em] text-[#6E6E78] [@media(max-height:700px)]:mt-2">
            {votes !== null && votes > 0 && (
              <>
                <span className="text-[#B8B8C0]">{nombre.format(votes)} votes</span>
                {' · '}
              </>
            )}
            Sans compte · sans pub
          </p>
        </header>

        {/* ── Les jeux ──────────────────────────────────────────────────── */}
        <section className="mt-8 [@media(max-height:700px)]:mt-6" aria-labelledby="titre-jeux">
          <h2
            id="titre-jeux"
            className="mb-3 text-[12px] font-black uppercase tracking-[0.2em] text-[#8E8E93]"
          >
            Les jeux
          </h2>

          <ul className="grid gap-2.5 sm:grid-cols-2">
            {JEUX.map((jeu) => (
              <li key={jeu.id}>
                <CarteJeu jeu={jeu} onTap={tap} />
              </li>
            ))}
          </ul>
        </section>

        {/* ── Ce que les votes ont donné ────────────────────────────────── */}
        {/* Rendu seulement s'il y a de quoi le remplir : un podium vide, ou
            un podium à une ligne, dit moins que pas de podium du tout. */}
        {pires.length >= 3 && (
          <section className="mt-9" aria-labelledby="titre-palmares">
            <h2
              id="titre-palmares"
              className="mb-3 flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.2em] text-[#8E8E93]"
            >
              <Trophy size={13} aria-hidden className="text-[#F59E0B]" />
              Les pires, d&apos;après les votes
            </h2>

            <ol className="overflow-hidden rounded-2xl border border-white/7 bg-[#0C0C0E]">
              {pires.map((pire) => (
                <li
                  key={pire.rang}
                  className="flex items-start gap-3 border-b border-white/5 px-4 py-3.5 last:border-b-0"
                >
                  <span
                    aria-hidden
                    className="mt-px w-5 shrink-0 text-[15px] font-black tabular-nums text-[#F59E0B]"
                  >
                    {pire.rang}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold leading-snug text-[#DCDCE2]">
                      {pire.texte}
                    </span>
                    {/* Un comportement fraîchement ajouté n'a pas encore été
                        soumis : « 0 votes » sous une place de podium se lit
                        comme une erreur. Pas de compte, pas de ligne. */}
                    {pire.votes > 0 && (
                      <span className="mt-0.5 block text-[12px] font-bold uppercase tracking-wide text-[#6E6E78]">
                        {nombre.format(pire.votes)} votes
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>

            <Link
              href="/classement"
              onClick={tap}
              className="group mt-2.5 flex min-h-12 items-center justify-between gap-3 rounded-xl border border-white/6 bg-white/2 px-4 py-3.5 text-[13.5px] font-bold text-[#C9C9D1] transition hover:border-white/15 hover:bg-white/5"
            >
              <span>
                {comportementsClasses !== null && comportementsClasses > 0
                  ? `Le classement complet — ${nombre.format(comportementsClasses)} comportements`
                  : 'Le classement complet'}
              </span>
              <ArrowRight
                size={14}
                aria-hidden
                className="shrink-0 text-[#F59E0B] transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </section>
        )}

        {/* ── Les repères ───────────────────────────────────────────────── */}
        <section className="mt-9" aria-labelledby="titre-reperes">
          <h2
            id="titre-reperes"
            className="mb-3 text-[12px] font-black uppercase tracking-[0.2em] text-[#8E8E93]"
          >
            Comprendre
          </h2>

          <ul className="grid grid-cols-2 gap-2.5">
            {REPERES.map((repere) => (
              <li key={repere.href}>
                <Link
                  href={repere.href}
                  onClick={tap}
                  className="group flex h-full flex-col rounded-2xl border border-white/6 bg-[#0C0C0E] px-3.5 py-3.5 transition-colors hover:border-white/15 hover:bg-[#121215] active:scale-[0.98]"
                >
                  <span aria-hidden className="text-lg leading-none">
                    {repere.emoji}
                  </span>
                  <span
                    className="mt-2 text-[12px] font-black uppercase leading-tight tracking-wide"
                    style={{ color: repere.couleur }}
                  >
                    {repere.titre}
                  </span>
                  <span className="mt-1 text-[12px] font-medium leading-snug text-[#8A8A93]">
                    {repere.sous}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Sortir du jeu ─────────────────────────────────────────────── */}
        {/* Ce bloc était un tiroir : il fallait avoir l'idée d'appuyer sur un
            bouclier pour le trouver. C'est le seul contenu de la page dont on
            peut avoir besoin dans l'urgence. */}
        <section
          className="mt-9 rounded-3xl border border-[#10B981]/20 bg-[#08110C] px-5 py-5"
          aria-labelledby="titre-safe"
        >
          <div className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.18em] text-[#10B981]">
            <Shield size={14} aria-hidden />
            <h2 id="titre-safe">Si ce n&apos;est plus un jeu</h2>
          </div>
          <p className="mt-2.5 text-[13.5px] font-medium leading-relaxed text-[#9FBFAF]">
            Certaines situations ne se règlent pas par un vote. Le violentomètre
            et les autres échelles sont des outils d&apos;auto-évaluation
            sérieux, avec les numéros vers qui se tourner.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/ressources"
              onClick={tap}
              className="group flex items-center justify-between gap-3 rounded-xl border border-[#10B981]/15 bg-[#10B981]/6 min-h-12 px-4 py-3.5 text-[13.5px] font-bold text-[#D1FAE5] transition hover:border-[#10B981]/35 hover:bg-[#10B981]/12"
            >
              <span>Violentomètre et outils d&apos;auto-évaluation</span>
              <ArrowRight
                size={14}
                aria-hidden
                className="shrink-0 text-[#10B981] transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/a-propos"
              onClick={tap}
              className="group flex items-center justify-between gap-3 rounded-xl border border-white/6 bg-white/2 min-h-12 px-4 py-3.5 text-[13.5px] font-bold text-[#C9C9D1] transition hover:border-white/15 hover:bg-white/5"
            >
              <span>Qui fait ce site, et sur quelles données</span>
              <ArrowRight
                size={14}
                aria-hidden
                className="shrink-0 text-[#8E8E93] transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

/**
 * Une carte de jeu. Toute la carte est la cible — pas seulement un bouton en
 * bas — parce que sur un téléphone c'est le geste qu'on fait de toute façon.
 */
function CarteJeu({ jeu, onTap }: { jeu: Jeu; onTap: () => void }) {
  const contenu = (
    <>
      {/* Liseré de teinte : il identifie le jeu du coin de l'œil, au défilement. */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: jeu.couleur }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full opacity-15 blur-3xl transition-opacity duration-300 group-hover:opacity-30"
        style={{ backgroundColor: jeu.couleur }}
      />

      <div className="flex items-start gap-3">
        <span aria-hidden className="mt-0.5 text-2xl leading-none">
          {jeu.emoji}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-[19px] font-black uppercase leading-[1.1] tracking-[-0.02em] text-white sm:text-[20px]">
            {jeu.titre}
          </h3>
          <p className="mt-1.5 text-[14px] font-semibold leading-snug text-[#C4C4CC]">
            {jeu.promesse}
          </p>
          <p
            className="mt-2 text-[12px] font-black uppercase tracking-[0.06em]"
            style={{ color: jeu.couleur }}
          >
            {jeu.format}
          </p>

          {/* Le verbe, en blanc et non dans la teinte du jeu : la ligne de
              format juste au-dessus porte déjà cette teinte, et deux lignes
              de la même couleur l'une sous l'autre se lisent comme une seule.
              Ce n'est pas un bouton — toute la carte reste la cible. */}
          <p className="mt-2 text-[12px] font-black uppercase tracking-[0.1em] text-white/90">
            {jeu.action}
          </p>
        </div>

        {/* La flèche dit « ceci ouvre quelque chose » sans coûter une ligne de
            texte. Sortante pour le jeu encore hébergé ailleurs. */}
        {jeu.externe ? (
          <ArrowUpRight
            size={18}
            aria-hidden
            className="mt-1 shrink-0 text-[#6E6E78] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
          />
        ) : (
          <ArrowRight
            size={18}
            aria-hidden
            className="mt-1 shrink-0 text-[#6E6E78] transition-all group-hover:translate-x-0.5 group-hover:text-white"
          />
        )}
      </div>
    </>
  );

  const classe =
    'group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/7 bg-linear-to-br from-[#0E0E11] to-[#08080A] py-4 pl-5 pr-4 text-left transition-all hover:border-white/18 active:scale-[0.985]';

  return jeu.externe ? (
    <a
      href={jeu.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onTap}
      className={classe}
    >
      {contenu}
    </a>
  ) : (
    <Link href={jeu.href} onClick={onTap} className={classe}>
      {contenu}
    </Link>
  );
}
