/**
 * @module carteOg
 * Gabarit des images de partage : les jeux et les pages de contenu.
 *
 * Le guide, le test et le baromètre partageaient l'image générique du site :
 * un lien envoyé dans une conversation montrait « Red or Green » et rien de ce
 * que la page contient. Chaque page a désormais la sienne, sur ce gabarit.
 *
 * LE VRAI LOGO, PAS SON NOM TAPÉ
 *   Jusqu'au 2026-11-03, « Red or Green » était écrit en police système : la
 *   vignette ne ressemblait pas au site (« la prévisu est moche », Chadi). Le
 *   logo est désormais celui de l'accueil (`public/logo-rog-new.svg`, tout en
 *   tracés, donc rendu tel quel), et les titres sont en Agdasima, la police du
 *   Red Flag Test : condensée, taillée, plus proche du lettrage du logo qu'une
 *   linéale ronde.
 *
 * Les deux fichiers sont lus sur le disque : les routes qui s'en servent
 * tournent sous Node, pas en edge. S'ils manquent, l'image se rend quand même —
 * nom du site écrit, police par défaut — plutôt que de ne pas se rendre.
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const TAILLE_OG = { width: 1200, height: 630 };

/** Proportions du logo : 192 × 86. */
const LOGO_RATIO = 192 / 86;

export interface RessourcesOg {
  /** Le logo en `data:` URI, ou `null` s'il n'a pas pu être lu. */
  logo: string | null;
  /** Agdasima Bold, ou `null`. */
  agdasima: ArrayBuffer | null;
}

let ressources: Promise<RessourcesOg> | null = null;

/** Le logo et la police, lus une fois par processus. */
export function ressourcesOg(): Promise<RessourcesOg> {
  ressources ??= (async () => {
    // Chemins écrits en entier : c'est ainsi que le traçage de Vercel voit
    // qu'il faut embarquer ces fichiers avec les routes générées à la demande
    // (la carte d'un résultat du Red Flag Test).
    const [svg, police] = await Promise.all([
      readFile(join(process.cwd(), 'public', 'logo-rog-new.svg')).catch(() => null),
      readFile(join(process.cwd(), 'public', 'rft', 'fnt', 'Agdasima-Bold.woff')).catch(() => null),
    ]);
    return {
      logo: svg ? `data:image/svg+xml;base64,${svg.toString('base64')}` : null,
      agdasima: police ? police.buffer.slice(police.byteOffset, police.byteOffset + police.byteLength) as ArrayBuffer : null,
    };
  })();
  return ressources;
}

/** Les polices à passer à `ImageResponse`. */
export function policesOg(r: RessourcesOg) {
  return r.agdasima ? [{ name: 'Agdasima', data: r.agdasima, weight: 700 as const, style: 'normal' as const }] : undefined;
}

/** Le logo à la hauteur voulue, ou le nom du site à défaut. */
export function LogoOg({ r, hauteur }: { r: RessourcesOg; hauteur: number }) {
  if (!r.logo) {
    return (
      <div style={{ display: 'flex', gap: '10px', fontSize: hauteur * 0.6, fontWeight: 700 }}>
        <span style={{ color: '#FF2D2D' }}>Red</span>
        <span style={{ color: '#F5F5F5' }}>or</span>
        <span style={{ color: '#22C55E' }}>Green</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- rendu par satori, pas par le navigateur.
  return <img src={r.logo} width={Math.round(hauteur * LOGO_RATIO)} height={hauteur} alt="" />;
}

/**
 * Le fond commun : noir du site, une lueur rouge dans le coin haut gauche, une
 * verte dans le coin bas droit. En dégradés plutôt qu'en disques placés en
 * absolu : satori positionnait mal les disques, qui passaient derrière le
 * texte.
 */
export const FOND_OG =
  'radial-gradient(circle at 0% 0%, rgba(255,45,45,0.22) 0%, rgba(255,45,45,0) 42%), ' +
  'radial-gradient(circle at 100% 100%, rgba(34,197,94,0.18) 0%, rgba(34,197,94,0) 42%), ' +
  'linear-gradient(#0A0A0B, #0A0A0B)';

export async function carteOg({
  emoji,
  titre,
  sous,
  chemin,
  teinte,
}: {
  emoji: string;
  titre: string;
  sous: string;
  chemin: string;
  /** Teinte d'accent : le liseré et l'adresse. */
  teinte: string;
}) {
  const r = await ressourcesOg();
  // Un titre d'article dépasse souvent 60 signes : en grand, il sortirait du cadre.
  const long = titre.length > 40;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          width: '100%',
          height: '100%',
          padding: '64px 88px',
          backgroundImage: FOND_OG,
          borderLeft: `14px solid ${teinte}`,
          fontFamily: 'sans-serif',
        }}
      >
        <LogoOg r={r} hauteur={110} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', marginTop: '36px' }}>
          <span style={{ fontSize: long ? '72px' : '96px' }}>{emoji}</span>
          <span
            style={{
              color: '#F5F5F5',
              fontFamily: 'Agdasima',
              fontSize: long ? '64px' : '104px',
              fontWeight: 700,
              lineHeight: 1,
              textTransform: 'uppercase',
              maxWidth: '920px',
            }}
          >
            {titre}
          </span>
        </div>

        <p style={{ color: '#B8B8C0', fontSize: '30px', marginTop: '26px', lineHeight: 1.35, maxWidth: '960px' }}>
          {sous}
        </p>

        <p style={{ color: teinte, fontSize: '24px', marginTop: '22px' }}>redorgreen.fr{chemin}</p>
      </div>
    ),
    { ...TAILLE_OG, fonts: policesOg(r) },
  );
}
