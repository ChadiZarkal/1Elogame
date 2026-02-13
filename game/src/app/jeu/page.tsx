'use client';

import { useEffect } from 'react';
import { ProfileForm } from '@/components/game/ProfileForm';
import { useGameStore } from '@/stores/gameStore';

export default function JeuPage() {
  const { clearProfile } = useGameStore();
  
  // Always clear profile on mount - force user to re-enter sex/age
  useEffect(() => {
    clearProfile();
  }, [clearProfile]);
  
  return <ProfileForm />;
}
