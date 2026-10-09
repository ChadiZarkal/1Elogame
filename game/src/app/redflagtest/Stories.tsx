'use client';

/**
 * @module redflagtest/Stories
 * Le résultat en stories : une information par écran, comme sur Instagram.
 *
 * POURQUOI DES ÉCRANS ET PLUS UNE CARTE
 *   La carte réunissait le verdict, le score, la jauge, trois drapeaux, l'écart
 *   à la moyenne et le point noir dans trois cents pixels. Tout y était, et rien
 *   ne se lisait : sept chiffres de même taille, sans ordre de lecture. Ici,
 *   chaque écran pose UNE question — qui je suis, où je me situe, ce qui me
 *   plombe — et y répond en gros.
 *
 * CHAQUE ÉCRAN SE CAPTURE SEUL
 *   Il porte le logo, sa position (« 2 / 5 ») et l'adresse du test. Une capture
 *   prise à n'importe quel moment est un résultat complet et signé, ce que la
 *   carte promettait sans le tenir.
 *
 * LES ÉCRANS SE DÉDUISENT DES DONNÉES
 *   Un premier joueur n'a pas de classement, un profil uniforme n'a pas de point
 *   noir, une partie régulière n'a pas de réponse décisive. Un écran sans rien à
 *   dire n'est pas affiché : un écran vide coûte un tap et apprend au joueur que
 *   taper ne sert à rien.
 *
 * NAVIGATION
 *   Taper à droite avance, à gauche recule ; un glissement fait de même, ainsi
 *   que les flèches du clavier. Les segments du haut sont de vrais boutons, et
 *   le pied d'écran porte un bouton « continuer » : un lecteur d'écran n'a pas
 *   à deviner qu'une moitié d'image est cliquable. Pas de défilement
 *   automatique — on lit à sa vitesse, et ces écrans se lisent lentement.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
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

/** Au-delà de ce déplacement horizontal, un toucher est un glissement. */
const GLISSEMENT_PX = 50;

