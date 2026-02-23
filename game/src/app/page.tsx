'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, ArrowRight, ExternalLink, Shield } from 'lucide-react';
import { useHaptics } from '@/lib/hooks';

// ─── Main Page ─────────────────────────────────────────────
export default function HubPage() {
  const router = useRouter();
  const { tap } = useHaptics();
  const [stats, setStats] = useState<{ totalVotes: number; estimatedPlayers: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetch('/api/stats/public')
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .catch(() => {});
  }, []);

  const go = useCallback((href: string, external = false) => {
    tap();
    if (external) window.open(href, '_blank', 'noopener,noreferrer');
    else router.push(href);
  }, [tap, router]);

  return (
    <div className="hub">
      {/* Diagonal-line texture */}
      <div className="hub__texture" aria-hidden="true" />

      <main className={`hub__main ${mounted ? 'hub__main--visible' : ''}`}>

        {/* ─── HERO ─── */}
        <header className="hub__hero hub__enter hub__enter--1">
          <h1 className="hub__title">
            <span className="hub__title-red">RED</span>
            <span className="hub__title-flag">FLAG</span>
          </h1>
          <p className="hub__subtitle">Le jeu qui divise</p>
        </header>

        {/* ─── SCROLLING TICKER ─── */}
        <div className="hub__ticker hub__enter hub__enter--2" aria-hidden="true">
          <div className="hub__ticker-track">
            {[0, 1].map(i => (
              <span key={i} className="hub__ticker-text">
                &nbsp;OSE JUGER ★ VOTE ET COMPARE TES POTES ★ FAIS DÉBAT ★ C&apos;EST RED FLAG OU PAS ? ★ GRATUIT ★ SANS INSCRIPTION ★
              </span>
            ))}
          </div>
        </div>

        {/* ─── GAMES ─── */}
        <div className="hub__games">

          {/* Primary: Red Flag Test — full width, red accent */}
          <button
            className="hub__card hub__card--main hub__enter hub__enter--3"
            onClick={() => go('https://redorgreen.fr/?quiz=quiz-sexualite', true)}
            aria-label="Jouer à Red Flag Test"
          >
            <div className="hub__card-header">
              <span className="hub__card-emoji">🧪</span>
              <span className="hub__card-tag hub__card-tag--red">QUIZ</span>
            </div>
            <h2 className="hub__card-name">Red Flag Test</h2>
            <p className="hub__card-pitch">
              Es-tu un red flag ? Fais le test pour le découvrir
            </p>
            <span className="hub__card-go hub__card-go--red">
              FAIRE LE TEST <ExternalLink size={13} strokeWidth={2.5} />
            </span>
          </button>

          {/* Secondary: 2-column grid */}
          <div className="hub__row">
            <button
              className="hub__card hub__card--half hub__card--green hub__enter hub__enter--4"
              onClick={() => go('/flagornot')}
              aria-label="Demande à l'IA"
            >
              <div className="hub__card-header">
                <span className="hub__card-emoji">🤖</span>
                <span className="hub__card-tag hub__card-tag--green">IA</span>
              </div>
              <h3 className="hub__card-name hub__card-name--sm">Demande à l&apos;IA</h3>
              <p className="hub__card-pitch hub__card-pitch--sm">L&apos;IA juge ta situation</p>
              <span className="hub__card-go hub__card-go--sm hub__card-go--green">
                TESTER <ArrowRight size={11} strokeWidth={2.5} />
              </span>
            </button>

            <button
              className="hub__card hub__card--half hub__card--purple hub__enter hub__enter--5"
              onClick={() => go('/jeu')}
              aria-label="Jouer à Red Flag"
            >
              <div className="hub__card-header">
                <span className="hub__card-emoji">🚩</span>
                <span className="hub__card-tag hub__card-tag--purple">DUEL</span>
              </div>
              <h3 className="hub__card-name hub__card-name--sm">Red Flag</h3>
              <p className="hub__card-pitch hub__card-pitch--sm">C&apos;est lequel le pire ?</p>
              <span className="hub__card-go hub__card-go--sm hub__card-go--purple">
                JOUER <ArrowRight size={11} strokeWidth={2.5} />
              </span>
            </button>
          </div>

        </div>

        {/* ─── FOOTER ─── */}
        <footer className="hub__footer hub__enter hub__enter--6">
          <div className="hub__stats">
            {stats && (
              <>
                <span className="hub__live-dot" />
                <span className="hub__stats-num">
                  {stats.estimatedPlayers.toLocaleString('fr-FR')} joueurs
                </span>
                <span className="hub__stats-sep">·</span>
                <span className="hub__stats-num">
                  {stats.totalVotes.toLocaleString('fr-FR')} votes
                </span>
              </>
            )}
          </div>

          <div className="hub__actions">
            <button
              className="hub__action"
              onClick={() => { tap(); router.push('/classement'); }}
            >
              <Trophy size={13} strokeWidth={2.5} />
              Statistique
            </button>
            <button
              className="hub__action"
              onClick={() => { tap(); router.push('/ressources/violentometre'); }}
              aria-label="Violentomètre"
            >
              <Shield size={13} strokeWidth={2.5} />
              Violentomètre
            </button>
          </div>

          <p className="hub__version">Red Flag Games — v4.0</p>
        </footer>

      </main>
    </div>
  );
}