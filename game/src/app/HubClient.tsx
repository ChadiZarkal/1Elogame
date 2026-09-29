'use client';

/**
 * @module app/HubClient
 * Accueil : ce que propose le site, visible sans rien toucher.
 *
 * La version précédente était un carrousel à onglets. Un seul jeu sur quatre
 * était rendu ; les trois autres se résumaient à des intitulés de 7,5 px dans
 * une rangée d'onglets. Or la seule question d'un visiteur qui arrive ici est
 * « qu'est-ce qu'on peut faire ? », et y répondre demandait quatre gestes sur
 * des cibles qu'on ne pouvait pas lire. La contrainte de tout faire tenir dans
 * une fenêtre sans défilement avait poussé la typographie sous le seuil de
 * lisibilité ; les points de rupture `max-height` ne faisaient que répartir la
 * pénurie.
 *
 * La page suit maintenant l'ordre des questions qu'on se pose en arrivant :
 *
 *   1. C'est quoi ?          — le logo, une phrase, le nombre de votes.
 *   2. Je fais quoi ?        — les deux jeux phares, le Red Flag Test et
 *                              « C'est un 10 mais… », chacun avec son vrai
 *                              bouton. Les deux boutons tiennent dans le
 *                              premier écran d'un téléphone courant.
 *   3. Il y a quoi d'autre ? — L'Oracle et Le pire des deux, en rangées plus
 *                              légères : présents, entiers, mais sans
 *                              disputer l'attention aux deux premiers.
 *   4. C'est sérieux ?       — ce que les votes ont réellement donné.
 *   5. Et si ça ne va pas ?  — les repères, puis l'aide, en clair.
 *
 * Deux niveaux plutôt que quatre cartes de même poids : face à des choix
 * équivalents, on hésite, et l'hésitation se paie en départs. La hiérarchie
 * visuelle reprend celle du site — deux jeux qui portent l'essentiel, deux
 * qui le complètent.
 *
 * Les deux tiroirs ont disparu. « Comment jouer » redisait, derrière un
 * bouton, ce que chaque carte dit désormais sur la page. « Safe zone » cachait
 * le seul contenu du site qui ne devrait jamais demander un geste pour
 * apparaître.
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Trophy } from 'lucide-react';
import { useHaptics } from '@/lib/hooks';

type Jeu = {
  id: string;
  /** Teinte du jeu en aplat : liseré, bouton, halo. */
  couleur: string;
  /**
   * La même teinte, éclaircie, pour le texte. Un accent saturé en petites
   * capitales sur fond sombre vibre ; en aplat, il ne pose aucun problème.
   */
  couleurTexte: string;
  emoji: string;
  titre: string;
  /** Une phrase : ce qu'on fait, pas ce que c'est. */
  promesse: string;
  /** Le verbe. Un titre et une flèche disent qu'il se passe quelque chose, pas quoi. */
  action: string;
  href: string;
  /**
   * Pour les jeux phares : une miniature de la mécanique, à côté du bouton.
   * Montrer vaut mieux que décrire — une jauge qui cherche sa place dit
   * « score en % » sans un mot, une note qui chute dit « le 10 ne tiendra pas ».
   */
  apercu?: 'jauge' | 'note';
};

/**
 * Les deux jeux phares du site. L'ordre du tableau est l'ordre de la page :
 * le Red Flag Test d'abord, parce qu'il parle de la personne qui joue.
 */
const PHARES: Jeu[] = [
  {
    id: 'redflagtest',
    couleur: '#FFB4AA',
    couleurTexte: '#FFC4BC',
    emoji: '🧪',
    titre: 'RED FLAG TEST',
    promesse: 'Ce que les autres voient comme red flag chez toi.',
    action: 'Faire le test',
    href: '/redflagtest',
    apercu: 'jauge',
  },
  {
    id: 'dixmais',
    couleur: '#F59E0B',
    couleurTexte: '#FFC04D',
    emoji: '⭐',
    titre: "C'EST UN 10 MAIS…",
    promesse: 'Il part de 10 sur 10. Cinq révélations le font chuter.',
    action: 'Noter un profil',
    href: '/dixmais',
    apercu: 'note',
  },
];

