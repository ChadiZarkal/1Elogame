'use client';

/**
 * @module admin/redflagtest/QuestionsPanel
 * La saisie des questions, de leurs réponses et de leurs points.
 *
 * CE QUE L'ÉCRAN DOIT RENDRE ÉVIDENT
 *   Un point vaut un point de pourcentage. Chaque question affiche donc ce
 *   qu'elle coûte au pire (« +18 au maximum »), et l'en-tête affiche le total
 *   du questionnaire. Sans ces deux nombres, on écrit trente questions à
 *   l'aveugle et on découvre en jouant que le test rend 400 %.
 *
 * POURQUOI DES FLÈCHES ET PAS UN GLISSER-DÉPOSER
 *   L'ordre se règle depuis un téléphone aussi souvent que depuis un bureau.
 *   Un glisser-déposer tactile demande une bibliothèque, se bat avec le
 *   défilement de la page, et échoue silencieusement quand le doigt sort du
 *   conteneur. Deux flèches ne font ni l'un ni l'autre.
 */

import { useState } from 'react';
import type { QuestionAdmin, Tag } from '@/lib/rft/types';
import {
  creerQuestion,
  effacerQuestion,
  modifierQuestion,
  reordonner,
} from './api';

interface BrouillonReponse {
  texte: string;
  points: number;
  pique: string;
}

interface Brouillon {
  id: string | null;
  texte: string;
  precision: string;
  active: boolean;
  tagIds: string[];
  reponses: BrouillonReponse[];
}

const VIDE: Brouillon = {
  id: null,
  texte: '',
  precision: '',
  active: true,
  tagIds: [],
  reponses: [
    { texte: '', points: 0, pique: '' },
    { texte: '', points: 0, pique: '' },
  ],
};

function versBrouillon(q: QuestionAdmin): Brouillon {
  return {
    id: q.id,
    texte: q.texte,
    precision: q.precision ?? '',
    active: q.active,
    tagIds: [...q.tagIds],
    reponses: q.reponses.map((r) => ({
      texte: r.texte,
      points: r.points,
      pique: r.pique ?? '',
    })),
  };
}

/** Le pire score que cette question puisse ajouter. */
function pire(reponses: Array<{ points: number }>): number {
  return reponses.length === 0 ? 0 : Math.max(...reponses.map((r) => r.points));
}

