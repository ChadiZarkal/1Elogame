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
 *   2. Je fais quoi ?        — un point d'entrée recommandé, avec un vrai
 *                              bouton, placé à mi-écran : là où le pouce
 *                              tombe sans effort.
 *   3. Il y a quoi d'autre ? — les trois autres jeux, posés les uns sous les
 *                              autres, chacun avec sa promesse et son format.
 *   4. C'est sérieux ?       — ce que les votes ont réellement donné.
 *   5. Et si ça ne va pas ?  — les repères, puis l'aide, en clair.
 *
 * Un point d'entrée unique plutôt que quatre cartes de même poids : face à
 * des choix équivalents, on hésite, et l'hésitation se paie en départs. Les
 * autres jeux restent visibles, entiers, dès le premier écran — la
 * recommandation oriente, elle ne cache rien.
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
  /** Format et durée. On choisit surtout là-dessus. */
  format: string;
  /** Le verbe. Un titre et une flèche disent qu'il se passe quelque chose, pas quoi. */
  action: string;
  href: string;
};

/**
 * Le point d'entrée. Le Red Flag Test est le seul jeu qui parle de la
 * personne qui joue, et le seul dont le résultat se partage : c'est lui qui
 * répond le mieux à « par où je commence ? ».
 */
const VEDETTE: Jeu = {
  id: 'redflagtest',
  couleur: '#FFB4AA',
  couleurTexte: '#FFC4BC',
  emoji: '🧪',
  titre: 'RED FLAG TEST',
  promesse: 'Ce que les autres voient comme red flag chez toi.',
  format: 'Solo · anonyme · score en %',
  action: 'Faire le test',
  href: '/redflagtest',
};

/**
 * L'ordre de ce tableau est l'ordre de la page. Le pire des deux ferme la
 * liste : choix éditorial.
 */
