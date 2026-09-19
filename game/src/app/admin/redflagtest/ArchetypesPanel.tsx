'use client';

/**
 * @module admin/redflagtest/ArchetypesPanel
 * Les noms donnés aux profils.
 *
 * COMMENT ILS SONT CHOISIS EN JEU
 *   Le récap lit les DEUX axes dominants du radar et cherche l'archétype qui
 *   porte cette paire. Si le deuxième axe est trop loin derrière, il ne retient
 *   que le premier et cherche un archétype à une seule catégorie. Si rien ne
 *   correspond, il se rabat sur l'archétype du premier axe seul ; et si celui-là
 *   n'existe pas non plus, le joueur n'a pas de nom.
 *
 * CE QUE L'ÉCRAN DOIT MONTRER
 *   Quelles paires sont couvertes et lesquelles ne le sont pas. Une paire
 *   manquante n'est pas une erreur — elle est silencieuse en jeu — mais elle
 *   doit être visible ici, sinon personne ne saura jamais qu'il manque un nom.
 *   Avec six catégories il y a quinze paires possibles, plus six profils à
 *   dominante unique.
 */

import { useMemo, useState } from 'react';
import type { Archetype, Tag } from '@/lib/rft/types';
import { creerArchetype, effacerArchetype, modifierArchetype } from './api';

interface Brouillon {
  id: string | null;
  tagA: string;
  tagB: string;
  emoji: string;
  titre: string;
  soustitre: string;
}

const VIDE: Brouillon = { id: null, tagA: '', tagB: '', emoji: '', titre: '', soustitre: '' };

/** La clé d'une paire, rangée — c'est ainsi que la base la stocke. */
function cle(a: string, b: string | null): string {
  if (!b) return `${a}|`;
  return [a, b].sort().join('|');
}

