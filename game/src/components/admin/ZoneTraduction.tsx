'use client';

/**
 * @module components/admin/ZoneTraduction
 * La zone « Traduction » des panneaux d'administration (2026-11-15).
 *
 * Le panneau lui passe les textes français qu'il a déjà à l'écran (éléments,
 * questions, réponses, verdicts, énoncés…). La zone demande au serveur ce que
 * le site anglais en affiche, montre en premier ceux qui restent en français,
 * et enregistre l'anglais saisi (table `traductions`).
 *
 * Trois états, dits en clair à côté de chaque texte, parce qu'ils n'appellent
 * pas la même action :
 *   - « Manquante » : le site anglais affiche le français. À traduire.
 *   - « Dans le code » : traduit par le dictionnaire écrit à la main. Une
 *     saisie ici le remplace ; vider la saisie le rétablit.
 *   - « Saisie ici » : ce qu'on a enregistré dans l'admin.
 *
 * Un texte français réécrit perd sa traduction : elle était indexée par
 * l'ancien texte. Il réapparaît alors dans « À traduire ».
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { EtatTraduction, SourceTraduction } from '@/lib/i18n/traductionsBase';

export interface EntreeTraduction {
  fr: string;
  /** Ce que c'est, affiché au-dessus du texte : « Question », « Pique »… */
  type: string;
  inactif?: boolean;
}

interface Props {
  source: SourceTraduction;
  entrees: EntreeTraduction[];
  /** La couleur du panneau qui l'accueille. */
  accent?: string;
}

const PAR_PAGE = 30;

function jeton(): string {
  return (typeof window !== 'undefined' && sessionStorage.getItem('adminToken')) || '';
}