/** Les jeux d'appoint. Le pire des deux ferme la liste : choix éditorial. */
const AUTRES_JEUX: Jeu[] = [
  {
    id: 'oracle',
    couleur: '#88CEFF',
    couleurTexte: '#A8DBFF',
    emoji: '🔮',
    titre: "L'ORACLE",
    promesse: 'Tu racontes ta situation, l’IA tranche.',
    action: 'Soumettre mon cas',
    href: '/flagornot',
  },
  {
    id: 'jeu',
    couleur: '#2ECC71',
    couleurTexte: '#5FE39B',
    emoji: '🔥',
    titre: 'LE PIRE DES DEUX',
    promesse: 'Deux comportements, tu désignes le plus grave.',
    action: 'Lancer un duel',
    href: '/jeu',
  },
];

/** Ce qu'on vient lire plutôt que jouer. */
const REPERES: { emoji: string; titre: string; sous: string; href: string; couleur: string }[] = [
  {
    emoji: '🚩',
    titre: 'GUIDE DES FLAGS',
    sous: 'Green, white, orange, red, black : ce que chaque couleur veut dire',
    href: '/guide',
    couleur: '#5FE39B',
  },
  {
    emoji: '📊',
    titre: "L'OBSERVATOIRE",
    sous: 'Là où hommes, femmes et générations ne sont pas d’accord',
    href: '/observatoire',
    couleur: '#A8DBFF',
  },
];

/** Ce que `page.tsx` a pu lire. `null` et liste vide = base muette. */
export type DonneesHub = {
  votes: number | null;
  comportementsClasses: number | null;
  pires: { rang: number; texte: string; votes: number }[];
  /** Les deux bouts du classement, pour le bandeau. Listes vides = pas de bandeau. */
  bande: { rouges: string[]; verts: string[] };
};

/** Séparateur de milliers français, pour que 128394 se lise. */
const nombre = new Intl.NumberFormat('fr-FR');

/**
 * Anneau de focus commun. Toute la page se parcourt au clavier ; sans lui, la
 * position courante n'était visible nulle part sur ce fond sombre.
 */
const FOCUS =
  'outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]';

/** Intitulé de section : même style partout, pour que la page se lise en rayons. */
function TitreSection({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-3 flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.2em] text-(--text-2)"
    >
      {children}
    </h2>
  );
}

