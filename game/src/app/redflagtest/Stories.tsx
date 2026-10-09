'use client';

/**
 * @module redflagtest/Stories
 * Le résultat en stories plein écran : une information par écran, comme sur
 * Instagram.
 *
 * POURQUOI DES ÉCRANS ET PLUS UNE CARTE
 *   La carte réunissait le verdict, le score, la jauge, trois drapeaux, l'écart
 *   à la moyenne et le point noir dans trois cents pixels. Tout y était, et rien
 *   ne se lisait. Ici, chaque écran pose UNE question — qui je suis, où je me
 *   situe face aux autres, ce qui me plombe — et y répond en très gros.
 *
 * PLEIN ÉCRAN, POUR LA CAPTURE
 *   Les stories recouvrent toute la fenêtre, barre du site comprise : une
 *   capture d'écran de téléphone attrape exactement un écran, logo en tête et
 *   adresse au pied, sans rognage ni réglage. La croix les referme sur le
 *   détail.
 *
 * « TOP 23 % » NE SE COMPREND PAS
 *   C'est un rang exprimé en pourcentage : il faut le décoder. Deux écrans le
 *   remplacent. Le premier pose le joueur sur une échelle à côté des moyennes
 *   — tous les joueurs, son sexe, son âge — et dit l'écart en points. Le second
 *   donne sa place dans la file (« 47e sur 512 ») et la montre sur cent joueurs.
 *
 * LES ÉCRANS SE DÉDUISENT DES DONNÉES
 *   Un premier joueur n'a ni classement ni moyenne, un profil uniforme n'a pas
 *   de point noir, une partie régulière n'a pas de réponse décisive. Un écran
 *   sans rien à dire n'est pas affiché : il coûterait un tap et apprendrait au
 *   joueur que taper ne sert à rien.
 *
 * NAVIGATION
 *   Taper à droite avance, à gauche recule ; un glissement fait de même, ainsi
 *   que les flèches du clavier. Échap referme. Les segments du haut sont de
 *   vrais boutons, et le pied porte un bouton « continuer » : un lecteur
 *   d'écran n'a pas à deviner qu'une moitié d'image est cliquable. Pas de
 *   défilement automatique — on lit à sa vitesse.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import type { Axe, Classement, Resultat } from '@/lib/rft/types';
import { PartageBar } from './PartageBar';

/**
 * Fait défiler le nombre jusqu'à sa valeur, pour qu'il atterrisse au lieu
 * d'apparaître.
 */
