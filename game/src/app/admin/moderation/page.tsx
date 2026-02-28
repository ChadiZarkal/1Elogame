'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';
import { AdminNav } from '@/components/admin/AdminNav';

interface FeedbackItem {
  id?: number;
  element_a_texte: string;
  element_b_texte: string;
  stars_count: number;
  thumbs_up_count: number;
  thumbs_down_count: number;
}

export default function AdminModerationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [error, setError] = useState('');

  const fetchFeedback = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/admin/feedback', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Erreur serveur');
      const result = await response.json();
      setFeedback(result.data || []);
      setError('');
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchFeedback(token);
  }, [router, fetchFeedback]);

  // Auto-refresh every 60s
  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) return;
    const interval = setInterval(() => fetchFeedback(token), 60000);
    return () => clearInterval(interval);
  }, [fetchFeedback]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D0D0D]">
        <Loading size="lg" text="Chargement..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <AdminNav />
      <div className="p-6">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-[#F5F5F5]">
          <span className="text-[#DC2626]">Modération</span> & Feedback
        </h1>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200">
            {error}
          </div>
        </div>
      )}

      {/* Top Duels by Stars */}
      <section className="max-w-4xl mx-auto mb-8">
        <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">⭐ Duels les plus populaires</h2>
        <div className="space-y-4">
          {feedback.sort((a, b) => b.stars_count - a.stars_count).map((item, index) => (
            <div
              key={index}
              className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1 text-center">
                  <p className="text-[#F5F5F5] text-sm">{item.element_a_texte}</p>
                </div>
                <span className="text-[#DC2626] font-bold">VS</span>
                <div className="flex-1 text-center">
                  <p className="text-[#F5F5F5] text-sm">{item.element_b_texte}</p>
                </div>
              </div>
              <div className="flex justify-center gap-6 text-sm">
                <span className="text-yellow-400">⭐ {item.stars_count}</span>
                <span className="text-green-400">👍 {item.thumbs_up_count}</span>
                <span className="text-[#DC2626]">👎 {item.thumbs_down_count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reported Duels (thumbs down) */}
      <section className="max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">🚨 Duels signalés</h2>
        {feedback.filter(f => f.thumbs_down_count > 0).length === 0 ? (
          <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-8 text-center text-[#737373]">
            Aucun duel signalé pour le moment
          </div>
        ) : (
          <div className="space-y-4">
            {feedback
              .filter(f => f.thumbs_down_count > 0)
              .sort((a, b) => b.thumbs_down_count - a.thumbs_down_count)
              .map((item, index) => (
                <div
                  key={index}
                  className="bg-[#DC2626]/10 border border-[#DC2626]/30 rounded-xl p-4"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1 text-center">
                      <p className="text-[#F5F5F5] text-sm">{item.element_a_texte}</p>
                    </div>
                    <span className="text-[#DC2626] font-bold">VS</span>
                    <div className="flex-1 text-center">
                      <p className="text-[#F5F5F5] text-sm">{item.element_b_texte}</p>
                    </div>
                  </div>
                  <div className="flex justify-center gap-6 text-sm">
                    <span className="text-[#DC2626] font-bold">👎 {item.thumbs_down_count} signalements</span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