export function Stories({
  resultat, onRecommencer, idDetail,
}: {
  resultat: Resultat;
  /** Absent sur un résultat partagé : on ne « refait » pas la partie d'un autre. */
  onRecommencer?: () => void;
  /** L'ancre du détail, sous les stories. */
  idDetail: string;
}) {
  const [index, setIndex] = useState(0);
  const [sens, setSens] = useState<1 | -1>(1);
  const depart = useRef<{ x: number; y: number } | null>(null);

  const ecrans = construireEcrans(resultat, { onRecommencer, idDetail });
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

  useEffect(() => {
    const touche = (e: KeyboardEvent) => {
      const cible = e.target as HTMLElement | null;
      if (cible?.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowRight') suivant();
      if (e.key === 'ArrowLeft') precedent();
    };
    window.addEventListener('keydown', touche);
    return () => window.removeEventListener('keydown', touche);
  }, [suivant, precedent]);

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

  return (
    <section
      className="stories"
      aria-roledescription="carrousel"
      aria-label="Ton résultat"
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
        <span>{index + 1} / {total}</span>
      </div>

      {/* La scène porte le tap et le glissement ; `aria-live` annonce l'écran
          qui arrive, puisque rien d'autre ne change de place sur la page. */}
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
          data-ecran={ecran.cle}
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
        {/* Sans elle, une capture d'écran est un rectangle anonyme : personne ne
            sait d'où elle vient ni où aller la refaire. */}
        <p className="stories-signature">redorgreen.fr/redflagtest</p>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Les écrans
// ---------------------------------------------------------------------------

function construireEcrans(
  r: Resultat,
  actions: { onRecommencer?: () => void; idDetail: string },
): Ecran[] {
  const ecrans: Ecran[] = [
    { cle: 'verdict', titre: 'Ton verdict', contenu: <EcranVerdict resultat={r} /> },
  ];

  const { tous, sexe, age } = r.classements;
  if (tous || sexe || age || r.comparaison) {
    ecrans.push({ cle: 'rang', titre: 'Où tu te situes', contenu: <EcranRang resultat={r} /> });
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
    ecrans.push({
      cle: 'ressource',
      titre: 'Plus sérieusement',
      contenu: <EcranRessources resultat={r} />,
    });
  }

  ecrans.push({
    cle: 'fin',
    titre: 'À toi de jouer',
    contenu: <EcranFin resultat={r} {...actions} />,
  });

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
  const surtitre = archetype && verdict ? verdict.titre : 'Ton verdict';

  return (
    <>
      <p className="story-surtitre">{surtitre}</p>
      {emoji && <p className="story-emoji" aria-hidden="true">{emoji}</p>}
      {titre && <p className="story-titre">{titre}</p>}
      {soustitre && <p className="story-texte">{soustitre}</p>}

      <div className="story-jauge">
        <Curseur valeur={Math.min(100, resultat.score)} />
        <span className="story-jauge-gauche">Green flag</span>
        <span className="story-jauge-droite">Red flag</span>
      </div>
      <p className="story-score">
        <strong>{affiche} %</strong> red flag
      </p>
    </>
  );
}

/**
 * « Top 23 % » est un rang, et un rang se décode. L'écran le dit en une phrase
 * avant de le montrer.
 *
 * `top` est la part des joueurs qui ont fait aussi fort OU PLUS FORT, le
 * joueur compris. Les deux phrases ne font que le redire en mots, sans le
 * retourner : « tu es dans les 23 % les plus red flag » en haut du classement,
 * « 91 % des joueurs sont au moins aussi red flag que toi » en bas. Écrire
 * « tu fais pire que 77 % » serait compter les ex aequo comme battus — et sur
 * un test où beaucoup de joueurs finissent au même score, ce n'est pas un
 * arrondi, c'est un mensonge.
 */
function EcranRang({ resultat }: { resultat: Resultat }) {
  const { tous, sexe, age } = resultat.classements;
  const repere = tous ?? sexe ?? age;
  const population = repere === tous ? 'des joueurs' : `des ${repere?.legende ?? 'joueurs'}`;
  const enHaut = repere ? repere.top <= 50 : false;

  const minces = [tous, sexe, age].filter((c) => c?.avertissement).map((c) => c!.legende);

  return (
    <>
      {repere && (enHaut ? (
        <>
          <p className="story-surtitre">Tu es dans les</p>
          <p className="story-geant rouge">{repere.top} %</p>
          <p className="story-texte-fort">les plus red flag {population}</p>
        </>
      ) : (
        <>
          <p className="story-geant vert">{repere.top} %</p>
          <p className="story-texte-fort">{population} sont au moins aussi red flag que toi</p>
        </>
      ))}

      {(tous || sexe || age) && (
        <ul className="story-rangs">
          {tous && <Rang genre="region" libelle="Tous les joueurs" rang={tous} />}
          {sexe && <Rang genre="gender" libelle={majuscule(sexe.legende)} rang={sexe} />}
          {age && <Rang genre="age" libelle={majuscule(age.legende)} rang={age} />}
        </ul>
      )}

      {/* En bas du classement, la phrase du haut dit déjà ce que « Top » veut
          dire ; la répéter dessous serait du bruit. */}
      {repere && enHaut && (
        <p className="story-note story-explication">
          « Top {repere.top} % » : {repere.top} % des joueurs ont un score aussi haut ou plus haut que toi.
        </p>
      )}
      {minces.length > 0 && (
        <p className="story-note">* {minces.join(', ')} — encore peu de parties</p>
      )}

      {resultat.comparaison && <Comparaison c={resultat.comparaison} />}
    </>
  );
}

function Comparaison({ c }: { c: NonNullable<Resultat['comparaison']> }) {
  if (c.ecart === 0) {
    return <p className="story-encart">Pile dans la moyenne {c.legende}.</p>;
  }
  return (
    <p className="story-encart">
      <strong className={c.ecart > 0 ? 'rouge' : 'vert'}>
        {c.ecart > 0 ? '+' : '−'}{Math.abs(c.ecart)} points
      </strong>{' '}
      {c.ecart > 0 ? 'au-dessus' : 'en dessous'} de la moyenne {c.legende}.
    </p>
  );
}

/**
 * Une ligne de classement, sur le drapeau de la référence.
 *
 * La couleur vient du SERVEUR, pas d'un calcul local : la page d'un résultat
 * partagé ne connaît pas le profil de celui qui a joué, et deux écrans qui
 * déduiraient chacun leur teinte finiraient par diverger.
 */
function Rang({
  genre, libelle, rang,
}: { genre: 'gender' | 'age' | 'region'; libelle: string; rang: Classement }) {
  return (
    <li className="story-rang">
      {/* eslint-disable-next-line @next/next/no-img-element -- images de la
          référence, en trois teintes. */}
      <img src={`/rft/img/flag-${genre}-${rang.couleur}.svg`} alt="" />
      <span>{libelle}</span>
      <strong className={`rang-${rang.couleur}`}>
        Top {rang.top} %{rang.avertissement && <span className="story-etoile">*</span>}
      </strong>
    </li>
  );
}

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
          <p className="story-geant">{pointNoir.valeur} %</p>
          <p className="story-texte">des points red flag possibles dans cette catégorie</p>
        </>
      ) : (
        <>
          <p className="story-surtitre">Ton profil</p>
          <p className="story-titre">Catégorie par catégorie</p>
          <p className="story-texte">De la plus red flag à la plus green flag.</p>
        </>
      )}

      <ul className="story-axes">
        {tries.map((axe) => (
          <li key={axe.tagId}>
            <span className="story-axe-nom">{axe.label}</span>
            <span className="story-axe-piste">
              <span
                className="story-axe-barre"
                style={{ width: `${axe.valeur}%`, backgroundColor: teinte(axe.valeur) }}
              />
            </span>
            <strong>{axe.valeur}</strong>
          </li>
        ))}
      </ul>
      <p className="story-note">Plus la barre est longue, plus c’est red flag.</p>
    </>
  );
}