const AUTRES_JEUX: Jeu[] = [
  {
    id: 'dixmais',
    couleur: '#F59E0B',
    couleurTexte: '#FFC04D',
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
    couleurTexte: '#A8DBFF',
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
    couleurTexte: '#5FE39B',
    emoji: '🔥',
    titre: 'LE PIRE DES DEUX',
    promesse: 'Deux comportements, tu désignes le plus grave.',
    format: 'Solo ou à plusieurs · 2 min',
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

export function HubClient({ votes, comportementsClasses, pires }: DonneesHub) {
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
        className="relative z-10 mx-auto w-full max-w-110 px-4 pb-16 min-[360px]:px-5 sm:max-w-xl sm:px-8"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        {/* ── 1. C'est quoi ? ────────────────────────────────────────────── */}
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
              className="h-auto w-40 object-contain drop-shadow-[0_0_28px_rgba(255,59,48,0.3)] min-[390px]:w-48 sm:w-56"
            />
          </h1>

          <p className="mt-3 max-w-[30ch] text-[16px] font-semibold leading-snug text-(--text-1)">
            « Red flag » désigne tout et n&apos;importe quoi. Ici, les joueurs
            tranchent.
          </p>
          {/* Le chiffre remplace un adjectif : « les joueurs tranchent » ne
              veut rien dire tant qu'on ne sait pas combien ils sont. S'il
              manque, la ligne se réduit aux garanties.
              « Sans pub » a disparu de cette ligne : des annonces sont
              servies sur le site, la promesse était fausse. */}
          <p className="mt-2 text-[12px] font-black uppercase tracking-[0.14em] text-(--text-3)">
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
        <section className="mt-6" aria-labelledby="titre-depart">
          <TitreSection id="titre-depart">Commence par là</TitreSection>
          <CarteVedette jeu={VEDETTE} onTap={tap} />
        </section>

        {/* ── 3. Il y a quoi d'autre ? ───────────────────────────────────── */}
        <section className="mt-8" aria-labelledby="titre-jeux">
          <TitreSection id="titre-jeux">Les autres jeux</TitreSection>
          <ul className="grid gap-3">
            {AUTRES_JEUX.map((jeu) => (
              <li key={jeu.id}>
                <CarteJeu jeu={jeu} onTap={tap} />
              </li>
            ))}
          </ul>
        </section>

        {/* ── 4. C'est sérieux ? ─────────────────────────────────────────── */}
        {/* Rendu seulement s'il y a de quoi le remplir : un podium vide, ou à
            une ligne, dit moins que pas de podium du tout. */}
        {pires.length >= 3 && (
          <section className="mt-10" aria-labelledby="titre-palmares">
            <TitreSection id="titre-palmares">
              <Trophy size={13} aria-hidden className="text-[#F59E0B]" />
              Les pires, d&apos;après les votes
            </TitreSection>

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
        <section className="mt-10" aria-labelledby="titre-reperes">
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
          className="mt-10 rounded-3xl border border-[#10B981]/25 bg-[#08110C] p-5"
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
 * Le point d'entrée recommandé. Toute la carte est la cible ; le bouton en
 * bas n'en est que la partie la plus visible — il dit où appuyer à qui
 * hésite, sans être un lien dans le lien.
 */
function CarteVedette({ jeu, onTap }: { jeu: Jeu; onTap: () => void }) {
  return (
    <Link
      href={jeu.href}
      onClick={onTap}
      className={`group relative block overflow-hidden rounded-3xl border bg-(--surface-1) p-5 transition-colors hover:bg-(--surface-2) motion-safe:active:scale-[0.99] ${FOCUS}`}
      style={{ borderColor: `${jeu.couleur}40` }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: jeu.couleur }}
      />

      <div className="relative flex items-start gap-3">
        <span aria-hidden className="text-3xl leading-none">
          {jeu.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[23px] font-black uppercase leading-none tracking-[-0.02em] text-white">
            {jeu.titre}
          </h3>
          <p
            className="mt-2 text-[12px] font-black uppercase tracking-[0.08em]"
            style={{ color: jeu.couleurTexte }}
          >
            <Format texte={jeu.format} />
          </p>
        </div>
      </div>

      <p className="relative mt-3 text-[16px] font-semibold leading-snug text-(--text-1)">
        {jeu.promesse}
      </p>

      {/* 52 px de haut : au-dessus des 44 recommandés, pour la seule action
          que la page pousse. Texte noir sur la teinte du jeu : plus de 12:1. */}
      <span
        className="relative mt-4 flex h-13 items-center justify-center gap-2 rounded-2xl text-[15px] font-black uppercase tracking-[0.08em] text-black shadow-[0_8px_30px_-8px_var(--halo)] transition-[filter] group-hover:brightness-110"
        style={{ backgroundColor: jeu.couleur, ['--halo' as string]: `${jeu.couleur}80` }}
      >
        {jeu.action}
        <ArrowRight
          size={18}
          strokeWidth={2.75}
          aria-hidden
          className="transition-transform motion-safe:group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}

/**
 * Un jeu secondaire. Toute la carte est la cible — sur un téléphone, c'est le
 * geste qu'on fait de toute façon.
 */
function CarteJeu({ jeu, onTap }: { jeu: Jeu; onTap: () => void }) {
  return (
    <Link
      href={jeu.href}
      onClick={onTap}
      className={`group relative flex h-full overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-1) py-4 pl-5 pr-4 transition-colors hover:bg-(--surface-2) motion-safe:active:scale-[0.985] ${FOCUS}`}
    >
      {/* Liseré de teinte : il identifie le jeu du coin de l'œil, au défilement. */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: jeu.couleur }}
      />

      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span aria-hidden className="mt-0.5 text-2xl leading-none">
          {jeu.emoji}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-[19px] font-black uppercase leading-[1.1] tracking-[-0.02em] text-white">
            {jeu.titre}
          </h3>
          <p className="mt-1.5 text-[15px] font-semibold leading-snug text-(--text-2)">
            {jeu.promesse}
          </p>
          <p
            className="mt-2 text-[12px] font-black uppercase tracking-[0.06em]"
            style={{ color: jeu.couleurTexte }}
          >
            <Format texte={jeu.format} />
          </p>
          {/* Le verbe, en blanc et non dans la teinte du jeu : deux lignes de
              la même couleur l'une sous l'autre se liraient comme une seule. */}
          <p className="mt-2 flex items-center gap-1.5 text-[12px] font-black uppercase tracking-[0.1em] text-(--text-1)">
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

/**
 * Une ligne de format ne se coupe qu'entre ses éléments, jamais au milieu
 * d'un : à 320 px, « SCORE EN % » laissait son « % » seul sur une ligne.
 */
function Format({ texte }: { texte: string }) {
  const parties = texte.split(' · ');
  return (
    <>
      {parties.map((partie, i) => (
        <span key={partie}>
          {/* Le point reste collé à ce qui le précède : une ligne ne
              commence jamais par « · ». */}
          <span className="whitespace-nowrap">
            {partie}
            {i < parties.length - 1 && ' ·'}
          </span>
          {i < parties.length - 1 && ' '}
        </span>
      ))}
    </>
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
