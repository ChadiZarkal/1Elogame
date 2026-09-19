'use client';

/**
 * @module redflagtest/ProfilStep
 * « Tu es qui ? » — le préambule, sur le markup de référence.
 *
 *   section.intro-wrapper > h2
 *                         > form.intro-form > label.intro-form-labels
 *                                           > button.button-start
 *
 * POURQUOI AVANT LA PREMIÈRE QUESTION ET PAS APRÈS
 *   La partie part en base avec le profil de celui qui l'a jouée : c'est ce qui
 *   alimente les deux classements du récap. Demandé à la fin, le profil
 *   arriverait après coup pour tous ceux qui abandonnent en route — c'est-à-dire
 *   pour la moitié des parties, celles dont on aurait justement besoin.
 *
 * POURQUOI LES JOUEURS NE LE VOIENT QU'UNE FOIS
 *   Le profil est celui de tout le site, rangé dans `rog_session`. Quelqu'un
 *   venu de « Le pire des deux » ou de « C'est un 10 mais… » l'a déjà donné :
 *   le lui redemander serait une porte de plus entre lui et le test.
 *
 * Des menus déroulants plutôt qu'une grille de boutons : c'est ce que
 * `flac.css` stylise, et l'écran doit tenir d'un seul tenant sans défilement.
 */

import { useState } from 'react';
import type { AgeVotant, SexeVotant } from '@/types/database';
import type { PlayerProfile } from '@/types/game';

const SEXES: Array<{ value: SexeVotant; label: string }> = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
  { value: 'autre', label: 'Autre' },
];

const AGES: AgeVotant[] = ['16-18', '19-22', '23-26', '27+'];

export function ProfilStep({ onDemarrer }: { onDemarrer: (profil: PlayerProfile) => void }) {
  const [sexe, setSexe] = useState<SexeVotant | ''>('');
  const [age, setAge] = useState<AgeVotant | ''>('');

  const pret = sexe !== '' && age !== '';

  return (
    <section className="intro-wrapper">
      <h2>Avant de commencer</h2>

      <form
        className="intro-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (pret) onDemarrer({ sex: sexe, age });
        }}
      >
        <label className="intro-form-labels" htmlFor="rft-sexe">
          <span className="label-symbol-wrapper">
            {/* eslint-disable-next-line @next/next/no-img-element -- markup de
                référence ; `flac.css` dimensionne l'icône via .label-symbol. */}
            <img className="label-symbol" src="/rft/img/symbol-gender.svg" alt="" />
          </span>
          <span className="label-info">
            <span className="label-text">Tu es…</span>
            <select
              id="rft-sexe"
              required
              value={sexe}
              onChange={(e) => setSexe(e.target.value as SexeVotant)}
            >
              <option value="" hidden disabled>Sélectionne</option>
              {SEXES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </span>
        </label>

        <label className="intro-form-labels" htmlFor="rft-age">
          <span className="label-symbol-wrapper">
            {/* eslint-disable-next-line @next/next/no-img-element -- idem. */}
            <img className="label-symbol" src="/rft/img/symbol-age.svg" alt="" />
          </span>
          <span className="label-info">
            <span className="label-text">Tu as…</span>
            <select
              id="rft-age"
              required
              value={age}
              onChange={(e) => setAge(e.target.value as AgeVotant)}
            >
              <option value="" hidden disabled>Sélectionne</option>
              {AGES.map((a) => (
                <option key={a} value={a}>
                  {a === '27+' ? '27 ans et plus' : `${a} ans`}
                </option>
              ))}
            </select>
          </span>
        </label>

        <button type="submit" className="button-start" disabled={!pret}>
          Commencer
        </button>

        <p className="intro-note">
          Deux réponses, anonymes. Elles servent à te comparer aux autres à la fin.
        </p>
      </form>
    </section>
  );
}