function useCompteur(cible: number, duree = 1400): number {
  const [valeur, setValeur] = useState(0);

  useEffect(() => {
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const span = reduit ? 0 : duree;

    let frame = 0;
    const depart = performance.now();
    const tick = (maintenant: number) => {
      const avance = span <= 0 ? 1 : Math.min(1, (maintenant - depart) / span);
      setValeur(Math.round(cible * (1 - Math.pow(1 - avance, 3))));
      if (avance < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    // requestAnimationFrame est suspendu dans un onglet caché : le compteur
    // pourrait ne jamais tourner et le score rester à 0 %, ce qui se lit comme
    // un vrai score — la pire panne possible pour cet écran. Un minuteur
    // garantit l'arrivée du nombre, qu'une image ait été peinte ou non.
    const filet = setTimeout(() => setValeur(cible), span + 250);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(filet);
    };
  }, [cible, duree]);

  return valeur;
}

interface Ecran {
  cle: string;
  /** Pour les lecteurs d'écran et la bulle des segments. */
  titre: string;
  contenu: React.ReactNode;
}

/** `document` n'existe qu'au navigateur : le portail attend d'y être. */
const abonnementVide = () => () => {};

/** Au-delà de ce déplacement horizontal, un toucher est un glissement. */
const GLISSEMENT_PX = 50;

/** La teinte du score, du vert au rouge : elle colore le fond du premier écran. */
function teinteScore(score: number): string {
  if (score >= 60) return '219, 50, 84';
  if (score >= 35) return '226, 124, 33';
  return '42, 160, 72';
}

export function Stories({
  resultat, onRecommencer, onFermer,
}: {
  resultat: Resultat;
  /** Absent sur un résultat partagé : on ne « refait » pas la partie d'un autre. */
  onRecommencer?: () => void;
  /** Referme les stories sur le détail. */
  onFermer: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [sens, setSens] = useState<1 | -1>(1);
  const depart = useRef<{ x: number; y: number } | null>(null);
  const cadre = useRef<HTMLDivElement>(null);

  const ecrans = construireEcrans(resultat, { onRecommencer, onFermer });
  const total = ecrans.length;
  const dernier = index === total - 1;

  const aller = (cible: number) => {
    const borne = Math.max(0, Math.min(total - 1, cible));
    setSens(borne >= index ? 1 : -1);
    setIndex(borne);
  };

  const suivant = useCallback(() => {
    setSens(1);
    setIndex((i) => Math.min(total - 1, i + 1));
  }, [total]);

  const precedent = useCallback(() => {
    setSens(-1);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  // La page dessous ne défile pas tant que les stories sont ouvertes : un
  // glissement vertical ferait bouger le détail derrière l'écran.
  useEffect(() => {
    const racine = document.documentElement;
    const avant = racine.style.overflow;
    racine.style.overflow = 'hidden';
    cadre.current?.focus();
    return () => {
      racine.style.overflow = avant;
    };
  }, []);

  useEffect(() => {
    const touche = (e: KeyboardEvent) => {
      const cible = e.target;
      if (cible instanceof Element && cible.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowRight') suivant();
      if (e.key === 'ArrowLeft') precedent();
      if (e.key === 'Escape') onFermer();
    };
    window.addEventListener('keydown', touche);
    return () => window.removeEventListener('keydown', touche);
  }, [suivant, precedent, onFermer]);

  /*
   * Le tap. Un lien ou un bouton garde son propre comportement : le dernier
   * écran est fait de boutons de partage, et un tap sur « Copier le lien » qui
   * ferait aussi reculer d'un écran serait un piège.
   */
  const taper = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('a, button')) return;
    const zone = e.currentTarget.getBoundingClientRect();
    if (e.clientX - zone.left < zone.width * 0.3) precedent();
    else if (!dernier) suivant();
  };

  const toucher = (e: React.TouchEvent) => {
    const t = e.touches[0];
    depart.current = { x: t.clientX, y: t.clientY };
  };

  const lacher = (e: React.TouchEvent) => {
    const d = depart.current;
    depart.current = null;
    if (!d) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - d.x;
    if (Math.abs(dx) < GLISSEMENT_PX || Math.abs(dx) < Math.abs(t.clientY - d.y)) return;
    if (dx < 0) suivant();
    else precedent();
  };

  const ecran = ecrans[index];

  // Monté sous <body> et non à sa place dans la page : l'enveloppe animée de
  // l'application (`animate-page-in`) crée un contexte d'empilement, sous
  // lequel aucun z-index ne passe au-dessus de la barre du site. Les quatre
  // enveloppes de la référence sont recréées en `display: contents` — sans
  // boîte, mais avec leurs classes, pour que la police et les boutons de
  // partage de `flac.css` s'appliquent comme dans la page.
  const monte = useSyncExternalStore(abonnementVide, () => true, () => false);
  if (!monte) return null;

  return createPortal(
    <div className="main-container rft-portail">
      <div className="client-container">
        <div className="game-wrapper">
          <div className="finish-block">
    <div
      className="stories"
      role="dialog"
      aria-modal="true"
      aria-roledescription="carrousel"
      aria-label="Ton résultat"
    >
      <div
        ref={cadre}
        tabIndex={-1}
        className="stories-cadre"
        data-ecran={ecran.cle}
        style={{ '--teinte': teinteScore(resultat.score) } as React.CSSProperties}
      >
        <div className="stories-segments">
          {ecrans.map((e, i) => (
            <button
              key={e.cle}
              type="button"
              className={`stories-segment${i <= index ? ' is-vu' : ''}`}
              aria-label={`Écran ${i + 1} sur ${total} : ${e.titre}`}
              aria-current={i === index ? 'step' : undefined}
              onClick={() => aller(i)}
            />
          ))}
        </div>

        <div className="stories-tete">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo de la
              référence, déjà servi tel quel par le reste du test. */}
          <img className="stories-logo" src="/rft/img/logo-rog.svg" alt="Red or Green" />
          <span className="stories-compte">{index + 1} / {total}</span>
          <button type="button" className="stories-fermer" onClick={onFermer} aria-label="Fermer et voir le détail">
            ✕
          </button>
        </div>

        {/* La scène porte le tap et le glissement ; `aria-live` annonce l'écran
            qui arrive, puisque rien d'autre ne change de place. */}
        <div
          className="stories-scene"
          onClick={taper}
          onTouchStart={toucher}
          onTouchEnd={lacher}
          aria-live="polite"
        >
          <div
            key={ecran.cle}
            className={`story ${sens > 0 ? 'vient-de-droite' : 'vient-de-gauche'}`}
            role="group"
            aria-roledescription="écran"
            aria-label={`${index + 1} sur ${total} : ${ecran.titre}`}
          >
            {ecran.contenu}
          </div>
        </div>

        <div className="stories-pied">
          {dernier ? (
            <button type="button" className="stories-continuer" onClick={() => aller(0)}>
              ‹ Revoir depuis le début
            </button>
          ) : (
            <button type="button" className="stories-continuer" onClick={suivant}>
              Touche pour continuer ›
            </button>
          )}
          {/* Sans elle, une capture d'écran est un rectangle anonyme : personne
              ne sait d'où elle vient ni où aller la refaire. */}
          <p className="stories-signature">redorgreen.fr/redflagtest</p>
        </div>
      </div>
    </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// Les écrans
// ---------------------------------------------------------------------------

type CleCohorte = 'tous' | 'sexe' | 'age';

interface Cohorte {
  cle: CleCohorte;
  /** Dans une phrase : « sur 100 hommes », « sur 100 joueurs de 23-26 ans ». */
  nom: string;
  /** Sur un onglet : « Hommes », « 23-26 ans ». */
  court: string;
  c: Classement;
}

/** Les cohortes classées, de la plus large à la plus précise. */
function cohortes(r: Resultat): Cohorte[] {
  const { tous, sexe, age } = r.classements;
  const liste: Cohorte[] = [];
  if (tous) liste.push({ cle: 'tous', nom: 'joueurs', court: 'Tous', c: tous });
  // « Sur 100 autre » ne se lit pas non plus : la cohorte « autre » garde son
  // nom, entre guillemets, derrière « joueurs ».
  if (sexe) {
    const nom = sexe.legende === 'autre' ? 'joueurs « autre »' : sexe.legende;
    liste.push({ cle: 'sexe', nom, court: majuscule(sexe.legende), c: sexe });
  }
  // « Sur 100 23-26 ans » ne se lit pas : la tranche d'âge a besoin d'un nom.
  if (age) liste.push({ cle: 'age', nom: `joueurs de ${age.legende}`, court: majuscule(age.legende), c: age });
  return liste;
}

function construireEcrans(
  r: Resultat,
  actions: { onRecommencer?: () => void; onFermer: () => void },
): Ecran[] {
  const ecrans: Ecran[] = [
    { cle: 'verdict', titre: 'Ton verdict', contenu: <EcranVerdict resultat={r} /> },
  ];

  const groupes = cohortes(r);

  if (groupes.some((g) => g.c.moyenne !== null)) {
    ecrans.push({ cle: 'moyennes', titre: 'Toi face aux autres', contenu: <EcranMoyennes resultat={r} /> });
  }

  if (groupes.length > 0) {
    ecrans.push({ cle: 'classement', titre: 'Ton classement', contenu: <EcranClassement resultat={r} /> });
  }

  if (r.axes.length > 0) {
    ecrans.push({
      cle: 'axes',
      titre: r.pointNoir ? 'Ton point noir' : 'Catégorie par catégorie',
      contenu: <EcranAxes axes={r.axes} pointNoir={r.pointNoir} />,
    });
  }

  if (r.reponseDecisive || r.highlights.length > 0) {
    ecrans.push({
      cle: 'reponse',
      titre: r.reponseDecisive ? 'La réponse qui t’a coûté le plus' : 'Ta réponse la plus rare',
      contenu: <EcranReponse resultat={r} />,
    });
  }

  // Au-delà du seuil d'une catégorie, le test cesse de faire de l'humour. Ce
  // texte a son propre écran, AVANT le partage : glissé sous des boutons, il
  // serait le bas de page qu'on ne lit pas.
  if (r.ressources.length > 0) {
    ecrans.push({ cle: 'ressource', titre: 'Plus sérieusement', contenu: <EcranRessources resultat={r} /> });
  }

  ecrans.push({ cle: 'fin', titre: 'À toi de jouer', contenu: <EcranFin resultat={r} {...actions} /> });

  return ecrans;
}

function EcranVerdict({ resultat }: { resultat: Resultat }) {
  const affiche = useCompteur(resultat.score);
  const { archetype, verdict } = resultat;

  // Le nom du profil décrit une personne, le verdict décrit un score : c'est le
  // premier qui fait le titre. Le verdict passe au-dessus, en petit.
  const titre = archetype?.titre ?? verdict?.titre ?? null;
  const emoji = archetype?.emoji ?? verdict?.emoji ?? null;
  const soustitre = archetype ? archetype.soustitre : verdict?.soustitre ?? null;
  const surtitre = archetype && verdict ? verdict.titre : 'Ton résultat';

  return (
    <>
      <p className="story-surtitre">{surtitre}</p>
      {emoji && <p className="story-emoji" aria-hidden="true">{emoji}</p>}
      {titre && <p className="story-titre">{titre}</p>}
      {soustitre && <p className="story-texte">{soustitre}</p>}

      <p className="story-score">
        <strong>{affiche}<span>%</span></strong>
        <span className="story-score-unite">red flag</span>
      </p>
      <div className="story-jauge">
        <Curseur valeur={Math.min(100, resultat.score)} />
        <span className="story-jauge-gauche">Green flag</span>
        <span className="story-jauge-droite">Red flag</span>
      </div>
    </>
  );
}

// --- Toi face aux autres ----------------------------------------------------

interface Repere {
  cle: string;
  valeur: number;
  libelle: string;
  moi?: boolean;
}

/** L'écart minimal entre deux étiquettes de l'échelle, en pixels. */
const ECART_ETIQUETTES_PX = 46;

/**
 * Écarte les étiquettes qui se chevauchent, sans toucher aux repères.
 *
 * Deux moyennes à 42 et 44 tomberaient au même endroit : chaque étiquette
 * garde sa place quand elle le peut, est poussée sinon, et un trait la relie à
 * sa vraie valeur sur le tube. On descend d'abord, puis on remonte ce qui a
 * débordé en bas.
 */
export function placerEtiquettes(vrais: number[], ecart: number): number[] {
  const ordre = vrais.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  const pos = ordre.map((o) => o.y);
  const min = ecart / 2;
  const max = 100 - ecart / 2;
  for (let k = 0; k < pos.length; k++) {
    pos[k] = Math.max(pos[k], min, k > 0 ? pos[k - 1] + ecart : -Infinity);
  }
  for (let k = pos.length - 1; k >= 0; k--) {
    pos[k] = Math.min(pos[k], max, k < pos.length - 1 ? pos[k + 1] - ecart : Infinity);
  }
  const rendu = new Array<number>(vrais.length);
  ordre.forEach((o, k) => { rendu[o.i] = pos[k]; });
  return rendu;
}

function EcranMoyennes({ resultat }: { resultat: Resultat }) {
  const echelle = useRef<HTMLDivElement>(null);
  const [hauteur, setHauteur] = useState(400);

  // Les étiquettes s'écartent d'un nombre de PIXELS, que l'échelle — dont la
  // hauteur dépend de l'écran — doit traduire en pourcentage.
  useLayoutEffect(() => {
    const el = echelle.current;
    if (!el) return;
    const mesurer = () => setHauteur(el.getBoundingClientRect().height || 400);
    mesurer();
    if (typeof ResizeObserver === 'undefined') return;
    const obs = new ResizeObserver(mesurer);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const reperes: Repere[] = [
    { cle: 'moi', valeur: resultat.score, libelle: 'Toi', moi: true },
    ...cohortes(resultat)
      .filter((g) => g.c.moyenne !== null)
      .map((g) => ({
        cle: g.cle,
        valeur: g.c.moyenne as number,
        libelle: g.cle === 'tous' ? 'Moyenne de tous' : `Moyenne des ${g.cle === 'sexe' ? g.nom : g.court}`,
      })),
  ];

  // L'échelle va jusqu'à 100, ou au-delà si un score la dépasse : « 137 % »
  // doit tenir dessus, et c'est voulu.
  const plafond = Math.max(100, Math.ceil(Math.max(...reperes.map((r) => r.valeur)) / 25) * 25);
  const graduations = Array.from({ length: plafond / 25 + 1 }, (_, i) => i * 25);
  const y = (v: number) => (1 - Math.max(0, v) / plafond) * 100;
  const vrais = reperes.map((r) => y(r.valeur));
  const places = placerEtiquettes(vrais, (ECART_ETIQUETTES_PX / hauteur) * 100);

  // La phrase en tête : l'écart à la moyenne la plus précise qui existe.
  const c = resultat.comparaison;

  return (
    <>
      <p className="story-surtitre">Toi face aux autres</p>
      {c && c.ecart !== 0 ? (
        <p className="story-phrase">
          <strong className={c.ecart > 0 ? 'rouge' : 'vert'}>
            {c.ecart > 0 ? '+' : '−'}{Math.abs(c.ecart)} points
          </strong>{' '}
          {c.ecart > 0 ? 'au-dessus' : 'en dessous'} de la moyenne {c.legende}
        </p>
      ) : c ? (
        <p className="story-phrase">Pile dans la moyenne {c.legende}</p>
      ) : (
        <p className="story-phrase">Ton score, à côté des moyennes</p>
      )}

      <div className="story-echelle" ref={echelle} aria-hidden="true">
        <div className="story-tube">
          {plafond > 100 && (
            <div className="story-tube-hors" style={{ height: `${(1 - 100 / plafond) * 100}%` }} />
          )}
        </div>
        {graduations.map((g) => (
          <span key={g} className="story-graduation" style={{ top: `${y(g)}%` }}>{g}</span>
        ))}
        <svg className="story-liens" viewBox="0 0 100 100" preserveAspectRatio="none">
          {reperes.map((r, i) => (
            <line
              key={r.cle}
              x1="0" y1={vrais[i]} x2="100" y2={places[i]}
              className={r.moi ? 'lien-moi' : 'lien'}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {reperes.map((r, i) => (
          <span
            key={`m-${r.cle}`}
            className={`story-marque${r.moi ? ' is-moi' : ''}`}
            style={{ top: `${vrais[i]}%` }}
          />
        ))}
        {reperes.map((r, i) => (
          <div
            key={`e-${r.cle}`}
            className={`story-etiquette${r.moi ? ' is-moi' : ''}`}
            style={{ top: `${places[i]}%` }}
          >
            <strong>{Math.round(r.valeur)} %</strong>
            <span>{r.libelle}</span>
          </div>
        ))}
      </div>
      {/* Pour les lecteurs d'écran, l'échelle en clair. */}
      <ul className="sr-only">
        {reperes.map((r) => <li key={r.cle}>{r.libelle} : {Math.round(r.valeur)} %</li>)}
      </ul>
    </>
  );
}

// --- Ton classement ---------------------------------------------------------

function ordinal(n: number): string {
  return n === 1 ? '1er' : `${n}e`;
}

const DRAPEAU: Record<CleCohorte, string> = { tous: 'region', sexe: 'gender', age: 'age' };

/**
 * La place dans la file, puis la même place sur cent joueurs.
 *
 * « 47e sur 512 » est exact : c'est le nombre de scores strictement plus hauts,
 * plus un. Les cent cases le ramènent à une échelle qu'on voit d'un coup
 * d'œil, sans retourner le rang : les ex aequo restent du côté du joueur,
 * « autant ou moins », et ne sont jamais comptés comme battus.
 */
function EcranClassement({ resultat }: { resultat: Resultat }) {
  const groupes = cohortes(resultat);
  const [choisi, setChoisi] = useState<CleCohorte>(groupes[0].cle);
  const g = groupes.find((x) => x.cle === choisi) ?? groupes[0];
  const devant = Math.min(99, Math.round(((g.c.position - 1) / g.c.effectif) * 100));

  return (
    <>
      <p className="story-surtitre">Ton classement</p>
      <p className="story-place">
        <strong>{ordinal(g.c.position)}</strong>
        <span>sur {g.c.effectif.toLocaleString('fr-FR')} {g.nom}</span>
      </p>
      <p className="story-note story-note-place">Le 1er est le plus red flag de tous</p>

      {groupes.length > 1 && (
        <div className="story-onglets" role="tablist" aria-label="Se comparer aux">
          {groupes.map((x) => (
            <button
              key={x.cle}
              type="button"
              role="tab"
              aria-selected={x.cle === g.cle}
              className={`story-onglet${x.cle === g.cle ? ' is-actif' : ''}`}
              onClick={() => setChoisi(x.cle)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- images
                  de la référence, en trois teintes. */}
              <img src={`/rft/img/flag-${DRAPEAU[x.cle]}-${x.c.couleur}.svg`} alt="" />
              {x.court}
            </button>
          ))}
        </div>
      )}

      <p className="story-phrase">
        {devant === 0 ? (
          <>Sur 100 {g.nom}, <strong className="rouge">aucun</strong> ne fait plus red flag que toi</>
        ) : (
          <>
            Sur 100 {g.nom}, <strong className={devant <= 50 ? 'rouge' : 'vert'}>{devant}</strong>{' '}
            {devant === 1 ? 'fait' : 'font'} plus red flag que toi
          </>
        )}
      </p>

      <div className="story-foule" key={g.cle} aria-hidden="true">
        {Array.from({ length: 100 }, (_, i) => (
          <i
            key={i}
            className={i < devant ? 'is-devant' : i === devant ? 'is-moi' : 'is-derriere'}
            style={{ animationDelay: `${i * 5}ms` }}
          />
        ))}
      </div>
      <div className="story-legende" aria-hidden="true">
        <span className="l-devant">Plus red flag</span>
        <span className="l-moi">Toi</span>
        <span className="l-derriere">Autant ou moins</span>
      </div>
      {g.c.avertissement && (
        <p className="story-note">* Encore peu de parties dans ce groupe : {g.c.avertissement}</p>
      )}
    </>
  );
}

// --- Les catégories ---------------------------------------------------------

/** La teinte d'une barre, du vert au rouge selon la part des points prise. */
function teinte(valeur: number): string {
  if (valeur >= 70) return 'var(--light-red)';
  if (valeur >= 50) return 'var(--orange)';
  if (valeur >= 30) return 'var(--yellow)';
  return 'var(--light-green)';
}

function EcranAxes({ axes, pointNoir }: { axes: Axe[]; pointNoir: Axe | null }) {
  // Du pire au meilleur : la première barre est celle qu'on vient lire.
  const tries = [...axes]
    .filter((a) => a.tagId !== pointNoir?.tagId)
    .sort((a, b) => b.valeur - a.valeur);

  return (
    <>
      {pointNoir ? (
        <>
          <p className="story-surtitre">Ton point noir</p>
          <p className="story-titre rouge story-majuscules">{pointNoir.label}</p>
          <p className="story-geant">{pointNoir.valeur}<span>%</span></p>
          <p className="story-texte">des points red flag possibles dans cette catégorie</p>
        </>
      ) : (
        <>
          <p className="story-surtitre">Ton profil</p>
          <p className="story-titre">Catégorie par catégorie</p>
          <p className="story-texte">De la plus red flag à la plus green flag</p>
        </>
      )}

      <ul className="story-axes">
        {tries.map((axe) => (
          <li key={axe.tagId}>
            <span className="story-axe-tete">
              <span>{axe.label}</span>
              <strong style={{ color: teinte(axe.valeur) }}>{axe.valeur} %</strong>
            </span>
            <span className="story-axe-piste">
              <span
                className="story-axe-barre"
                style={{ width: `${axe.valeur}%`, backgroundColor: teinte(axe.valeur) }}
              />
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

// --- La réponse -------------------------------------------------------------

function EcranReponse({ resultat }: { resultat: Resultat }) {
  const decisive = resultat.reponseDecisive;
  // La plus rare d'abord : c'est elle qui distingue. Une réponse choisie par
  // la moitié des joueurs n'apprend rien sur personne.
  const rare = [...resultat.highlights].sort((a, b) => a.part - b.part)[0] ?? null;
  // Souvent, la réponse la plus chère est aussi la plus rare : la citer deux
  // fois sur le même écran ne dirait rien de plus.
  const memeReponse = Boolean(decisive && rare && decisive.reponse === rare.reponse);
  const citation = (texte: string) => (
    <p className={`story-citation${texte.length > 70 ? ' is-longue' : ''}`}>« {texte} »</p>
  );

  return (
    <>
      {decisive ? (
        <>
          <p className="story-surtitre">La réponse qui t’a coûté le plus</p>
          <p className="story-question">{decisive.question}</p>
          {citation(decisive.reponse)}
          <p className="story-cout">
            <strong>{decisive.points}</strong>
            <span>points sur tes {resultat.score}</span>
          </p>
        </>
      ) : (
        rare && (
          <>
            <p className="story-surtitre">Ta réponse la plus rare</p>
            <p className="story-question">{rare.question}</p>
            {citation(rare.reponse)}
            <p className="story-geant jaune">{rare.part}<span>%</span></p>
            <p className="story-texte">des joueurs ont répondu comme toi</p>
            <p className="story-texte-fort">{rare.pique}</p>
          </>
        )
      )}

      {decisive && rare && (
        <div className="story-encart">
          {memeReponse ? (
            <p>
              Seuls <strong className="jaune">{rare.part} %</strong> des joueurs ont répondu ça.
            </p>
          ) : (
            <>
              <p className="story-encart-titre">Ta réponse la plus rare</p>
              <p>
                « {rare.reponse} » : <strong className="jaune">{rare.part} %</strong> des joueurs
              </p>
            </>
          )}
          <p className="story-encart-pique">{rare.pique}</p>
        </div>
      )}
    </>
  );
}

function EcranRessources({ resultat }: { resultat: Resultat }) {
  return (
    <>
      <p className="story-surtitre">Plus sérieusement</p>
      {resultat.ressources.map((r) => (
        <aside key={r.label} className="story-ressource">
          <p className="story-ressource-cat">{r.label}</p>
          <p>{r.texte}</p>
          {r.lien && (
            <Link href={r.lien} className="story-ressource-lien">
              Voir la ressource →
            </Link>
          )}
        </aside>
      ))}
    </>
  );
}

function EcranFin({
  resultat, onRecommencer, onFermer,
}: {
  resultat: Resultat;
  onRecommencer?: () => void;
  onFermer: () => void;
}) {
  return (
    <>
      <p className="story-surtitre">À toi de jouer</p>
      <p className="story-titre">
        {onRecommencer ? 'Défie tes potes' : 'Et toi, tu ferais mieux ?'}
      </p>

      {resultat.codePartage && (
        <PartageBar
          code={resultat.codePartage}
          score={resultat.score}
          archetype={resultat.archetype?.titre ?? null}
        />
      )}

      <div className="story-actions">
        {onRecommencer ? (
          <button type="button" className="partage-copier" onClick={onRecommencer}>
            Refaire le test
          </button>
        ) : (
          <Link href="/redflagtest" className="share-btn">
            <p>Faire le test</p>
          </Link>
        )}
        <button type="button" className="story-lien" onClick={onFermer}>
          Voir tout le détail
        </button>
        <Link href="/redflagtest/stats" className="story-lien">
          Ce que les autres ont répondu
        </Link>
      </div>
    </>
  );
}

/**
 * Le curseur de la jauge.
 *
 * Monté à zéro puis lancé vers le score à la première image : posé d'emblée à
 * sa valeur finale, il apparaîtrait sur place et la transition n'aurait rien à
 * animer. C'est la même seconde et demie que la feuille de référence donne à
 * son propre curseur.
 */
function Curseur({ valeur }: { valeur: number }) {
  const [pose, setPose] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setPose(valeur));
    return () => cancelAnimationFrame(frame);
  }, [valeur]);

  return <span className="story-jauge-curseur" style={{ left: `${pose}%` }} />;
}

function majuscule(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}
