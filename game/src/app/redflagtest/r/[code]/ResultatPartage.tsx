'use client';

/**
 * @module redflagtest/r/ResultatPartage
 * Le résultat de quelqu'un d'autre : la devinette, puis le récap.
 *
 * Le récap est LE MÊME composant que celui de fin de partie. Ces deux écrans
 * doivent dire la même chose ; le seul moyen de s'en assurer est qu'ils passent
 * par le même code. La seule différence tient en un accessoire absent —
 * `onRecommencer` — parce qu'on ne « refait » pas la partie d'un autre.
 */

import { useEffect, useState } from 'react';
import type { Resultat } from '@/lib/rft/types';
import { Recap } from '../../Recap';
import { Devinette } from './Devinette';

export function ResultatPartage({ resultat }: { resultat: Resultat }) {
  const [revele, setRevele] = useState(false);

  // `flac.css` ne montre le bloc de fin que sous cette classe : sans elle, le
  // récap est là mais invisible.
  useEffect(() => {
    if (!revele) return;
    document.body.classList.add('switch-quiz-end');
    return () => document.body.classList.remove('switch-quiz-end');
  }, [revele]);

  if (!revele) {
    return <Devinette score={resultat.score} onReveler={() => setRevele(true)} />;
  }

  return (
    <div className="game-wrapper">
      {/* Pas de `bracket-message` ici non plus : le verdict est dans la carte,
          ou il tient sur une ligne. En titre au-dessus, il repoussait la carte
          de deux cents pixels et disait deux fois la meme chose. */}
      <div className="finish-block">
        <Recap resultat={resultat} />
      </div>
    </div>
  );
}
