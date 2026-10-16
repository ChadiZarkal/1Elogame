'use client';

/**
 * @module dixmais/leaderboard
 * Le classement des infos, par la note que leur donnent les joueurs.
 *
 * Même échelle que le jeu (0 à 15, 10 au départ) et même calcul que la « note
 * des autres » du verdict (`lib/dixmaisNote`) : les deux écrans affichent le
 * même chiffre pour la même phrase. Seules comptent les notes de la mécanique
 * actuelle. Deux listes : les red flags qui coûtent le
 * plus, les green flags qui rapportent le plus.
 *
 * Le classement est rendu côté serveur et passé en `initialData` : la page
 * figure au sitemap, elle doit livrer ses lignes dans le HTML.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import type { DixMaisStatement } from '@/types/database';
import { NOTES_MIN_COMPARAISON, type NoteMesuree } from '@/lib/dixmaisNote';
import { scoreInk } from '../scale';
import { formatNote } from '../moyenne';
import { TEINTES } from '../ui';

export interface LeaderboardEntry extends DixMaisStatement {
  avg_delta: number;
  elimination_rate: number;
  note: NoteMesuree | null;
}

type Onglet = 'negative' | 'positive';

const ONGLETS: { cle: Onglet; libelle: string; sousTitre: string }[] = [
  { cle: 'negative', libelle: '🚩 Red flags', sousTitre: 'Ce qui fait le plus chuter la note' },
  { cle: 'positive', libelle: '🟢 Green flags', sousTitre: 'Ce qui la fait le plus monter' },
];

export default function LeaderboardClient({ initialData }: { initialData: LeaderboardEntry[] }) {
  const [data, setData] = useState<LeaderboardEntry[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [onglet, setOnglet] = useState<Onglet>('negative');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/dixmais/leaderboard?limit=100', { cache: 'no-store' });
      const json = await res.json();
      setData(json.data ?? []);
    } catch {
      setError('Le classement ne répond pas. Réessaie dans un instant.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Le serveur a déjà fourni une liste : on ne refait la requête au montage que
  // si elle est vide (base indisponible à la régénération).
  useEffect(() => {
    if (initialData.length === 0) load();
  }, [initialData.length, load]);

  // Red flags : la note la plus basse en tête. Green flags : la plus haute.
  const liste = data
    .filter((s) => s.type === onglet && s.note)
    .sort((a, b) => (onglet === 'negative' ? a.note!.note - b.note!.note : b.note!.note - a.note!.note));
  const courant = ONGLETS.find((o) => o.cle === onglet)!;

  return (
    <div className="relative min-h-[calc(100dvh-var(--header-h,3rem))] pb-10 text-white" style={{ background: TEINTES.fond }}>
      <div className="mx-auto max-w-lg px-5">
        <div className="flex h-12 items-center justify-between">
          <Link href="/dixmais" className="-ml-2 flex min-h-11 items-center gap-1.5 px-2 text-[13px] font-semibold" style={{ color: TEINTES.secondaire }}>
            <ArrowLeft size={15} /> Jeu
          </Link>
          <button
            onClick={load}
            aria-label="Actualiser le classement"
            className="-mr-2.5 flex h-11 w-11 cursor-pointer items-center justify-center text-white/30 transition-colors hover:text-white/60 active:scale-90"
          >
            <RotateCcw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <header className="pt-4 pb-6">
          <h1 className="text-[clamp(1.9rem,9vw,2.6rem)] font-black uppercase leading-none tracking-tight">Le classement</h1>
          <p className="mt-3 text-[15px] leading-snug" style={{ color: TEINTES.secondaire }}>
            La note moyenne que les joueurs donnent à chaque info, notée seule, en partant de 10.
          </p>
        </header>

        {/* Deux onglets, soulignés : pas de boutons pleins. */}
        <div className="flex border-b" style={{ borderColor: TEINTES.filet }} role="tablist">
          {ONGLETS.map((o) => {
            const actif = o.cle === onglet;
            return (
              <button
                key={o.cle}
                role="tab"
                aria-selected={actif}
                onClick={() => setOnglet(o.cle)}
                className="-mb-px flex-1 cursor-pointer border-b-2 py-3 text-[14px] font-bold transition-colors"
                style={{ borderColor: actif ? '#FFFFFF' : 'transparent', color: actif ? TEINTES.texte : TEINTES.discret }}
              >
                {o.libelle}
              </button>
            );
          })}
        </div>
        <p className="pt-4 pb-2 text-[12px] font-semibold" style={{ color: TEINTES.discret }}>{courant.sousTitre}</p>

        {error ? (
          <p className="py-12 text-center text-sm font-semibold text-red-400">{error}</p>
        ) : liste.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-[15px] font-semibold" style={{ color: TEINTES.secondaire }}>Pas encore assez de notes.</p>
            <p className="mt-1 text-[13px]" style={{ color: TEINTES.discret }}>
              Une info entre au classement à {NOTES_MIN_COMPARAISON} notes. Joue quelques profils pour le remplir.
            </p>
          </div>
        ) : (
          <ol>
            {liste.map((s, i) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.2) }}
                className="flex items-center gap-3 border-b py-3.5"
                style={{ borderColor: TEINTES.filet }}
              >
                <span className="w-6 shrink-0 text-center text-[13px] font-bold tabular-nums" style={{ color: TEINTES.discret }}>
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold leading-snug [overflow-wrap:anywhere]" style={{ color: TEINTES.texte }}>
                    {s.text}
                  </p>
                  <p className="mt-0.5 text-[12px]" style={{ color: TEINTES.discret }}>
                    {s.note!.echantillon.toLocaleString('fr-FR')} notes
                  </p>
                </div>
                <span className="shrink-0 text-[20px] font-black tabular-nums" style={{ color: scoreInk(s.note!.note) }}>
                  {formatNote(s.note!.note)}
                </span>
              </motion.li>
            ))}
          </ol>
        )}

        {/* Une info n'entre au classement qu'à partir de quelques notes :
            sous ce seuil, sa moyenne serait celle d'un ou deux joueurs. */}
        {liste.length > 0 && (
          <p className="mt-4 text-[12px] leading-snug" style={{ color: TEINTES.discret }}>
            Une info apparaît ici dès qu&apos;elle a reçu {NOTES_MIN_COMPARAISON} notes.
          </p>
        )}

        <div className="mt-8">
          <Link
            href="/dixmais"
            className="block w-full rounded-2xl py-4 text-center text-[15px] font-black uppercase tracking-wider text-black"
            style={{ background: TEINTES.or }}
          >
            Jouer
          </Link>
        </div>
      </div>
    </div>
  );
}
