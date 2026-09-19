'use client';

/**
 * @module admin/redflagtest
 * Le back-office du Red Flag Test : questions, tags, verdicts.
 *
 * POURQUOI UN SEUL ÉCRAN À TROIS ONGLETS
 *   Les trois jeux de données se répondent. Une question porte des
 *   identifiants de tags qui ne veulent rien dire sans la liste ; le budget de
 *   points change à chaque question modifiée et détermine quels paliers sont
 *   seulement atteignables. Trois pages séparées auraient garanti trois états
 *   désynchronisés à l'écran, chacun rechargé au hasard des allers-retours.
 *   Tout arrive donc en une requête et se recharge en une fois.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminNav } from '@/components/admin/AdminNav';
import { Loading } from '@/components/ui/Loading';
import { chargerContenu, SessionExpiree, type ContenuAdmin } from './api';
import { QuestionsPanel } from './QuestionsPanel';
import { TagsPanel } from './TagsPanel';
import { VerdictsPanel } from './VerdictsPanel';

type Onglet = 'questions' | 'tags' | 'verdicts';

export default function AdminRedflagtestPage() {
  const router = useRouter();
  const [contenu, setContenu] = useState<ContenuAdmin | null>(null);
  const [onglet, setOnglet] = useState<Onglet>('questions');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);

  const recharger = useCallback(async () => {
    try {
      setContenu(await chargerContenu());
      setErreur('');
    } catch (e) {
      if (e instanceof SessionExpiree) {
        sessionStorage.removeItem('adminToken');
        router.push('/admin');
        return;
      }
      setErreur(e instanceof Error ? e.message : String(e));
    } finally {
      setChargement(false);
    }
  }, [router]);

  useEffect(() => {
    if (!sessionStorage.getItem('adminToken')) {
      router.push('/admin');
      return;
    }
    void recharger();
  }, [router, recharger]);

  if (chargement) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D]">
        <Loading size="lg" text="Chargement…" />
      </div>
    );
  }

  const onglets: Array<{ cle: Onglet; label: string; compte: number }> = [
    { cle: 'questions', label: 'Questions', compte: contenu?.questions.length ?? 0 },
    { cle: 'tags', label: 'Tags', compte: contenu?.tags.length ?? 0 },
    { cle: 'verdicts', label: 'Verdicts', compte: contenu?.verdicts.length ?? 0 },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#0D0D0D]">
      <AdminNav />

      <main className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#F5F5F5] sm:text-3xl">Red Flag Test</h1>
              <p className="mt-1 text-sm text-[#737373]">
                Un point vaut un point de pourcentage. Le score est leur somme, et il n’est
                pas plafonné.
              </p>
            </div>
            <Link
              href="/redflagtest"
              target="_blank"
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-[#A3A3A3] transition-colors hover:border-white/25 hover:text-[#F5F5F5]"
            >
              ↗ Voir le jeu
            </Link>
          </div>

          <div className="mb-5 flex gap-1.5">
            {onglets.map((o) => (
              <button
                key={o.cle}
                onClick={() => setOnglet(o.cle)}
                className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
                style={{
                  background: onglet === o.cle ? '#DC2626' : 'rgba(255,255,255,0.05)',
                  color: onglet === o.cle ? '#fff' : '#A3A3A3',
                }}
              >
                {o.label}
                <span className="ml-1.5 opacity-60">{o.compte}</span>
              </button>
            ))}
          </div>

          {erreur && (
            <div className="mb-5 rounded-xl border border-[#DC2626]/50 bg-[#991B1B]/20 p-4 text-sm text-[#FCA5A5]">
              {erreur}
            </div>
          )}

          {contenu && onglet === 'questions' && (
            <QuestionsPanel
              questions={contenu.questions}
              tags={contenu.tags}
              budget={contenu.budget}
              onRecharger={recharger}
              onErreur={setErreur}
            />
          )}

          {contenu && onglet === 'tags' && (
            <TagsPanel
              tags={contenu.tags}
              questions={contenu.questions}
              onRecharger={recharger}
              onErreur={setErreur}
            />
          )}

          {contenu && onglet === 'verdicts' && (
            <VerdictsPanel
              verdicts={contenu.verdicts}
              budget={contenu.budget}
              onRecharger={recharger}
              onErreur={setErreur}
            />
          )}
        </div>
      </main>
    </div>
  );
}
