'use client';

import { useEffect, useState, useCallback } from 'react';
import { Trophy, ArrowRight, ExternalLink, Shield } from 'lucide-react';
import { useHaptics } from '@/lib/hooks';

// ─── Main Page ─────────────────────────────────────────────
export default function HubPage() {
  const { tap } = useHaptics();
  const [stats, setStats] = useState<{ totalVotes: number; estimatedPlayers: number } | null>(null);

  useEffect(() => {
    fetch('/api/stats/public')
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .catch(() => {});
  }, []);

  const handleTap = useCallback((e: React.MouseEvent) => {
    tap();
    // Let the native <a> navigation happen
  }, [tap]);

  return (
    <div className="hub">
      {/* Diagonal-line texture */}
      <div className="hub__texture" aria-hidden="true" />

      <main className="hub__main hub__main--visible">

        {/* ─── HERO ─── */}
        <header className="hub__hero hub__enter hub__enter--1">
          <img
            src="/logo-rog-new.svg"
            alt="Red or Green — Le party game gratuit"
            className="hub__logo"
            draggable={false}
          />
          <h1 className="sr-only">Red or Green | Jeu de société en ligne gratuit pour débattre entre amis</h1>
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
          <a
            href="https://redflagtest.redorgreen.fr/"
            target="_blank"
            rel="noopener noreferrer"
            className="hub__card hub__card--main hub__enter hub__enter--3"
            onClick={handleTap}
            aria-label="Jouer à Red Flag Test — Es-tu un red flag ?"
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
          </a>

          {/* Secondary: 2-column grid */}
          <div className="hub__row">
            <a
              href="/jeu"
              className="hub__card hub__card--half hub__card--green hub__enter hub__enter--4"
              onClick={handleTap}
              aria-label="Jouer à Red or Green — Quel est le plus gros Red Flag ?"
            >
              <div className="hub__card-header">
                <span className="hub__card-emoji">🚩</span>
                <span className="hub__card-tag hub__card-tag--green">DUEL</span>
              </div>
              <h3 className="hub__card-name hub__card-name--sm">Red or Green</h3>
              <p className="hub__card-pitch hub__card-pitch--sm">C&apos;est lequel le pire ?</p>
              <span className="hub__card-go hub__card-go--sm hub__card-go--green">
                JOUER <ArrowRight size={11} strokeWidth={2.5} />
              </span>
            </a>

            <a
              href="/flagornot"
              className="hub__card hub__card--half hub__card--purple hub__enter hub__enter--5"
              onClick={handleTap}
              aria-label="Jouer à Oracle — Red Flag ou Green Flag ?"
            >
              <div className="hub__card-header">
                <span className="hub__card-emoji">🔮</span>
                <span className="hub__card-tag hub__card-tag--purple">ORACLE</span>
              </div>
              <h3 className="hub__card-name hub__card-name--sm">Oracle</h3>
              <p className="hub__card-pitch hub__card-pitch--sm">Soumets ta situation</p>
              <span className="hub__card-go hub__card-go--sm hub__card-go--purple">
                TESTER <ArrowRight size={11} strokeWidth={2.5} />
              </span>
            </a>
          </div>

        </div>

        {/* ─── SEO CONTENT (visible, compact) ─── */}
        <section className="hub__seo hub__enter hub__enter--6">
          <h2 className="hub__seo-title">Red or Green — Le party game des Red Flags</h2>
          <p className="hub__seo-text">
            Joue gratuitement à <strong>Red or Green</strong>, le jeu en ligne où tu votes pour le pire comportement.
            Découvre aussi l&apos;<strong>Oracle</strong> pour savoir si une situation est un Red Flag ou un Green Flag,
            et nos outils d&apos;auto-évaluation : <a href="/ressources/violentometre" className="hub__seo-link">violentomètre</a>,{' '}
            <a href="/ressources/consentometre" className="hub__seo-link">consentomètre</a>,{' '}
            <a href="/ressources/harcelometre" className="hub__seo-link">harcèlomètre</a> et plus encore.
            Sans inscription, sans téléchargement — jouable instantanément sur mobile et desktop.
          </p>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="hub__footer hub__enter hub__enter--7">
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

          <nav className="hub__actions" aria-label="Navigation secondaire">
            <a
              href="/classement"
              className="hub__action"
              onClick={handleTap}
            >
              <Trophy size={13} strokeWidth={2.5} />
              Classement
            </a>
            <a
              href="/ressources"
              className="hub__action"
              onClick={handleTap}
              aria-label="Violentomètre et outils d'auto-évaluation"
            >
              <Shield size={13} strokeWidth={2.5} />
              Violentomètre
            </a>
          </nav>

          <p className="hub__version">Red or Green — v4.0</p>
        </footer>

      </main>
    </div>
  );
}