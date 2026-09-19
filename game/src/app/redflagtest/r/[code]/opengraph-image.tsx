import { ImageResponse } from 'next/og';
import { lireResultatParCode } from '@/lib/rft/repository';

/**
 * La carte de partage.
 *
 * C'EST ELLE QUI FAIT CLIQUER
 *   Un lien collé dans une conversation ne montre que sa vignette. Sans elle,
 *   c'est l'aperçu générique du site qui s'affiche — le même pour tous les
 *   résultats — et le destinataire n'a aucune raison d'ouvrir. Avec le score et
 *   l'archétype dessus, le lien devient une provocation.
 *
 * DESSINÉE SANS LA FEUILLE DE RÉFÉRENCE
 *   `ImageResponse` rend un sous-ensemble de CSS dans un moteur à part : ni
 *   feuille externe, ni variable CSS, ni police auto-chargée. Les couleurs sont
 *   donc écrites en dur, reprises de la palette de `flac.css` — c'est le seul
 *   endroit du projet où elles sont recopiées, et la raison est là.
 */

export const runtime = 'nodejs';
export const alt = 'Résultat du Red Flag Test';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const FOND = '#1d1c1c';
const ROUGE = '#bb2040';
const BLANC = '#d9d9d9';
const GRIS = '#9c9c9c';

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const resultat = await lireResultatParCode(code).catch(() => null);

  const score = resultat?.score ?? 0;
  const titre = resultat?.archetype?.titre ?? resultat?.verdict?.titre ?? 'RED FLAG TEST';
  const soustitre = resultat?.archetype?.soustitre ?? resultat?.verdict?.soustitre ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: FOND,
          color: BLANC,
          fontFamily: 'sans-serif',
          padding: 64,
        }}
      >
        <div style={{ display: 'flex', fontSize: 30, letterSpacing: 6, color: GRIS }}>
          RED FLAG TEST
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 28,
            padding: '12px 48px',
            borderRadius: 12,
            backgroundColor: ROUGE,
            color: '#fff',
            fontSize: 148,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {score} %
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 34,
            fontSize: titre.length > 22 ? 56 : 72,
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          {titre}
        </div>

        {soustitre && (
          <div
            style={{
              display: 'flex',
              marginTop: 18,
              maxWidth: 900,
              fontSize: 30,
              color: GRIS,
              textAlign: 'center',
            }}
          >
            {soustitre}
          </div>
        )}

        <div style={{ display: 'flex', marginTop: 46, fontSize: 28, color: GRIS }}>
          Devine son score avant de le voir →
        </div>
      </div>
    ),
    size,
  );
}