async function appeler<T>(methode: 'POST' | 'PUT', corps: unknown): Promise<T> {
  const reponse = await fetch('/api/admin/traductions', {
    method: methode,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jeton()}` },
    body: JSON.stringify(corps),
  });
  if (reponse.status === 401) {
    sessionStorage.removeItem('adminToken');
    window.location.href = '/admin';
    throw new Error('Session expirée');
  }
  const json = await reponse.json().catch(() => null);
  if (!json?.success) throw new Error(json?.error?.message ?? `Échec (HTTP ${reponse.status})`);
  return json.data as T;
}

type Filtre = 'manquantes' | 'toutes';

export function ZoneTraduction({ source, entrees, accent = '#DC2626' }: Props) {
  const [etats, setEtats] = useState<Map<string, EtatTraduction>>(new Map());
  const [tableManquante, setTableManquante] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [filtre, setFiltre] = useState<Filtre | null>(null);
  const [recherche, setRecherche] = useState('');
  const [visibles, setVisibles] = useState(PAR_PAGE);

  // Une entrée par texte : « Oui » revient dans vingt questions.
  const uniques = useMemo(() => {
    const vus = new Set<string>();
    return entrees.filter((e) => {
      const cle = e.fr.trim();
      if (!cle || vus.has(cle)) return false;
      vus.add(cle);
      return true;
    });
  }, [entrees]);

  // Le panneau recalcule sa liste à chaque rendu : on ne recharge que si les
  // textes eux-mêmes ont changé.
  const signature = uniques.map((e) => e.fr).join('\n\u0000');
  const textes = useMemo(() => (signature ? signature.split('\n\u0000') : []), [signature]);

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const data = await appeler<{ etats: EtatTraduction[]; tableAbsente: boolean }>('POST', { source, textes });
      setEtats(new Map(data.etats.map((e) => [e.fr, e])));
      setTableManquante(data.tableAbsente);
      setErreur('');
    } catch (e) {
      setErreur(e instanceof Error ? e.message : String(e));
    } finally {
      setChargement(false);
    }
  }, [source, textes]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const manquantes = uniques.filter((e) => etats.has(e.fr) && !etats.get(e.fr)?.en);
  const filtreEffectif: Filtre = filtre ?? (manquantes.length > 0 ? 'manquantes' : 'toutes');
  const q = recherche.trim().toLowerCase();
  const liste = (filtreEffectif === 'manquantes' ? manquantes : uniques).filter(
    (e) => !q || e.fr.toLowerCase().includes(q) || (etats.get(e.fr)?.en ?? '').toLowerCase().includes(q),
  );
  // Les actifs d'abord : ce sont ceux que les joueurs voient.
  const triee = [...liste].sort((a, b) => Number(Boolean(a.inactif)) - Number(Boolean(b.inactif)));

  const traduites = uniques.length - manquantes.length;
  const part = uniques.length ? Math.round((traduites / uniques.length) * 100) : 100;

  const apresEnregistrement = (fr: string, en: string) => {
    setEtats((avant) => {
      const suite = new Map(avant);
      const e = avant.get(fr);
      const code = e?.code ?? null;
      suite.set(fr, en.trim()
        ? { fr, en: en.trim(), origine: 'admin', code }
        : { fr, en: code, origine: code ? 'code' : null, code });
      return suite;
    });
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4" aria-label="Traduction anglaise">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-bold text-[#F5F5F5]">🇬🇧 Traduction anglaise</h2>
        {!chargement && (
          <p className="text-xs text-[#A3A3A3]">
            {manquantes.length === 0
              ? `Tout est traduit (${uniques.length})`
              : `${manquantes.length} à traduire sur ${uniques.length}`}
          </p>
        )}
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        <div className="h-full rounded-full transition-all" style={{ width: `${part}%`, background: accent }} />
      </div>
      <p className="mb-3 text-xs leading-relaxed text-[#8A8A8A]">
        Ce que voit le site anglais (redorgreen.fr/en). Un texte sans traduction s’y affiche en
        français. Si tu modifies le texte français, sa traduction est perdue : il revient ici.
        Les pages anglaises se mettent à jour en quelques minutes.
      </p>

      {tableManquante && (
        <div className="mb-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200">
          La table <code>traductions</code> n’existe pas encore dans cette base : les traductions du
          code s’affichent, mais rien ne peut être enregistré. Il faut jouer la migration{' '}
          <code>{source === 'dixmais' ? '034_dixmais_traductions.sql' : '033_traductions.sql'}</code>.
        </div>
      )}

      {erreur && (
        <div className="mb-3 rounded-xl border border-[#DC2626]/50 bg-[#991B1B]/20 p-3 text-xs text-[#FCA5A5]">
          {erreur}{' '}
          <button type="button" onClick={() => void charger()} className="cursor-pointer underline">
            Réessayer
          </button>
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(['manquantes', 'toutes'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setFiltre(f);
              setVisibles(PAR_PAGE);
            }}
            className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
            style={{
              background: filtreEffectif === f ? accent : 'rgba(255,255,255,0.05)',
              color: filtreEffectif === f ? '#fff' : '#A3A3A3',
            }}
          >
            {f === 'manquantes' ? `À traduire ${manquantes.length}` : `Toutes ${uniques.length}`}
          </button>
        ))}
        <input
          type="search"
          value={recherche}
          onChange={(e) => {
            setRecherche(e.target.value);
            setVisibles(PAR_PAGE);
          }}
          placeholder="Chercher (FR ou EN)"
          aria-label="Chercher un texte"
          className="min-w-0 flex-1 basis-40 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-[#F5F5F5] placeholder:text-[#666] focus:border-white/30 focus:outline-none"
        />
      </div>

      {chargement ? (
        <p className="py-6 text-center text-xs text-[#737373]">Chargement des traductions…</p>
      ) : triee.length === 0 ? (
        <p className="py-6 text-center text-xs text-[#737373]">
          {filtreEffectif === 'manquantes' && !q ? 'Rien à traduire 🎉' : 'Aucun texte ne correspond.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {triee.slice(0, visibles).map((e) => (
            <LigneTraduction
              key={e.fr}
              source={source}
              entree={e}
              etat={etats.get(e.fr)}
              accent={accent}
              bloque={tableManquante}
              onEnregistre={apresEnregistrement}
            />
          ))}
        </ul>
      )}

      {!chargement && triee.length > visibles && (
        <button
          type="button"
          onClick={() => setVisibles((v) => v + PAR_PAGE)}
          className="mt-3 w-full cursor-pointer rounded-lg border border-white/10 py-2 text-xs font-bold text-[#A3A3A3] hover:border-white/25 hover:text-[#F5F5F5]"
        >
          Afficher plus ({triee.length - visibles})
        </button>
      )}
    </section>
  );
}

const ORIGINES = {
  admin: { texte: 'Saisie ici', couleur: '#4ADE80' },
  code: { texte: 'Dans le code', couleur: '#A3A3A3' },
  manquante: { texte: 'Manquante : le site anglais affiche le français', couleur: '#FBBF24' },
} as const;

function LigneTraduction({
  source,
  entree,
  etat,
  accent,
  bloque,
  onEnregistre,
}: {
  source: SourceTraduction;
  entree: EntreeTraduction;
  etat: EtatTraduction | undefined;
  accent: string;
  bloque: boolean;
  onEnregistre: (fr: string, en: string) => void;
}) {
  const actuel = etat?.en ?? '';
  const [saisie, setSaisie] = useState(actuel);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);

  // Le serveur a répondu après le premier rendu : reprendre sa valeur tant
  // qu'on n'a rien tapé.
  const [base, setBase] = useState(actuel);
  if (base !== actuel) {
    setBase(actuel);
    if (saisie === base) setSaisie(actuel);
  }

  const modifie = saisie.trim() !== actuel.trim();
  const origine = etat?.origine === 'admin' ? ORIGINES.admin : etat?.origine === 'code' ? ORIGINES.code : ORIGINES.manquante;

  const enregistrer = async (valeur: string) => {
    setEnCours(true);
    setMessage(null);
    try {
      await appeler('PUT', { source, texteFr: entree.fr, texteEn: valeur });
      onEnregistre(entree.fr, valeur);
      setSaisie(valeur.trim() || etat?.code || '');
      setMessage({ ok: true, texte: valeur.trim() ? 'Enregistré' : 'Saisie retirée' });
    } catch (err) {
      setMessage({ ok: false, texte: err instanceof Error ? err.message : String(err) });
    } finally {
      setEnCours(false);
    }
  };

  return (
    <li className="rounded-xl border border-white/[0.07] bg-black/20 p-3">
      <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-wide">
        <span className="text-[#737373]">{entree.type}</span>
        {entree.inactif && <span className="rounded bg-white/10 px-1.5 py-0.5 text-[#A3A3A3]">inactif</span>}
        <span style={{ color: origine.couleur }}>· {origine.texte}</span>
      </div>
      <p className="mb-2 text-sm text-[#E5E5E5]" lang="fr">{entree.fr}</p>
      <textarea
        value={saisie}
        onChange={(ev) => {
          setSaisie(ev.target.value);
          setMessage(null);
        }}
        rows={Math.min(4, Math.max(1, Math.ceil(Math.max(saisie.length, entree.fr.length) / 60)))}
        lang="en"
        placeholder="English…"
        aria-label={`Anglais de : ${entree.fr}`}
        disabled={bloque}
        className="w-full resize-y rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-[#F5F5F5] placeholder:text-[#555] focus:border-white/30 focus:outline-none disabled:opacity-50"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {modifie && (
          <>
            {(saisie.trim() || etat?.origine === 'admin') && <button
              type="button"
              disabled={enCours || bloque}
              onClick={() => void enregistrer(saisie)}
              className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: accent }}
            >
              {enCours ? 'Enregistrement…' : saisie.trim() ? 'Enregistrer' : 'Retirer la traduction'}
            </button>}
            <button
              type="button"
              disabled={enCours}
              onClick={() => {
                setSaisie(actuel);
                setMessage(null);
              }}
              className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold text-[#A3A3A3] hover:text-[#F5F5F5]"
            >
              Annuler
            </button>
          </>
        )}
        {!modifie && etat?.origine === 'admin' && etat.code && (
          <button
            type="button"
            disabled={enCours || bloque}
            onClick={() => void enregistrer('')}
            className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold text-[#A3A3A3] hover:text-[#F5F5F5]"
            title={`Le code dit : ${etat.code}`}
          >
            Revenir à la traduction du code
          </button>
        )}
        {message && (
          <span className={`text-xs ${message.ok ? 'text-[#4ADE80]' : 'text-[#FCA5A5]'}`} role="status">
            {message.texte}
          </span>
        )}
      </div>
    </li>
  );
}
