'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileForm } from '@/components/game/ProfileForm';
import { useGameStore } from '@/stores/gameStore';

export default function JeuPage() {
  const router = useRouter();
  const { hasProfile, initializeFromStorage } = useGameStore();
  
  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);
  
  // If already has profile, redirect to game
  useEffect(() => {
    if (hasProfile) {
      router.push('/jeu/jouer');
    }
  }, [hasProfile, router]);
  
  return <ProfileForm />;
}
