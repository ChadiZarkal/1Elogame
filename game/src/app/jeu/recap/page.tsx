'use client';

import dynamic from 'next/dynamic';

const GameRecap = dynamic(
  () => import('@/components/game/GameRecap').then(m => m.GameRecap),
  { ssr: false },
);

export default function RecapPage() {
  return <GameRecap />;
}