function EcranReponse({ resultat }: { resultat: Resultat }) {
  const decisive = resultat.reponseDecisive;
  // La plus rare d'abord : c'est elle qui distingue. Une réponse choisie par
  // la moitié des joueurs n'apprend rien sur personne.
  const rare = [...resultat.highlights].sort((a, b) => a.part - b.part)[0] ?? null;

  return (
    <>
      {decisive ? (
        <>
          <p className="story-surtitre">La réponse qui t’a coûté le plus</p>
          <p className="story-citation">« {decisive.reponse} »</p>
          <p className="story-texte-fort">
            <strong className="rouge">{decisive.points} de tes {resultat.score} points</strong>
          </p>
          <p className="story-note">{decisive.question}</p>
        </>
      ) : (
        rare && (
          <>
            <p className="story-surtitre">Ta réponse la plus rare</p>
            <p className="story-citation">« {rare.reponse} »</p>
            <p className="story-geant jaune">{rare.part} %</p>
            <p className="story-texte">des joueurs ont répondu comme toi</p>
            <p className="story-texte-fort">{rare.pique}</p>
          </>
        )
      )}

      {decisive && rare && (
        <div className="story-encart">
          <p className="story-encart-titre">Ta réponse la plus rare</p>
          <p>
            « {rare.reponse} » : <strong className="jaune">{rare.part} %</strong> des joueurs
          </p>
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
  resultat, onRecommencer, idDetail,
}: {
  resultat: Resultat;
  onRecommencer?: () => void;
  idDetail: string;
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
        <a href={`#${idDetail}`} className="story-lien">Tout le détail ↓</a>
        <Link href="/redflagtest/stats" className="story-lien">
          Voir ce que les autres ont répondu
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