export function QuestionsPanel({
  questions,
  tags,
  budget,
  onRecharger,
  onErreur,
}: {
  questions: QuestionAdmin[];
  tags: Tag[];
  budget: number;
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
      texte: brouillon.texte.trim(),
      precision: brouillon.precision.trim() || null,
      active: brouillon.active,
      position: brouillon.id
        ? (questions.find((q) => q.id === brouillon.id)?.position ?? questions.length)
        : questions.length,
      tagIds: brouillon.tagIds,
      reponses: brouillon.reponses
        .filter((r) => r.texte.trim().length > 0)
        .map((r) => ({
          texte: r.texte.trim(),
          points: r.points,
          pique: r.pique.trim() || null,
        })),
    };

    void agir(() =>
      brouillon.id ? modifierQuestion(brouillon.id, charge) : creerQuestion(charge),
    );
  };

  const deplacer = (index: number, sens: -1 | 1) => {
    const cible = index + sens;
    if (cible < 0 || cible >= questions.length) return;
    const ids = questions.map((q) => q.id);
    [ids[index], ids[cible]] = [ids[cible], ids[index]];
    void agir(() => reordonner(ids));
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[#A3A3A3]">
            {questions.length} question{questions.length > 1 ? 's' : ''}
            {' · '}
            <span className="font-bold text-[#F5F5F5]">{budget} points</span> au maximum
          </p>
          <p className="mt-0.5 text-xs text-[#737373]">
            C’est le score de quelqu’un qui coche systématiquement la pire réponse. Il n’est
            pas plafonné : au-delà de 100, le joueur voit « {budget} % red flag ».
          </p>
        </div>
        <button
          onClick={() => setBrouillon({ ...VIDE, reponses: VIDE.reponses.map((r) => ({ ...r })) })}
          className="cursor-pointer rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#B91C1C]"
        >
          + Nouvelle question
        </button>
      </div>

      {brouillon && (
        <Editeur
          brouillon={brouillon}
          tags={tags}
          occupe={occupe}
          onChange={setBrouillon}
          onEnregistrer={enregistrer}
          onAnnuler={() => setBrouillon(null)}
        />
      )}

      <div className="flex flex-col gap-2">
        {questions.map((q, i) => (
          <Ligne
            key={q.id}
            question={q}
            tags={tags}
            premiere={i === 0}
            derniere={i === questions.length - 1}
            occupe={occupe}
            onMonter={() => deplacer(i, -1)}
            onDescendre={() => deplacer(i, 1)}
            onEditer={() => setBrouillon(versBrouillon(q))}
            onSupprimer={() => {
              if (!confirm(`Supprimer « ${q.texte} » ?\n\nLes parties déjà jouées qui citaient cette question perdront leur réponse. Désactiver la question conserve tout.`)) return;
              void agir(() => effacerQuestion(q.id));
            }}
          />
        ))}

        {questions.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-[#737373]">
            Aucune question. Le test n’est pas jouable tant qu’il n’y en a pas au moins une.
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Ligne({
  question, tags, premiere, derniere, occupe,
  onMonter, onDescendre, onEditer, onSupprimer,
}: {
  question: QuestionAdmin;
  tags: Tag[];
  premiere: boolean;
  derniere: boolean;
  occupe: boolean;
  onMonter: () => void;
  onDescendre: () => void;
  onEditer: () => void;
  onSupprimer: () => void;
}) {
  const siens = tags.filter((t) => question.tagIds.includes(t.id));

  return (
    <div
      className="rounded-xl border p-3"
      style={{
        borderColor: question.active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
        background: 'rgba(255,255,255,0.03)',
        opacity: question.active ? 1 : 0.55,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 flex-col gap-1">
          <button
            onClick={onMonter}
            disabled={premiere || occupe}
            aria-label="Monter"
            className="cursor-pointer rounded bg-white/5 px-2 py-0.5 text-xs text-[#A3A3A3] hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
          >↑</button>
          <button
            onClick={onDescendre}
            disabled={derniere || occupe}
            aria-label="Descendre"
            className="cursor-pointer rounded bg-white/5 px-2 py-0.5 text-xs text-[#A3A3A3] hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
          >↓</button>
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-bold text-[#F5F5F5]">{question.texte}</p>
          {question.precision && (
            <p className="mt-0.5 text-xs text-[#737373]">{question.precision}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {siens.map((t) => (
              <span
                key={t.id}
                className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ background: `${t.color ?? '#737373'}22`, color: t.color ?? '#A3A3A3' }}
              >
                {t.label}
              </span>
            ))}
            {siens.length === 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#DC2626]">
                Sans tag — ne comptera dans aucun axe
              </span>
            )}
            {!question.active && (
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#A3A3A3]">
                Désactivée
              </span>
            )}
          </div>

          <ul className="mt-2 flex flex-col gap-0.5">
            {question.reponses.map((r) => (
              <li key={r.id} className="flex items-baseline gap-2 text-xs">
                <span
                  className="w-10 shrink-0 text-right font-black tabular-nums"
                  style={{ color: r.points > 0 ? '#EF4444' : r.points < 0 ? '#10B981' : '#525252' }}
                >
                  {r.points > 0 ? `+${r.points}` : r.points}
                </span>
                <span className="min-w-0 text-[#A3A3A3]">{r.texte}</span>
                {r.pique && <span className="shrink-0 text-[10px] text-[#525252]">💬</span>}
              </li>
            ))}
            {question.reponses.length === 0 && (
              <li className="text-xs font-bold text-[#DC2626]">
                Aucune réponse — la question sera sautée en jeu
              </li>
            )}
          </ul>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-xs font-black tabular-nums text-[#F5F5F5]">
            +{pire(question.reponses)}
          </span>
          <span className="text-[10px] uppercase text-[#525252]">au pire</span>
          <button
            onClick={onEditer}
            disabled={occupe}
            className="mt-1 cursor-pointer text-xs text-[#A3A3A3] hover:text-[#F5F5F5] disabled:opacity-40"
          >Modifier</button>
          <button
            onClick={onSupprimer}
            disabled={occupe}
            className="cursor-pointer text-xs text-[#737373] hover:text-[#DC2626] disabled:opacity-40"
          >Supprimer</button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Editeur({
  brouillon, tags, occupe, onChange, onEnregistrer, onAnnuler,
}: {
  brouillon: Brouillon;
  tags: Tag[];
  occupe: boolean;
  onChange: (b: Brouillon) => void;
  onEnregistrer: () => void;
  onAnnuler: () => void;
}) {
  const maj = (p: Partial<Brouillon>) => onChange({ ...brouillon, ...p });

  const majReponse = (i: number, p: Partial<BrouillonReponse>) =>
    maj({ reponses: brouillon.reponses.map((r, j) => (j === i ? { ...r, ...p } : r)) });

  const valide = brouillon.texte.trim().length > 0
    && brouillon.reponses.some((r) => r.texte.trim().length > 0);

  return (
    <div className="mb-4 rounded-xl border border-[#DC2626]/40 bg-[#DC2626]/5 p-4">
      <h3 className="mb-3 text-sm font-bold text-[#F5F5F5]">
        {brouillon.id ? 'Modifier la question' : 'Nouvelle question'}
      </h3>

      <Champ label="Énoncé">
        <textarea
          value={brouillon.texte}
          onChange={(e) => maj({ texte: e.target.value })}
          rows={2}
          placeholder="Ton ex t’écrit à 2 h du matin. Tu fais quoi ?"
          className="w-full rounded-lg border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#DC2626]"
        />
      </Champ>

      <Champ label="Précision" aide="Deuxième ligne, plus petite et grise. Facultative.">
        <input
          value={brouillon.precision}
          onChange={(e) => maj({ precision: e.target.value })}
          placeholder="Sois honnête, personne ne lit tes réponses."
          className="w-full rounded-lg border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#DC2626]"
        />
      </Champ>

      <Champ
        label="Tags"
        aide="Les points de cette question comptent EN ENTIER dans chaque tag coché. Le score global, lui, ne les compte qu’une fois."
      >
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => {
            const coche = brouillon.tagIds.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() =>
                  maj({
                    tagIds: coche
                      ? brouillon.tagIds.filter((x) => x !== t.id)
                      : [...brouillon.tagIds, t.id],
                  })
                }
                className="cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-bold transition-colors"
                style={{
                  borderColor: coche ? (t.color ?? '#DC2626') : 'rgba(255,255,255,0.12)',
                  background: coche ? `${t.color ?? '#DC2626'}22` : 'transparent',
                  color: coche ? (t.color ?? '#F5F5F5') : '#A3A3A3',
                }}
              >
                {t.label}
              </button>
            );
          })}
          {tags.length === 0 && (
            <p className="text-xs text-[#737373]">Aucun tag. Créez-en dans l’onglet Tags.</p>
          )}
        </div>
      </Champ>

      <Champ
        label="Réponses"
        aide="Les points s’ajoutent au score, un point valant un point de pourcentage. Le négatif est permis : il rachète."
      >
        <div className="flex flex-col gap-2">
          {brouillon.reponses.map((r, i) => (
            <div key={i} className="rounded-lg border border-white/8 bg-[#0D0D0D] p-2">
              <div className="flex items-center gap-2">
                <input
                  value={r.texte}
                  onChange={(e) => majReponse(i, { texte: e.target.value })}
                  placeholder={`Réponse ${i + 1}`}
                  className="min-w-0 flex-1 rounded border border-white/10 bg-[#141414] px-2 py-1.5 text-sm text-[#F5F5F5] outline-none focus:border-[#DC2626]"
                />
                <input
                  type="number"
                  value={r.points}
                  min={-50}
                  max={50}
                  onChange={(e) => majReponse(i, { points: Number(e.target.value) || 0 })}
                  aria-label={`Points de la réponse ${i + 1}`}
                  className="w-16 shrink-0 rounded border border-white/10 bg-[#141414] px-2 py-1.5 text-center text-sm font-black tabular-nums text-[#F5F5F5] outline-none focus:border-[#DC2626]"
                />
                <button
                  type="button"
                  onClick={() => maj({ reponses: brouillon.reponses.filter((_, j) => j !== i) })}
                  aria-label={`Retirer la réponse ${i + 1}`}
                  className="shrink-0 cursor-pointer px-1 text-[#737373] hover:text-[#DC2626]"
                >×</button>
              </div>
              <input
                value={r.pique}
                onChange={(e) => majReponse(i, { pique: e.target.value })}
                placeholder="Pique affichée dans les highlights si cette réponse est choisie (facultatif)"
                className="mt-1.5 w-full rounded border border-white/5 bg-[#141414] px-2 py-1 text-xs text-[#A3A3A3] outline-none focus:border-[#DC2626]"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => maj({ reponses: [...brouillon.reponses, { texte: '', points: 0, pique: '' }] })}
            className="cursor-pointer self-start rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-[#A3A3A3] hover:border-white/25 hover:text-[#F5F5F5]"
          >
            + Ajouter une réponse
          </button>
        </div>
      </Champ>

      <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-[#A3A3A3]">
        <input
          type="checkbox"
          checked={brouillon.active}
          onChange={(e) => maj({ active: e.target.checked })}
          className="accent-[#DC2626]"
        />
        Question active (visible en jeu)
      </label>

      <div className="flex items-center gap-2">
        <button
          onClick={onEnregistrer}
          disabled={!valide || occupe}
          className="cursor-pointer rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {occupe ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button
          onClick={onAnnuler}
          disabled={occupe}
          className="cursor-pointer rounded-lg px-4 py-2 text-sm font-bold text-[#A3A3A3] hover:text-[#F5F5F5] disabled:opacity-40"
        >
          Annuler
        </button>
        <span className="ml-auto text-xs text-[#737373]">
          au pire : <span className="font-black text-[#F5F5F5]">+{pire(brouillon.reponses)}</span>
        </span>
      </div>
    </div>
  );
}

function Champ({
  label, aide, children,
}: { label: string; aide?: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#737373]">{label}</p>
      {aide && <p className="mb-1.5 text-[11px] leading-snug text-[#525252]">{aide}</p>}
      {children}
    </div>
  );
}