export function ArchetypesPanel({
  archetypes, tags, onRecharger, onErreur,
}: {
  archetypes: Archetype[];
  tags: Tag[];
  onRecharger: () => Promise<void>;
  onErreur: (message: string) => void;
}) {
  const [brouillon, setBrouillon] = useState<Brouillon | null>(null);
  const [occupe, setOccupe] = useState(false);

  const actifs = useMemo(() => tags.filter((t) => t.isActive), [tags]);
  const nom = (id: string) => tags.find((t) => t.id === id)?.label ?? '—';
  const couvertes = useMemo(
    () => new Set(archetypes.map((a) => cle(a.tagA, a.tagB))),
    [archetypes],
  );

  /** Toutes les combinaisons possibles, couvertes ou non. */
  const attendues = useMemo(() => {
    const liste: Array<{ cle: string; a: string; b: string | null }> = [];
    for (const t of actifs) liste.push({ cle: cle(t.id, null), a: t.id, b: null });
    for (let i = 0; i < actifs.length; i++) {
      for (let j = i + 1; j < actifs.length; j++) {
        liste.push({ cle: cle(actifs[i].id, actifs[j].id), a: actifs[i].id, b: actifs[j].id });
      }
    }
    return liste;
  }, [actifs]);

  const manquantes = attendues.filter((p) => !couvertes.has(p.cle));

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
      tagA: brouillon.tagA,
      tagB: brouillon.tagB || null,
      emoji: brouillon.emoji.trim() || null,
      titre: brouillon.titre.trim(),
      soustitre: brouillon.soustitre.trim() || null,
    };
    void agir(() =>
      brouillon.id ? modifierArchetype(brouillon.id, charge) : creerArchetype(charge),
    );
  };

  const tries = [...archetypes].sort((a, b) => {
    const seul = Number(a.tagB === null) - Number(b.tagB === null);
    return seul !== 0 ? -seul : nom(a.tagA).localeCompare(nom(b.tagA));
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-xs leading-snug text-[#737373]">
          Le récap lit les deux axes dominants du radar et cherche le nom qui porte cette
          paire. Quand un seul axe se détache vraiment, il cherche l’archétype de cette
          catégorie seule. Sans correspondance, le joueur n’a pas de nom — ce n’est pas une
          erreur, juste une ligne en moins.
        </p>
        <button
          onClick={() => setBrouillon({ ...VIDE, tagA: actifs[0]?.id ?? '' })}
          className="cursor-pointer rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-bold text-white hover:bg-[#B91C1C]"
        >
          + Nouvel archétype
        </button>
      </div>

      {manquantes.length > 0 && (
        <details className="mb-4 rounded-xl border border-white/10 bg-white/3 p-3">
          <summary className="cursor-pointer text-xs font-bold text-[#A3A3A3]">
            {manquantes.length} combinaison{manquantes.length > 1 ? 's' : ''} sans nom
            <span className="ml-2 font-normal text-[#525252]">
              sur {attendues.length} possibles
            </span>
          </summary>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {manquantes.map((p) => (
              <button
                key={p.cle}
                onClick={() =>
                  setBrouillon({ ...VIDE, tagA: p.a, tagB: p.b ?? '' })
                }
                className="cursor-pointer rounded border border-dashed border-white/20 px-2 py-1 text-[11px] text-[#737373] hover:border-[#DC2626] hover:text-[#F5F5F5]"
              >
                {nom(p.a)}
                {p.b ? ` + ${nom(p.b)}` : ' (seul)'}
              </button>
            ))}
          </div>
        </details>
      )}

      {brouillon && (
        <div className="mb-4 rounded-xl border border-[#DC2626]/40 bg-[#DC2626]/5 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#737373]">
              Axe dominant
              <select
                value={brouillon.tagA}
                onChange={(e) => setBrouillon({ ...brouillon, tagA: e.target.value })}
                className="mt-1 w-full cursor-pointer rounded-lg border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#F5F5F5] outline-none focus:border-[#DC2626]"
              >
                {actifs.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </label>

            <label className="text-xs font-bold uppercase tracking-wider text-[#737373]">
              Second axe
              <select
                value={brouillon.tagB}
                onChange={(e) => setBrouillon({ ...brouillon, tagB: e.target.value })}
                className="mt-1 w-full cursor-pointer rounded-lg border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#F5F5F5] outline-none focus:border-[#DC2626]"
              >
                <option value="">— aucun (dominante unique)</option>
                {actifs.filter((t) => t.id !== brouillon.tagA).map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#737373]">
              Emoji
              <input
                value={brouillon.emoji}
                onChange={(e) => setBrouillon({ ...brouillon, emoji: e.target.value })}
                placeholder="🎭"
                className="mt-1 w-20 rounded-lg border border-white/10 bg-[#0D0D0D] px-3 py-2 text-center text-sm outline-none focus:border-[#DC2626]"
              />
            </label>
            <label className="min-w-[12rem] flex-1 text-xs font-bold uppercase tracking-wider text-[#737373]">
              Nom du profil
              <input
                value={brouillon.titre}
                onChange={(e) => setBrouillon({ ...brouillon, titre: e.target.value })}
                placeholder="LE STRATÈGE"
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#F5F5F5] outline-none focus:border-[#DC2626]"
              />
            </label>
          </div>

          <label className="mt-3 block text-xs font-bold uppercase tracking-wider text-[#737373]">
            Sous-titre
            <input
              value={brouillon.soustitre}
              onChange={(e) => setBrouillon({ ...brouillon, soustitre: e.target.value })}
              placeholder="Tu ne mens pas tout le temps. Juste quand ça sert."
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#F5F5F5] outline-none focus:border-[#DC2626]"
            />
          </label>

          <div className="mt-4 flex gap-2">
            <button
              onClick={enregistrer}
              disabled={occupe || !brouillon.tagA || brouillon.titre.trim().length === 0}
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
        {tries.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 p-3"
          >
            <span className="w-10 shrink-0 text-center text-2xl">{a.emoji ?? '—'}</span>
            <div className="min-w-0 flex-1">
              <p className="font-black uppercase tracking-tight text-[#F5F5F5]">{a.titre}</p>
              {a.soustitre && <p className="text-xs text-[#A3A3A3]">{a.soustitre}</p>}
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-[#525252]">
                {nom(a.tagA)}
                {a.tagB ? ` + ${nom(a.tagB)}` : ' · dominante unique'}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <button
                onClick={() =>
                  setBrouillon({
                    id: a.id,
                    tagA: a.tagA,
                    tagB: a.tagB ?? '',
                    emoji: a.emoji ?? '',
                    titre: a.titre,
                    soustitre: a.soustitre ?? '',
                  })
                }
                disabled={occupe}
                className="cursor-pointer text-xs text-[#A3A3A3] hover:text-[#F5F5F5]"
              >Modifier</button>
              <button
                onClick={() => {
                  if (!confirm(`Supprimer « ${a.titre} » ?`)) return;
                  void agir(() => effacerArchetype(a.id));
                }}
                disabled={occupe}
                className="cursor-pointer text-xs text-[#737373] hover:text-[#DC2626]"
              >Supprimer</button>
            </div>
          </div>
        ))}

        {tries.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-[#737373]">
            Aucun archétype. Le récap affichera le verdict, mais pas de nom de profil.
          </p>
        )}
      </div>
    </div>
  );
}
