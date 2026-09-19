'use client';

/**
 * @module admin/redflagtest/VerdictsPanel
 * Les paliers de fin de partie.
 *
 * COMMENT ILS SE LISENT
 *   Chaque palier est ouvert vers le haut : celui qui s'applique est le plus
 *   haut seuil que le score atteint. Il n'y a donc pas de borne supérieure à
 *   saisir, et pas de trou possible entre deux paliers — mais il faut un palier
 *   à zéro, sans quoi les petits scores n'ont aucun verdict. L'écran le dit
 *   quand c'est le cas.
 *
 *   La portée de chaque palier est affichée telle qu'elle sera vécue
 *   (« de 25 à 49 »), parce que personne ne raisonne spontanément en seuils
 *   ouverts.
 */

import { useState } from 'react';
import type { Verdict } from '@/lib/rft/types';
import { creerVerdict, effacerVerdict, modifierVerdict } from './api';

interface Brouillon {
  id: string | null;
  minScore: number;
  emoji: string;
  titre: string;
  soustitre: string;
}

const VIDE: Brouillon = { id: null, minScore: 0, emoji: '', titre: '', soustitre: '' };

export function VerdictsPanel({
  verdicts, budget, onRecharger, onErreur,
}: {
  verdicts: Verdict[];
  /** Le maximum atteignable, pour signaler un palier hors de portée. */
  budget: number;
  onRecharger: () => Promise<void>;
  onErreur: (message: string) => void;
}) {
  const [brouillon, setBrouillon] = useState<Brouillon | null>(null);
  const [occupe, setOccupe] = useState(false);

  const tries = [...verdicts].sort((a, b) => a.minScore - b.minScore);
  const sansPlancher = tries.length > 0 && tries[0].minScore > 0;

  const agir = async (action: () => Promise<unknown>) => {
    setOccupe(true);
    try {
      await action();
      await onRecharger();
      setBrouillon(null);
    } catch (e) {
      onErreur(e instanceof Error ? e.message : String(e));
    } finally {
      setOccupe(false);
    }
  };

  const enregistrer = () => {
    if (!brouillon) return;
    const charge = {
      minScore: brouillon.minScore,
      emoji: brouillon.emoji.trim() || null,
      titre: brouillon.titre.trim(),
      soustitre: brouillon.soustitre.trim() || null,
    };
    void agir(() =>
      brouillon.id ? modifierVerdict(brouillon.id, charge) : creerVerdict(charge),
    );
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-xs leading-snug text-[#737373]">
          Chaque palier s’applique dès que le score l’atteint, jusqu’au palier suivant. Le
          dernier attrape tout ce qui dépasse — y compris les scores au-delà de 100, qui
          existent puisque le test peut rendre jusqu’à {budget}.
        </p>
        <button
          onClick={() => setBrouillon({ ...VIDE })}
          className="cursor-pointer rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-bold text-white hover:bg-[#B91C1C]"
        >
          + Nouveau palier
        </button>
      </div>

      {sansPlancher && (
        <p className="mb-3 rounded-lg border border-[#DC2626]/40 bg-[#DC2626]/10 p-3 text-xs text-[#FCA5A5]">
          Aucun palier ne commence à 0 : un joueur qui marque moins de {tries[0].minScore}{' '}
          points n’aura aucun verdict affiché.
        </p>
      )}

      {brouillon && (
        <div className="mb-4 rounded-xl border border-[#DC2626]/40 bg-[#DC2626]/5 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#737373]">
              À partir de
              <input
                type="number"
                min={0}
                value={brouillon.minScore}
                onChange={(e) => setBrouillon({ ...brouillon, minScore: Number(e.target.value) || 0 })}
                className="mt-1 w-24 rounded-lg border border-white/10 bg-[#0D0D0D] px-3 py-2 text-center text-sm font-black tabular-nums text-[#F5F5F5] outline-none focus:border-[#DC2626]"
              />
            </label>

            <label className="text-xs font-bold uppercase tracking-wider text-[#737373]">
              Emoji
              <input
                value={brouillon.emoji}
                onChange={(e) => setBrouillon({ ...brouillon, emoji: e.target.value })}
                placeholder="🔴"
                className="mt-1 w-20 rounded-lg border border-white/10 bg-[#0D0D0D] px-3 py-2 text-center text-sm outline-none focus:border-[#DC2626]"
              />
            </label>

            <label className="min-w-[12rem] flex-1 text-xs font-bold uppercase tracking-wider text-[#737373]">
              Titre
              <input
                value={brouillon.titre}
                onChange={(e) => setBrouillon({ ...brouillon, titre: e.target.value })}
                placeholder="LE DRAPEAU EST PLANTÉ"
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#F5F5F5] outline-none focus:border-[#DC2626]"
              />
            </label>
          </div>

          <label className="mt-3 block text-xs font-bold uppercase tracking-wider text-[#737373]">
            Sous-titre
            <input
              value={brouillon.soustitre}
              onChange={(e) => setBrouillon({ ...brouillon, soustitre: e.target.value })}
              placeholder="On ne va pas te mentir, on a relu le résultat deux fois."
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#F5F5F5] outline-none focus:border-[#DC2626]"
            />
          </label>

          <div className="mt-4 flex gap-2">
            <button
              onClick={enregistrer}
              disabled={occupe || brouillon.titre.trim().length === 0}
              className="cursor-pointer rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-bold text-white hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {occupe ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button
              onClick={() => setBrouillon(null)}
              disabled={occupe}
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-bold text-[#A3A3A3] hover:text-[#F5F5F5]"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {tries.map((v, i) => {
          const suivant = tries[i + 1];
          const portee = suivant ? `de ${v.minScore} à ${suivant.minScore - 1}` : `${v.minScore} et au-delà`;
          const horsPortee = v.minScore > budget;

          return (
            <div
              key={v.id}
              className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 p-3"
            >
              <span className="w-12 shrink-0 text-center text-2xl">{v.emoji ?? '—'}</span>
              <div className="min-w-0 flex-1">
                <p className="font-black uppercase tracking-tight text-[#F5F5F5]">{v.titre}</p>
                {v.soustitre && <p className="text-xs text-[#A3A3A3]">{v.soustitre}</p>}
                <p className="mt-0.5 text-[11px] font-bold tabular-nums text-[#525252]">
                  {portee}
                  {horsPortee && (
                    <span className="ml-2 text-[#DC2626]">
                      hors de portée — le test ne peut pas dépasser {budget}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <button
                  onClick={() =>
                    setBrouillon({
                      id: v.id,
                      minScore: v.minScore,
                      emoji: v.emoji ?? '',
                      titre: v.titre,
                      soustitre: v.soustitre ?? '',
                    })
                  }
                  disabled={occupe}
                  className="cursor-pointer text-xs text-[#A3A3A3] hover:text-[#F5F5F5]"
                >Modifier</button>
                <button
                  onClick={() => {
                    if (!confirm(`Supprimer le palier « ${v.titre} » ?`)) return;
                    void agir(() => effacerVerdict(v.id));
                  }}
                  disabled={occupe}
                  className="cursor-pointer text-xs text-[#737373] hover:text-[#DC2626]"
                >Supprimer</button>
              </div>
            </div>
          );
        })}

        {tries.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-[#737373]">
            Aucun palier. La fin de partie n’affichera pas de verdict.
          </p>
        )}
      </div>
    </div>
  );
}