export function HubClient({ votes, comportementsClasses, pires, bande }: DonneesHub) {
  const { tap } = useHaptics();

  return (
    <div className="relative min-h-svh text-(--text-1) selection:bg-[#FF3B30]/30 selection:text-white">
      {/* Décor. `fixed` : la page défile, et un halo ancré en haut du document
          disparaîtrait au premier écran. `will-change` le fait composer une
          fois pour toutes plutôt que repeindre ses flous à chaque image. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden will-change-transform"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141417_1px,transparent_1px),linear-gradient(to_bottom,#141417_1px,transparent_1px)] bg-size-[32px_32px] opacity-60" />
        <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#FF3B30] opacity-15 blur-[110px]" />
        <div className="absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-[#2ECC71] opacity-10 blur-[100px]" />
      </div>

      <main
        id="main-content"
        className="relative z-10 mx-auto w-full max-w-110 px-4 pb-16 min-[360px]:px-5 sm:max-w-2xl sm:px-8"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        {/* ── 1. C'est quoi ? ────────────────────────────────────────────── */}
        <header className="flex flex-col items-center text-center">
          <h1>
            <Image
              src="/logo-rog-new.svg"
              /* Le nom accessible du h1 : Google le lit comme le titre de la
                 page. */
              alt="Red or Green — le Red Flag Test et les jeux de red flags"
              /* 192 × 86 : les dimensions réelles du fichier. */
              width={192}
              height={86}
              priority
              draggable={false}
              /* La taille d'avant la refonte, rétablie : 62 % de la largeur
                 sur téléphone, 88 % sur les écrans hauts, jamais plus de
                 460 px. Le logo est la marque ; réduit à 128 px, il ne
                 pesait plus rien au-dessus des cartes. */
              className="h-auto w-[88vw] max-w-115 object-contain drop-shadow-[0_0_28px_rgba(255,59,48,0.3)] [@media(max-height:1000px)]:w-[62vw]"
            />
          </h1>

          <p className="mt-2 max-w-[30ch] text-[16px] font-semibold leading-snug text-(--text-1)">
            « Red flag » désigne tout et n&apos;importe quoi. Ici, les joueurs
            tranchent.
          </p>
          {/* Le chiffre remplace un adjectif : « les joueurs tranchent » ne
              veut rien dire tant qu'on ne sait pas combien ils sont. S'il
              manque, la ligne se réduit aux garanties.
              « Sans pub » a disparu de cette ligne : des annonces sont
              servies sur le site, la promesse était fausse. */}
          <p className="mt-1.5 text-[12px] font-black uppercase tracking-[0.14em] text-(--text-3)">
            {votes !== null && votes > 0 && (
              <>
                <span className="text-(--text-2)">{nombre.format(votes)} votes</span>
                {' · '}
              </>
            )}
            Sans compte · anonyme
          </p>
        </header>

        {/* ── 2. Je fais quoi ? ──────────────────────────────────────────── */}
        <section className="mt-4" aria-labelledby="titre-phares">
          <TitreSection id="titre-phares">Les deux jeux phares</TitreSection>
          {/* Côte à côte dès qu'il y a la place : deux cartes de même poids
              disent « l'un ou l'autre », là où deux cartes empilées se lisent
              comme un premier et un second. */}
          <ul className="grid gap-3 sm:grid-cols-2">
            {PHARES.map((jeu, i) => (
              <li key={jeu.id} className="entree" style={{ ['--rang' as string]: i }}>
                <CartePhare jeu={jeu} onTap={tap} />
              </li>
            ))}
          </ul>
        </section>

        {/* ── 3. Il y a quoi d'autre ? ───────────────────────────────────── */}
        <section className="mt-5" aria-labelledby="titre-jeux">
          <TitreSection id="titre-jeux">Et aussi</TitreSection>
          <ul className="grid gap-2 sm:grid-cols-2">
            {AUTRES_JEUX.map((jeu) => (
              <li key={jeu.id}>
                <CarteJeu jeu={jeu} onTap={tap} />
              </li>
            ))}
          </ul>
        </section>

        {/* ── 4. C'est sérieux ? ─────────────────────────────────────────── */}
        {/* Rendu seulement s'il y a de quoi le remplir : un podium vide, ou à
            une ligne, dit moins que pas de podium du tout.

            Le bandeau reprend l'idée de celui qu'avait l'accueil — des
            comportements qui défilent — mais plus son contenu : l'ancien était
            écrit à la main, décoratif, à 15 % d'opacité. Celui-ci est lu dans
            le classement, régénéré toutes les cinq minutes : ce qui défile est
            ce que les joueurs ont réellement tranché. */}
        {pires.length >= 3 && (
          <section className="revele mt-10" aria-labelledby="titre-palmares">
            <TitreSection id="titre-palmares">
              <Trophy size={13} aria-hidden className="text-[#F59E0B]" />
              Le verdict des joueurs
            </TitreSection>

            {/* Pleine largeur : le bandeau déborde des marges de la page, ce
                qui dit qu'il continue au-delà de l'écran. */}
            <div className="-mx-4 flex flex-col gap-2 min-[360px]:-mx-5 sm:mx-0">
              <Bandeau
                textes={bande.rouges}
                libelle="Jugés les plus graves"
                puce="🚩"
                teinte="#FF6B5E"
              />
              <Bandeau
                textes={bande.verts}
                libelle="Jugés les moins graves"
                puce="🟢"
                teinte="#5FE39B"
                inverse
              />
            </div>

            <h3 className="mt-5 mb-2 text-[12px] font-black uppercase tracking-[0.16em] text-(--text-3)">
              Les trois pires
            </h3>
            <ol className="overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-1)">
              {pires.map((pire) => (
                <li
                  key={pire.rang}
                  className="flex items-start gap-3 border-b border-(--border-subtle) px-4 py-3 last:border-b-0"
                >
                  <span
                    aria-hidden
                    className="mt-px w-5 shrink-0 text-[16px] font-black tabular-nums text-[#FFC04D]"
                  >
                    {pire.rang}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold leading-snug text-(--text-1)">
                      {pire.texte}
                    </span>
                    {/* Un comportement fraîchement ajouté n'a pas encore été
                        soumis : « 0 votes » sous une place de podium se lit
                        comme une erreur. */}
                    {pire.votes > 0 && (
                      <span className="mt-0.5 block text-[12px] font-bold uppercase tracking-wide text-(--text-3)">
                        {nombre.format(pire.votes)} votes
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>

            <LienLigne href="/classement" onTap={tap} fleche="text-[#FFC04D]">
              {comportementsClasses !== null && comportementsClasses > 0
                ? `Le classement complet — ${nombre.format(comportementsClasses)} comportements`
                : 'Le classement complet'}
            </LienLigne>
          </section>
        )}

        {/* ── 5a. Comprendre ─────────────────────────────────────────────── */}
        <section className="revele mt-10" aria-labelledby="titre-reperes">
          <TitreSection id="titre-reperes">Comprendre</TitreSection>
          <ul className="grid grid-cols-2 gap-3">
            {REPERES.map((repere) => (
              <li key={repere.href}>
                <Link
                  href={repere.href}
                  onClick={tap}
                  className={`group flex h-full flex-col rounded-2xl border border-(--border-subtle) bg-(--surface-1) p-4 transition-colors hover:bg-(--surface-2) motion-safe:active:scale-[0.98] ${FOCUS}`}
                >
                  <span aria-hidden className="text-xl leading-none">
                    {repere.emoji}
                  </span>
                  <span
                    className="mt-2 text-[12px] font-black uppercase leading-tight tracking-wide"
                    style={{ color: repere.couleur }}
                  >
                    {repere.titre}
                  </span>
                  <span className="mt-1 text-[13px] font-medium leading-snug text-(--text-2)">
                    {repere.sous}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── 5b. Et si ça ne va pas ? ───────────────────────────────────── */}
        {/* Ce bloc était un tiroir : il fallait avoir l'idée d'appuyer sur un
            bouclier pour le trouver. C'est le seul contenu de la page dont on
            peut avoir besoin dans l'urgence. */}
        <section
          className="revele mt-10 rounded-3xl border border-[#10B981]/25 bg-[#08110C] p-5"
          aria-labelledby="titre-safe"
        >
          <div className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.18em] text-[#34D399]">
            <Shield size={14} aria-hidden />
            <h2 id="titre-safe">Si ce n&apos;est plus un jeu</h2>
          </div>
          <p className="mt-2 text-[15px] font-medium leading-relaxed text-[#A7C9B8]">
            Certaines situations ne se règlent pas par un vote. Le violentomètre
            et les autres échelles sont des outils d&apos;auto-évaluation
            sérieux, avec les numéros vers qui se tourner.
          </p>
          <div className="mt-4 flex flex-col">
            <LienLigne href="/ressources" onTap={tap} fleche="text-[#34D399]" vert>
              Violentomètre et outils d&apos;auto-évaluation
            </LienLigne>
            <LienLigne href="/a-propos" onTap={tap} fleche="text-(--text-3)">
              Qui fait ce site, et sur quelles données
            </LienLigne>
          </div>
        </section>
      </main>
    </div>
  );
}

/**
 * Un jeu phare. Toute la carte est la cible ; le bouton en bas n'en est que
 * la partie la plus visible — il dit où appuyer à qui hésite, sans être un
 * lien dans le lien.
 *
 * Compacte à dessein : les deux boutons tiennent dans le premier écran, et le
 * haut de la section suivante dépasse sous eux. Deux cartes qui remplissaient
 * tout l'écran laissaient croire que la page s'arrêtait là.
 */
function CartePhare({ jeu, onTap }: { jeu: Jeu; onTap: () => void }) {
  return (
    <Link
      href={jeu.href}
      onClick={onTap}
      /* La bordure n'est pas une `border` : c'est le fond de ce lien, visible
         sur 1 px autour de la carte intérieure. Un trait de lumière y tourne
         — l'effet « border beam » de Magic UI, refait en CSS : un dégradé
         conique en rotation, masqué par la carte. Seule `rotate` est animée,
         que le navigateur compose sans repeindre. */
      className={`group relative block h-full overflow-hidden rounded-3xl p-px motion-safe:active:scale-[0.99] motion-safe:transition-transform ${FOCUS}`}
      style={{ backgroundColor: `${jeu.couleur}38` }}
    >
      <span
        aria-hidden
        className="bordure-tournante pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[220%]"
        style={{
          background: `conic-gradient(from 0deg, transparent 0 68%, ${jeu.couleur} 86%, transparent 100%)`,
        }}
      />

      <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(1.5rem-1px)] bg-(--surface-1) p-4 transition-colors group-hover:bg-(--surface-2)">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: jeu.couleur }}
        />

        {/* Pas de ligne de format ici : ces deux cartes doivent laisser voir
            la suite de la page dès le premier écran, pour qu'on comprenne
            qu'il faut descendre. « Sans compte · anonyme » est dit sous le
            logo. */}
        <div className="relative flex items-center gap-2.5">
          <span aria-hidden className="text-2xl leading-none">
            {jeu.emoji}
          </span>
          <h3 className="min-w-0 flex-1 text-[20px] font-black uppercase leading-[1.05] tracking-[-0.02em] text-white">
            {jeu.titre}
          </h3>
        </div>

        <span className="relative mt-2 block text-[15px] font-semibold leading-snug text-(--text-1)">
          {jeu.promesse}
        </span>
        <span aria-hidden className="block h-3 shrink-0" />

        {/* Le bouton et, à sa droite, la miniature de la mécanique : la même
            rangée, donc aucune hauteur de plus. 44 px, le minimum pour une
            cible tactile. `mt-auto` aligne les rangées quand les cartes sont
            côte à côte. Texte noir sur la teinte du jeu : plus de 10:1. */}
        <span className="relative mt-auto flex items-center justify-between gap-3">
          <span
            className="flex h-11 items-center gap-2 rounded-xl px-4 text-[14px] font-black uppercase tracking-[0.06em] text-black shadow-[0_8px_30px_-8px_var(--halo)] transition-[filter] group-hover:brightness-110"
            style={{ backgroundColor: jeu.couleur, ['--halo' as string]: `${jeu.couleur}80` }}
          >
            {jeu.action}
            <ArrowRight
              size={17}
              strokeWidth={2.75}
              aria-hidden
              className="transition-transform motion-safe:group-hover:translate-x-0.5"
            />
          </span>
          {jeu.apercu === 'jauge' && <ApercuJauge />}
          {jeu.apercu === 'note' && <ApercuNote />}
        </span>
      </div>
    </Link>
  );
}

/**
 * La jauge du Red Flag Test, en miniature : du vert au rouge, un curseur qui
 * cherche sa place. Elle ne montre aucun score — elle dit qu'il y en aura un,
 * et qu'il se lit sur cette échelle.
 */
function ApercuJauge() {
  return (
    <span aria-hidden className="flex w-18 shrink-0 flex-col items-end gap-1.5">
      <span className="text-[12px] font-black tabular-nums tracking-wide text-(--text-2)">?? %</span>
      <span className="relative h-1.5 w-full rounded-full bg-[linear-gradient(90deg,#2ECC71,#F59E0B_55%,#FF3B30)]">
        {/* La course occupe toute la piste : c'est elle qui glisse, en
            pourcentage de sa propre largeur — donc de celle de la jauge. */}
        <span className="jauge-course absolute inset-0">
          <span className="absolute -left-0.75 top-1/2 h-3.5 w-1.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
        </span>
      </span>
    </span>
  );
}

/**
 * La note de « C'est un 10 mais… », en miniature : elle part de 10 et chute,
 * révélation après révélation. Un compteur à rouleau en CSS — la colonne de
 * chiffres glisse derrière une fenêtre d'un chiffre de haut.
 */
function ApercuNote() {
  return (
    <span aria-hidden className="flex shrink-0 items-baseline gap-1">
      <span className="note-fenetre relative block h-7 overflow-hidden text-[24px] font-black leading-7 tabular-nums">
        <span className="note-rouleau flex flex-col items-end">
          <span className="text-[#FFC04D]">10</span>
          <span className="text-[#FFC04D]">8</span>
          <span className="text-[#FF9F43]">6</span>
          <span className="text-[#FF6B5E]">3</span>
          <span className="text-[#FFC04D]">10</span>
        </span>
      </span>
      <span className="text-[12px] font-black text-(--text-3)">/10</span>
    </span>
  );
}

/**
 * Une rangée du bandeau. Deux copies identiques côte à côte, décalées de
 * -50 % : la boucle ne se voit pas. La seconde est cachée aux lecteurs d'écran,
 * qui lisent la liste une fois. Sous `prefers-reduced-motion`, rien ne bouge
 * et la rangée se fait défiler au doigt.
 */
function Bandeau({
  textes,
  libelle,
  puce,
  teinte,
  inverse = false,
}: {
  textes: string[];
  libelle: string;
  puce: string;
  teinte: string;
  inverse?: boolean;
}) {
  // Sous quatre, la boucle se remarque : mieux vaut pas de rangée.
  if (textes.length < 4) return null;

  return (
    <div className="bandeau overflow-hidden">
      <div className={`bandeau-piste ${inverse ? 'bandeau-piste--inverse' : ''}`}>
        {[0, 1].map((copie) => (
          <ul
            key={copie}
            aria-label={copie === 0 ? libelle : undefined}
            aria-hidden={copie === 1 ? true : undefined}
            className="flex shrink-0 gap-2 pr-2"
          >
            {textes.map((texte) => (
              <li
                key={texte}
                /* La teinte de la rangée sur la bordure seule : le texte
                   reste clair, lisible, et la rangée se reconnaît de loin. */
                className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border bg-(--surface-1) px-3.5 text-[13px] font-semibold text-(--text-1)"
                style={{ borderColor: `${teinte}40` }}
              >
                <span aria-hidden>{puce}</span>
                {texte}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/**
 * Un jeu d'appoint : une rangée, pas une carte. Moins haute, sans ligne de
 * format, titre plus petit — elle doit se lire comme « il y a aussi ça », pas
 * comme une troisième option de même rang. Toute la rangée est la cible.
 */
function CarteJeu({ jeu, onTap }: { jeu: Jeu; onTap: () => void }) {
  return (
    <Link
      href={jeu.href}
      onClick={onTap}
      className={`group relative flex h-full items-center overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-1) py-3 pl-5 pr-4 transition-colors hover:bg-(--surface-2) motion-safe:active:scale-[0.985] ${FOCUS}`}
    >
      {/* Liseré de teinte : il identifie le jeu du coin de l'œil, au défilement. */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: jeu.couleur }}
      />

      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span aria-hidden className="mt-0.5 text-xl leading-none">
          {jeu.emoji}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-black uppercase leading-[1.1] tracking-[-0.01em] text-white">
            {jeu.titre}
          </h3>
          <p className="mt-1 text-[14px] font-medium leading-snug text-(--text-2)">
            {jeu.promesse}
          </p>
          {/* Le verbe, dans la teinte du jeu : c'est la seule ligne colorée
              de la rangée, elle identifie le jeu au défilement. */}
          <p
            className="mt-1.5 flex items-center gap-1.5 text-[12px] font-black uppercase tracking-[0.1em]"
            style={{ color: jeu.couleurTexte }}
          >
            {jeu.action}
            <ArrowRight
              size={14}
              strokeWidth={2.5}
              aria-hidden
              className="transition-transform motion-safe:group-hover:translate-x-0.5"
            />
          </p>
        </div>
      </div>
    </Link>
  );
}

/** Lien pleine largeur, à flèche. 48 px de haut au minimum : une cible sûre. */
function LienLigne({
  href,
  onTap,
  fleche,
  vert = false,
  children,
}: {
  href: string;
  onTap: () => void;
  /** Classe de couleur de la flèche. */
  fleche: string;
  /** Variante du bloc d'aide. */
  vert?: boolean;
  children: React.ReactNode;
}) {
  const surface = vert
    ? 'border-[#10B981]/20 bg-[#10B981]/8 text-[#D1FAE5] hover:bg-[#10B981]/14'
    : 'border-(--border-subtle) bg-white/3 text-(--text-1) hover:bg-white/6';

  return (
    <Link
      href={href}
      onClick={onTap}
      className={`group mt-3 flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-[14px] font-bold transition-colors first:mt-0 ${surface} ${FOCUS}`}
    >
      <span>{children}</span>
      <ArrowRight
        size={16}
        aria-hidden
        className={`shrink-0 transition-transform motion-safe:group-hover:translate-x-0.5 ${fleche}`}
      />
    </Link>
  );
}
