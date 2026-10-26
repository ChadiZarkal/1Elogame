'use client';

/**
 * @module components/affiliation/EncartPisseDebout
 * Encart affilié de l'accueil : le pisse-debout, présenté comme une question
 * du jeu.
 *
 * Une bannière « produit » au milieu de jeux se lit comme une pub et s'ignore.
 * Posée comme un red flag à trancher, elle parle la langue du site : on vote
 * d'abord, et le verdict amène le produit. Le bouton vers Amazon reste visible
 * avant le vote — le geste d'intérêt ne doit pas être conditionné à un autre.
 *
 * Ni prix, ni note, ni photo : les règles du programme Partenaires Amazon les
 * interdisent hors de leur API (voir `config/affiliation`). Le texte ne
 * reprend que ce que dit la fiche du produit.
 */

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useHaptics } from '@/lib/hooks';
import { PISSE_DEBOUT_URL } from '@/config/affiliation';

const FOCUS =
  'outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]';

type Vote = 'red' | 'green';

export function EncartPisseDebout({ className = '' }: { className?: string }) {
  const { tap } = useHaptics();
  const [vote, setVote] = useState<Vote | null>(null);

  const voter = (choix: Vote) => {
    tap();
    setVote(choix);
  };

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-(--border-subtle) bg-(--surface-1) p-5 ${className}`}
      aria-labelledby="titre-festival"
    >
      {/* Les deux couleurs du site, une par moitié : la carte annonce un
          choix avant qu'on lise la question. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-[#FF3B30] opacity-15 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-[#2ECC71] opacity-15 blur-3xl"
      />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p className="whitespace-nowrap text-[12px] font-black uppercase tracking-[0.12em] text-[#FFC04D] min-[360px]:tracking-[0.18em]">
            🎪 Spécial festival
          </p>
          {/* Une recommandation payée doit se reconnaître comme telle. */}
          <span className="shrink-0 whitespace-nowrap rounded-full border border-white/15 px-2.5 py-0.5 text-[12px] font-bold text-(--text-3)">
            Lien affilié
          </span>
        </div>

        <h2
          id="titre-festival"
          className="mt-3 text-[18px] font-black uppercase leading-[1.05] tracking-[-0.02em] text-white min-[360px]:text-[20px]"
        >
          {/* Espace insécable : le « ? » ne part pas seul à la ligne. */}
          Red flag ou green flag&nbsp;?
        </h2>
        <p className="mt-2 text-[16px] font-semibold leading-snug text-(--text-1)">
          Au festival, elle sort un pisse‑debout de son sac et zappe les 40 minutes de queue
          aux toilettes.
        </p>

        {/* Le vote ne s'enregistre nulle part : c'est l'accroche, pas une
            donnée du classement. */}
        {vote === null ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => voter('red')}
              className={`flex min-h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[#FF3B30]/50 bg-[#FF3B30]/10 px-2 text-[13px] font-black uppercase tracking-[0.02em] min-[360px]:text-[14px] min-[360px]:tracking-[0.04em] text-[#FFC4BC] transition-colors hover:bg-[#FF3B30]/20 motion-safe:active:scale-[0.97] ${FOCUS}`}
            >
              <span aria-hidden>🚩</span> Red flag
            </button>
            <button
              type="button"
              onClick={() => voter('green')}
              className={`flex min-h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[#2ECC71]/50 bg-[#2ECC71]/10 px-2 text-[13px] font-black uppercase tracking-[0.02em] min-[360px]:text-[14px] min-[360px]:tracking-[0.04em] text-[#5FE39B] transition-colors hover:bg-[#2ECC71]/20 motion-safe:active:scale-[0.97] ${FOCUS}`}
            >
              <span aria-hidden>🟢</span> Green flag
            </button>
          </div>
        ) : (
          <div
            role="status"
            className="mt-4 rounded-xl border border-[#2ECC71]/40 bg-[#2ECC71]/10 px-4 py-3"
          >
            <p className="text-[16px] font-black text-[#5FE39B]">
              {vote === 'green' ? 'Bien vu : green flag.' : 'Raté : green flag, évidemment.'}
            </p>
            <p className="mt-1 text-[14px] font-medium leading-snug text-(--text-2)">
              Léger, pliable, réutilisable : il se glisse dans un sac et personne ne sait ce que
              c&apos;est.
            </p>
          </div>
        )}

        <a
          href={PISSE_DEBOUT_URL}
          target="_blank"
          rel="sponsored noopener"
          onClick={tap}
          className={`group mt-3 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2ECC71] px-4 text-[14px] font-black text-black shadow-[0_8px_30px_-8px_rgba(46,204,113,0.5)] transition-[filter] hover:brightness-110 ${FOCUS}`}
        >
          {/* À 320 px, l'intitulé long passe sur deux lignes. */}
          <span className="min-[360px]:hidden">Voir sur Amazon</span>
          <span className="hidden min-[360px]:inline">Voir le pisse-debout sur Amazon</span>
          <ExternalLink size={16} strokeWidth={2.5} aria-hidden />
        </a>

        <p className="mt-3 text-[12px] font-medium leading-snug text-(--text-3)">
          En tant que Partenaire Amazon, Red or Green réalise un bénéfice sur les achats
          remplissant les conditions requises. Ça ne change rien au prix pour toi.
        </p>
      </div>
    </section>
  );
}
