'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, CheckCircle, XCircle, Trophy, BarChart2, RefreshCw } from 'lucide-react';
import type { DixMaisStatement } from '@/types/database';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'statements' | 'leaderboard';

interface AdminStatement extends DixMaisStatement {
  avg_delta: number;
  elimination_rate: number;
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

const TOKEN_KEY = 'dixmais_admin_token';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(t: string) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

async function adminFetch(url: string, opts: RequestInit = {}) {
  const token = getToken();
  return fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers ?? {}) },
  });
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setLoggedIn(!!getToken());
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  return <Dashboard onLogout={() => { clearToken(); setLoggedIn(false); }} />;
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pw) return;
    setLoading(true);
    setErr('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.error?.message ?? 'Mot de passe incorrect'); return; }
      setToken(json.data.token);
      onLogin();
    } catch { setErr('Erreur réseau'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6" style={{ background: '#060606' }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-sm">
        <Link href="/dixmais" className="flex items-center gap-1.5 text-white/30 mb-8 hover:text-white/60 transition-colors">
          <ArrowLeft size={16} /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Jeu</span>
        </Link>
        <h1 className="text-2xl font-black text-white mb-1">Admin Panel</h1>
        <p className="text-sm text-white/40 mb-6">C&apos;est un 10 mais... — Gestion des affirmations</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Mot de passe admin"
            className="w-full px-4 py-3.5 rounded-xl text-white font-semibold text-sm placeholder:text-white/25 outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
          {err && <p className="text-[#EF4444] text-xs font-bold">{err}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest text-black cursor-pointer"
            style={{ background: 'linear-gradient(135deg,#F59E0B,#FFD700)', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Connexion...' : 'SE CONNECTER'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('statements');
  const [statements, setStatements] = useState<AdminStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStatements = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminFetch('/api/admin/dixmais/statements');
      if (res.status === 401) { clearToken(); onLogout(); return; }
      const json = await res.json();
      setStatements(json.data ?? []);
    } catch { setError('Erreur de chargement'); }
    finally { setLoading(false); }
  }, [onLogout]);

  useEffect(() => { loadStatements(); }, [loadStatements]);

  async function toggleField(id: string, field: 'is_active' | 'is_approved', val: boolean) {
    await adminFetch(`/api/admin/dixmais/statements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ [field]: val }),
    });
    setStatements(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
  }

  async function deleteStatement(id: string) {
    if (!confirm('Supprimer cette affirmation ?')) return;
    await adminFetch(`/api/admin/dixmais/statements/${id}`, { method: 'DELETE' });
    setStatements(prev => prev.filter(s => s.id !== id));
  }

  const totalVotes = statements.reduce((a, s) => a + s.votes_count, 0);
  const active = statements.filter(s => s.is_active && s.is_approved).length;
  const negCount = statements.filter(s => s.type === 'negative').length;
  const posCount = statements.filter(s => s.type === 'positive').length;

  return (
    <div className="min-h-dvh text-white" style={{ background: '#060606' }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-6 pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <Link href="/dixmais" className="text-white/30 hover:text-white/60 transition-colors"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="text-base font-black text-white leading-none">Admin Panel</h1>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mt-0.5">C&apos;est un 10 mais...</p>
          </div>
        </div>
        <button onClick={onLogout} className="text-[10px] font-black uppercase tracking-wider text-white/30 hover:text-white/60 transition-colors cursor-pointer">
          Déconnexion
        </button>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-5">
        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { label: 'Total', value: statements.length, color: '#F59E0B' },
            { label: 'Actives', value: active, color: '#22C55E' },
            { label: '🚩 Red', value: negCount, color: '#EF4444' },
            { label: '🟢 Green', value: posCount, color: '#10B981' },
          ].map(s => (
            <div key={s.label} className="rounded-xl py-3 px-2 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {[
            { key: 'statements', label: 'Affirmations', icon: <BarChart2 size={12} /> },
            { key: 'leaderboard', label: 'Classement red flags', icon: <Trophy size={12} /> },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as Tab)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-all cursor-pointer"
              style={{ background: tab === t.key ? '#F59E0B' : 'transparent', color: tab === t.key ? '#000' : 'rgba(255,255,255,0.4)' }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'statements' && (
            <motion.div key="stmts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AddStatementForm onAdded={s => setStatements(prev => [s as AdminStatement, ...prev])} />
              <div className="flex items-center justify-between mb-3 mt-5">
                <p className="text-xs font-black uppercase tracking-wider text-white/40">{statements.length} affirmations</p>
                <button onClick={loadStatements} className="flex items-center gap-1 text-white/30 hover:text-white/60 cursor-pointer transition-colors">
                  <RefreshCw size={12} /><span className="text-[10px] font-bold">Rafraîchir</span>
                </button>
              </div>
              {loading ? (
                <p className="text-center text-white/30 text-sm py-8">Chargement...</p>
              ) : error ? (
                <p className="text-center text-[#EF4444] text-sm py-8">{error}</p>
              ) : (
                <div className="space-y-2">
                  {statements.map(stmt => (
                    <StatementRow key={stmt.id} stmt={stmt} onToggle={toggleField} onDelete={deleteStatement} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
          {tab === 'leaderboard' && (
            <motion.div key="lb" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="text-[11px] font-bold text-white/35 mb-4">
                Classement des affirmations qui font le plus chuter la note. Données de {totalVotes.toLocaleString()} votes.
              </p>
              <div className="space-y-2">
                {[...statements]
                  .filter(s => s.votes_count > 0)
                  .sort((a, b) => a.avg_delta - b.avg_delta)
                  .map((stmt, i) => (
                    <div key={stmt.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <span className="text-lg font-black w-7 text-center" style={{ color: i < 3 ? '#F59E0B' : 'rgba(255,255,255,0.3)' }}>
                        #{i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{stmt.text}</p>
                        <p className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {stmt.votes_count} votes · Élim. {stmt.elimination_rate.toFixed(0)}%
                        </p>
                      </div>
                      <span className="font-black text-sm shrink-0 px-2.5 py-1 rounded-lg"
                        style={{ color: '#EF4444', background: 'rgba(239,68,68,0.12)' }}>
                        {stmt.avg_delta.toFixed(1)}
                      </span>
                    </div>
                  ))}
                {statements.filter(s => s.votes_count > 0).length === 0 && (
                  <p className="text-center text-white/25 py-8 text-sm">Pas encore de votes enregistrés.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Statement Row ────────────────────────────────────────────────────────────

function StatementRow({ stmt, onToggle, onDelete }: {
  stmt: AdminStatement;
  onToggle: (id: string, field: 'is_active' | 'is_approved', val: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', opacity: stmt.is_active ? 1 : 0.5 }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-bold text-white leading-snug flex-1">{stmt.text}</p>
        <button onClick={() => onDelete(stmt.id)} className="text-white/20 hover:text-[#EF4444] transition-colors cursor-pointer shrink-0 mt-0.5">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded"
          style={{ color: stmt.type === 'positive' ? '#22C55E' : '#EF4444', background: stmt.type === 'positive' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}>
          {stmt.type === 'positive' ? '🟢 POS' : '🚩 NEG'}
        </span>
        <span className="text-[9px] font-bold text-white/30 px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>{stmt.category}</span>
        {stmt.votes_count > 0 && (
          <span className="text-[9px] font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {stmt.votes_count} votes · Δ {stmt.avg_delta.toFixed(1)}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => onToggle(stmt.id, 'is_active', !stmt.is_active)}
            className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wide transition-colors cursor-pointer"
            style={{ color: stmt.is_active ? '#22C55E' : 'rgba(255,255,255,0.3)' }}>
            {stmt.is_active ? <Eye size={11} /> : <EyeOff size={11} />}
            {stmt.is_active ? 'Actif' : 'Inactif'}
          </button>
          <button onClick={() => onToggle(stmt.id, 'is_approved', !stmt.is_approved)}
            className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wide transition-colors cursor-pointer"
            style={{ color: stmt.is_approved ? '#F59E0B' : 'rgba(255,255,255,0.3)' }}>
            {stmt.is_approved ? <CheckCircle size={11} /> : <XCircle size={11} />}
            {stmt.is_approved ? 'Approuvé' : 'En attente'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Statement Form ───────────────────────────────────────────────────────

const CATEGORIES = ['general', 'politique', 'caractere', 'dating', 'lifestyle', 'social', 'argent', 'travail', 'sante', 'famille'];

function AddStatementForm({ onAdded }: { onAdded: (s: DixMaisStatement) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [type, setType] = useState<'negative' | 'positive'>('negative');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setErr('');
    try {
      const res = await adminFetch('/api/admin/dixmais/statements', {
        method: 'POST',
        body: JSON.stringify({ text: text.trim(), type, category }),
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.error?.message ?? 'Erreur'); return; }
      onAdded(json.data);
      setText('');
      setOpen(false);
    } catch { setErr('Erreur réseau'); }
    finally { setLoading(false); }
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.04)' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 cursor-pointer"
        style={{ color: '#F59E0B' }}>
        <Plus size={16} />
        <span className="text-xs font-black uppercase tracking-wider">Ajouter une affirmation</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.form onSubmit={handleSubmit} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 space-y-3 overflow-hidden">
            <textarea value={text} onChange={e => setText(e.target.value)} rows={2} placeholder="Ex: Il met le lait avant les céréales"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white font-semibold placeholder:text-white/25 outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
            <div className="flex gap-2">
              <div className="flex gap-1 flex-1">
                {(['negative', 'positive'] as const).map(t => (
                  <button type="button" key={t} onClick={() => setType(t)}
                    className="flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wide cursor-pointer transition-all"
                    style={{ background: type === t ? (t === 'negative' ? '#EF4444' : '#22C55E') : 'rgba(255,255,255,0.06)', color: type === t ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                    {t === 'negative' ? '🚩 Négatif' : '🟢 Positif'}
                  </button>
                ))}
              </div>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="px-2 py-2 rounded-lg text-xs font-bold text-white outline-none cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {err && <p className="text-[#EF4444] text-xs font-bold">{err}</p>}
            <button type="submit" disabled={loading || !text.trim()}
              className="w-full py-3 rounded-xl text-black font-black text-xs uppercase tracking-widest cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#F59E0B,#FFD700)', opacity: (loading || !text.trim()) ? 0.5 : 1 }}>
              {loading ? 'Ajout...' : 'AJOUTER'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
