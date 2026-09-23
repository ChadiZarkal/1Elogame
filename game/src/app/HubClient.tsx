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
  /** Teinte du jeu, en aplat : liseré, halo. Inchangée depuis l'origine. */
  couleur: string;
  /**
   * La même teinte, pour du texte. Une couleur pleine saturation en capitales
   * sur fond sombre vibre optiquement ; la variante est un peu plus claire et
   * un peu moins chromatique. Voir docs/DESIGN-MOBILE-RECHERCHE.md §4.4.
   */
  couleurTexte: string;
  emoji: string;
  titre: string;
  /** Une phrase : ce qu'on fait, pas ce que c'est. Deux lignes au plus. */
  promesse: string;
  /** Format et durée. Le visiteur choisit surtout là-dessus. */
  format: string;
  /**
   * Le verbe. Un titre et une flèche disent qu'il se passe quelque chose, pas
   * quoi — la recherche sur les intitulés est constante là-dessus : verbe +
   * objet, tourné vers le résultat pour la personne. La version à onglets
   * disait « FAIRE LE TEST » ; la refonte l'avait perdu.
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
    couleurTexte: '#FFC4BC',
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

export function HubClient({ votes, comportementsClasses, pires }: DonneesHub) {
  const { tap } = useHaptics();

  /* Pas de fond sur la racine : `body` porte déjà `--bg-primary` (#0A0A0B),
     qui n'est délibérément pas du noir pur. Cette page posait `bg-black`
     par-dessus, et contournait donc le jeton du site pour rien.

     `svh` et non `dvh` : `dvh` suit la barre d'outils du navigateur mobile,
     qui apparaît et disparaît au défilement, et se recalcule donc pendant
     qu'on défile. Pour une *hauteur minimale*, la petite hauteur suffit et
     ne bouge pas. */
  return (
    <div className="relative min-h-svh text-[var(--text-1)] selection:bg-[#FF3B30]/30 selection:text-white">
      {/* Décor. `fixed` plutôt qu'`absolute` : la page défile désormais, et un
          halo ancré en haut du document disparaîtrait au premier écran. */}
      {/* Ce calque est `fixed` sous une page qui défile : on veut qu'il soit
          composé une fois plutôt que repeint à chaque image.

          La promotion passe par `will-change` et non par un `translateZ(0)` :
          non parce que celui-ci ne marcherait pas, mais parce qu'il n'est pas
          vérifiable. `translateZ(0)` *est* la matrice identité, et la propriété
          calculée d'un élément promu de cette façon est indistinguable de celle
          d'un élément qui ne l'est pas. `will-change` demande la même chose au
          navigateur et se lit dans la feuille calculée, donc se teste.

          L'avertissement habituel contre `will-change` — ne pas épingler un
          calque en permanence — ne s'applique pas ici : ce calque est unique,
          décoratif, et son contenu ne change jamais. C'est exactement le cas
          où l'épingler est ce qu'on veut.

          Ce que vaut ce calque, mesuré plutôt que supposé : les deux halos
          sont des `filter: blur()` sur des aplats de couleur, et non des
          `backdrop-filter` — la page n'en compte aucun. La différence est
          celle du coût : un `backdrop-filter` rééchantillonne ce qu'il y a
          derrière, un `filter` sur un aplat n'a rien à rééchantillonner. Et
          les deux halos font 320 × 320 et 256 × 256, sous le seuil au-delà
          duquel un grand rayon commence à coûter. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden will-change-transform"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-size-[32px_32px] opacity-60" />
        <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#FF3B30] opacity-15 blur-[110px]" />
        <div className="absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-[#2ECC71] opacity-10 blur-[100px]" />
      </div>

      <main
        id="main-content"
        className="relative z-10 mx-auto w-full max-w-110 px-4 pb-16 sm:max-w-3xl sm:px-8"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}
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
          <p className="mt-4 max-w-[36ch] text-[16px] font-semibold leading-relaxed text-[var(--text-2)] [@media(max-height:700px)]:mt-3">
            « Red flag » désigne tout et n&apos;importe quoi. Ici, les joueurs
            tranchent.
          </p>
          {/* Le chiffre remplace un adjectif. « Ce sont les joueurs qui
              tranchent » ne veut rien dire tant qu'on ne sait pas combien ils
              sont ; s'il manque, la ligne se réduit aux garanties. */}
          <p className="mt-3 text-[12px] font-black uppercase tracking-[0.16em] text-[var(--text-3)] [@media(max-height:700px)]:mt-2">
            {votes !== null && votes > 0 && (
              <>
                <span className="text-[var(--text-2)]">{nombre.format(votes)} votes</span>
                {' · '}
              </>
            )}
            Sans compte · sans pub
          </p>
        </header>

        {/* ── Les jeux ──────────────────────────────────────────────────── */}
        <section className="mt-6 [@media(max-height:700px)]:mt-4" aria-labelledby="titre-jeux">
          <h2
            id="titre-jeux"
            className="mb-3 text-[12px] font-black uppercase tracking-[0.2em] text-[var(--text-2)]"
          >
            Les jeux
          </h2>

          <ul className="grid gap-3 sm:grid-cols-2">
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
          <section className="mt-8" aria-labelledby="titre-palmares">
            <h2
              id="titre-palmares"
              className="mb-3 flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.2em] text-[var(--text-2)]"
            >
              <Trophy size={13} aria-hidden className="text-[#FFC04D]" />
              Les pires, d&apos;après les votes
            </h2>

            <ol className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)]">
              {pires.map((pire) => (
                <li
                  key={pire.rang}
                  className="flex items-start gap-3 border-b border-[var(--border-subtle)] px-4 py-4 last:border-b-0"
                >
                  <span
                    aria-hidden
                    className="mt-px w-6 shrink-0 text-[16px] font-black tabular-nums text-[#FFC04D]"
                  >
                    {pire.rang}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-semibold leading-snug text-[var(--text-1)]">
                      {pire.texte}
                    </span>
                    {/* Un comportement fraîchement ajouté n'a pas encore été
                        soumis : « 0 votes » sous une place de podium se lit
                        comme une erreur. Pas de compte, pas de ligne. */}
                    {pire.votes > 0 && (
                      <span className="mt-1 block text-[12px] font-bold uppercase tracking-wide text-[var(--text-3)]">
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
              className="group mt-3 flex min-h-12 items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] px-4 py-4 text-[16px] font-bold text-[var(--text-1)] transition hover:border-white/15 hover:bg-[var(--surface-2)]"
            >
              <span>
                {comportementsClasses !== null && comportementsClasses > 0
                  ? `Le classement complet — ${nombre.format(comportementsClasses)} comportements`
                  : 'Le classement complet'}
              </span>
              <ArrowRight
                size={14}
                aria-hidden
                className="shrink-0 text-[#FFC04D] transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </section>
        )}

        {/* ── Les repères ───────────────────────────────────────────────── */}
        <section className="mt-8" aria-labelledby="titre-reperes">
          <h2
            id="titre-reperes"
            className="mb-3 text-[12px] font-black uppercase tracking-[0.2em] text-[var(--text-2)]"
          >
            Comprendre
          </h2>

          <ul className="grid grid-cols-2 gap-3">
            {REPERES.map((repere) => (
              <li key={repere.href}>
                <Link
                  href={repere.href}
                  onClick={tap}
                  className="group flex h-full flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] px-4 py-4 transition-colors hover:border-white/15 hover:bg-[var(--surface-2)] active:scale-[0.98]"
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
                  <span className="mt-1 text-[13px] font-medium leading-snug text-[var(--text-2)]">
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
          className="mt-8 rounded-3xl border border-[#10B981]/20 bg-[#08110C] px-6 py-6"
          aria-labelledby="titre-safe"
        >
          <div className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.18em] text-[#3DDCA5]">
            <Shield size={14} aria-hidden />
            <h2 id="titre-safe">Si ce n&apos;est plus un jeu</h2>
          </div>
          <p className="mt-3 text-[16px] font-medium leading-relaxed text-[#A9C6B9]">
            Certaines situations ne se règlent pas par un vote. Le violentomètre
            et les autres échelles sont des outils d&apos;auto-évaluation
            sérieux, avec les numéros vers qui se tourner.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/ressources"
              onClick={tap}
              className="group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-[#10B981]/15 bg-[#10B981]/6 px-4 py-4 text-[16px] font-bold text-[#D1FAE5] transition hover:border-[#10B981]/35 hover:bg-[#10B981]/12"
            >
              <span>Violentomètre et outils d&apos;auto-évaluation</span>
              <ArrowRight
                size={14}
                aria-hidden
                className="shrink-0 text-[#3DDCA5] transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/a-propos"
              onClick={tap}
              className="group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] px-4 py-4 text-[16px] font-bold text-[var(--text-1)] transition hover:border-white/15 hover:bg-[var(--surface-2)]"
            >
              <span>Qui fait ce site, et sur quelles données</span>
              <ArrowRight
                size={14}
                aria-hidden
                className="shrink-0 text-[var(--text-3)] transition-transform group-hover:translate-x-0.5"
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
        <span aria-hidden className="mt-1 text-2xl leading-none">
          {jeu.emoji}
        </span>

        {/* Quatre niveaux, quatre traitements, du plus fort au plus discret :
            le titre, la promesse, le format, l’action. C’est cette gradation
            qui fait qu’une carte se lit d’un coup d’œil ; la version
            précédente mettait le format dans la teinte du jeu, ce qui lui
            donnait le même poids que l’action. */}
        <div className="min-w-0 flex-1">
          <h3 className="text-[19px] font-black uppercase leading-[1.1] tracking-[-0.02em] text-[var(--text-1)] sm:text-[23px]">
            {jeu.titre}
          </h3>
          <p className="mt-2 text-[16px] font-semibold leading-snug text-[var(--text-2)]">
            {jeu.promesse}
          </p>
          <p className="mt-2 text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--text-3)]">
            {jeu.format}
          </p>

          {/* Le verbe. Une flèche seule dit qu’il se passe quelque chose, pas
              quoi — et c’est précisément ce qui fait la différence entre une
              piste informationnelle forte et une carte qu’on saute.
              Ce n’est pas un bouton : toute la carte reste la cible. */}
          <p
            className="mt-3 flex items-center gap-1 text-[12px] font-black uppercase tracking-[0.1em]"
            style={{ color: jeu.couleurTexte }}
          >
            {jeu.action}
            {jeu.externe ? (
              <ArrowUpRight
                size={13}
                aria-hidden
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            ) : (
              <ArrowRight
                size={13}
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
              />
            )}
          </p>
        </div>
      </div>
    </>
  );

  const classe =
    'group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] py-4 pl-6 pr-4 text-left transition-all hover:border-white/15 hover:bg-[var(--surface-2)] active:scale-[0.985]';

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
