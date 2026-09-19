'use client';

/**
 * @module admin/redflagtest/TagsPanel
 * Les catégories, qui sont aussi les axes du radar.
 *
 * CE QUE L'ÉCRAN DOIT DIRE
 *   Un tag n'est pas une étiquette décorative : c'est un axe du radar de fin de
 *   partie, et sa valeur est la part des points qu'il était possible d'y
 *   prendre. Le nombre de questions qui le portent est donc affiché — un tag
 *   sans question ne s'affichera jamais, et cela doit se voir ici plutôt que se
 *   découvrir en jouant.
 */

import { useState } from 'react';
import type { QuestionAdmin, Tag } from '@/lib/rft/types';
import { creerTag, effacerTag, modifierTag } from './api';

interface Brouillon {
  id: string | null;
  slug: string;
  label: string;
  description: string;
  color: string;
  isActive: boolean;
}

const VIDE: Brouillon = {
  id: null, slug: '', label: '', description: '', color: '#38bdf8', isActive: true,
};

/** Un slug à partir du nom : minuscules, sans accent, tirets. */
function slugifier(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export function TagsPanel({
  tags, questions, onRecharger, onErreur,
}: {
  tags: Tag[];
  questions: QuestionAdmin[];
  onRecharger: () => Promise<void>;
  onErreur: (message: string) => void;
}) {
  const [brouillon, setBrouillon] = useState<Brouillon | null>(null);
  const [occupe, setOccupe] = useState(false);

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
      slug: brouillon.slug.trim() || slugifier(brouillon.label),
      label: brouillon.label.trim(),
      description: brouillon.description.trim() || null,
      color: brouillon.color || null,
      position: brouillon.id
        ? (tags.find((t) => t.id === brouillon.id)?.position ?? tags.length)
        : tags.length,
      isActive: brouillon.isActive,
    };
    void agir(() => (brouillon.id ? modifierTag(brouillon.id, charge) : creerTag(charge)));
  };

  const compte = (tagId: string) => questions.filter((q) => q.tagIds.includes(tagId)).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-xs leading-snug text-[#737373]">
          Chaque tag est un axe du radar de fin de partie. Sa valeur est la part des points
          qu’il était possible d’y prendre — c’est ce qui met sur un pied d’égalité un axe de
          vingt questions et un axe de trois.
        </p>
        <button
          onClick={() => setBrouillon({ ...VIDE })}
          className="cursor-pointer rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-bold text-white hover:bg-[#B91C1C]"
        >
          + Nouveau tag
        </button>
      </div>

      {brouillon && (
        <div className="mb-4 rounded-xl border border-[#DC2626]/40 bg-[#DC2626]/5 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#737373]">
              Nom
              <input
                value={brouillon.label}
                onChange={(e) => {
                  const label = e.target.value;
                  setBrouillon({
                    ...brouillon,
                    label,
                    // Le slug suit le nom tant qu'on n'y a pas touché : sur un
                    // tag existant, le changer romprait un identifiant stable.
                    slug: brouillon.id ? brouillon.slug : slugifier(label),
                  });
                }}
                placeholder="Contrôle"
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#F5F5F5] outline-none focus:border-[#DC2626]"
              />
            </label>

            <label className="text-xs font-bold uppercase tracking-wider text-[#737373]">
              Identifiant
              <input
                value={brouillon.slug}
                onChange={(e) => setBrouillon({ ...brouillon, slug: slugifier(e.target.value) })}
                placeholder="controle"
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0D0D0D] px-3 py-2 font-mono text-sm font-normal normal-case tracking-normal text-[#A3A3A3] outline-none focus:border-[#DC2626]"
              />
            </label>
          </div>

          <label className="mt-3 block text-xs font-bold uppercase tracking-wider text-[#737373]">
            Description
            <input
              value={brouillon.description}
              onChange={(e) => setBrouillon({ ...brouillon, description: e.target.value })}
              placeholder="Emprise, surveillance, besoin de décider pour l’autre"
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#F5F5F5] outline-none focus:border-[#DC2626]"
            />
          </label>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#737373]">
              Couleur
              <input
                type="color"
                value={brouillon.color}
                onChange={(e) => setBrouillon({ ...brouillon, color: e.target.value })}
                className="h-8 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
              />
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#A3A3A3]">
              <input
                type="checkbox"
                checked={brouillon.isActive}
                onChange={(e) => setBrouillon({ ...brouillon, isActive: e.target.checked })}
                className="accent-[#DC2626]"
              />
              Actif
            </label>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={enregistrer}
              disabled={occupe || brouillon.label.trim().length === 0}
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
        {tags.map((t) => {
          const n = compte(t.id);
          return (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 p-3"
              style={{ opacity: t.isActive ? 1 : 0.5 }}
            >
              <span
                className="h-8 w-8 shrink-0 rounded-lg"
                style={{ background: t.color ?? '#737373' }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#F5F5F5]">
                  {t.label}
                  {!t.isActive && (
                    <span className="ml-2 text-[10px] font-bold uppercase text-[#737373]">
                      inactif
                    </span>
                  )}
                </p>
                {t.description && <p className="text-xs text-[#737373]">{t.description}</p>}
                <p className="mt-0.5 text-[11px]" style={{ color: n === 0 ? '#DC2626' : '#525252' }}>
                  {n === 0
                    ? 'aucune question — cet axe n’apparaîtra pas sur le radar'
                    : `${n} question${n > 1 ? 's' : ''}`}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <button
                  onClick={() =>
                    setBrouillon({
                      id: t.id,
                      slug: t.slug,
                      label: t.label,
                      description: t.description ?? '',
                      color: t.color ?? '#38bdf8',
                      isActive: t.isActive,
                    })
                  }
                  disabled={occupe}
                  className="cursor-pointer text-xs text-[#A3A3A3] hover:text-[#F5F5F5]"
                >Modifier</button>
                <button
                  onClick={() => {
                    if (!confirm(`Supprimer le tag « ${t.label} » ?\n\n${n} question${n > 1 ? 's le perdront' : ' le perdra'}, mais aucune ne sera supprimée.`)) return;
                    void agir(() => effacerTag(t.id));
                  }}
                  disabled={occupe}
                  className="cursor-pointer text-xs text-[#737373] hover:text-[#DC2626]"
                >Supprimer</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
