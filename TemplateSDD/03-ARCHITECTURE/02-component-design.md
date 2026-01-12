# 📦 Component Design - Red or Green Game

> **Detailed design of system components**

---

## 📌 Introduction

This document details the internal architecture of each major component for the Red or Green Game. The design prioritizes simplicity, performance, and mobile-first UX.

---

## 🎨 Frontend Components

### Project Structure (Next.js 14 App Router)

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main game page (/)
│   ├── globals.css          # Global styles
│   └── admin/               # Admin routes (protected)
│       ├── layout.tsx       # Admin layout with auth
│       ├── page.tsx         # Dashboard
│       ├── elements/        # Elements CRUD
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       └── rankings/page.tsx
│
├── components/               # React components
│   ├── ui/                  # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Spinner.tsx
│   │
│   ├── game/                # Game-specific components
│   │   ├── ProfileForm.tsx       # Sex/age form
│   │   ├── DuelCard.tsx          # Single element card
│   │   ├── DuelDisplay.tsx       # Both elements side-by-side
│   │   ├── VoteButton.tsx        # Tap-to-vote button
│   │   ├── ResultDisplay.tsx     # Percentage reveal
│   │   ├── ResultAnimation.tsx   # Framer Motion animation
│   │   ├── StreakBadge.tsx       # Streak counter
│   │   └── FeedbackButtons.tsx   # Star/thumbs buttons
│   │
│   └── admin/               # Admin components
│       ├── ElementTable.tsx
│       ├── ElementForm.tsx
│       ├── StatsCards.tsx
│       └── RankingsList.tsx
│
├── hooks/                   # Custom React hooks
│   ├── useProfile.ts        # LocalStorage profile management
│   ├── useSeenDuels.ts      # LocalStorage duel tracking
│   ├── useStreak.ts         # Streak counter logic
│   ├── useDuelSelection.ts  # Algorithm for next duel
│   └── useVote.ts           # Vote submission
│
├── stores/                  # Zustand stores
│   ├── gameStore.ts         # Main game state
│   └── elementsStore.ts     # Preloaded elements cache
│
├── lib/                     # Utilities and config
│   ├── supabase.ts          # Supabase client
│   ├── api.ts               # API client functions
│   ├── elo.ts               # ELO calculation helpers
│   ├── constants.ts         # App constants
│   └── utils.ts             # General utilities
│
└── types/                   # TypeScript definitions
    ├── element.ts
    ├── vote.ts
    └── profile.ts
```

---

### Core Game Components

#### ProfileForm
```typescript
// components/game/ProfileForm.tsx
'use client';

import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/Button';

interface ProfileFormProps {
  onComplete: () => void;
}

export function ProfileForm({ onComplete }: ProfileFormProps) {
  const { saveProfile } = useProfile();
  const [sexe, setSexe] = useState<string | null>(null);
  const [age, setAge] = useState<string | null>(null);

  const handleSubmit = () => {
    if (sexe && age) {
      saveProfile({ sexe, age });
      onComplete();
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 max-w-md mx-auto">
      {/* Sex Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-center">Tu es...</h2>
        <div className="grid grid-cols-2 gap-3">
          {['Homme', 'Femme', 'Non-binaire', 'Autre'].map((option) => (
            <Button
              key={option}
              variant={sexe === option.toLowerCase() ? 'primary' : 'secondary'}
              onClick={() => setSexe(option.toLowerCase())}
              className="py-4"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      {/* Age Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-center">Tu as...</h2>
        <div className="grid grid-cols-2 gap-3">
          {['16-18', '19-22', '23-26', '27+'].map((range) => (
            <Button
              key={range}
              variant={age === range ? 'primary' : 'secondary'}
              onClick={() => setAge(range)}
              className="py-4"
            >
              {range} ans
            </Button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <Button
        variant="primary"
        disabled={!sexe || !age}
        onClick={handleSubmit}
        className="w-full py-4 text-lg font-bold"
      >
        C'est parti ! 🚀
      </Button>
    </div>
  );
}
```

#### DuelDisplay
```typescript
// components/game/DuelDisplay.tsx
'use client';

import { motion } from 'framer-motion';
import { DuelCard } from './DuelCard';
import { VoteButton } from './VoteButton';
import { Element } from '@/types/element';

interface DuelDisplayProps {
  elementA: Element;
  elementB: Element;
  onVote: (winnerId: string, loserId: string) => void;
  disabled: boolean;
}

export function DuelDisplay({ elementA, elementB, onVote, disabled }: DuelDisplayProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Question Header */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold">
          C'est quoi le pire <span className="text-red-500">red flag</span> ?
        </h1>
      </div>

      {/* Duel Cards - Stacked on mobile */}
      <div className="flex-1 flex flex-col gap-4 px-4">
        <motion.div
          className="flex-1"
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.1 }}
        >
          <DuelCard
            element={elementA}
            onClick={() => onVote(elementA.id, elementB.id)}
            disabled={disabled}
          />
        </motion.div>

        {/* VS Separator */}
        <div className="flex items-center justify-center">
          <span className="text-xl font-bold text-gray-400">VS</span>
        </div>

        <motion.div
          className="flex-1"
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.1 }}
        >
          <DuelCard
            element={elementB}
            onClick={() => onVote(elementB.id, elementA.id)}
            disabled={disabled}
          />
        </motion.div>
      </div>
    </div>
  );
}
```

#### ResultAnimation
```typescript
// components/game/ResultAnimation.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { StreakBadge } from './StreakBadge';
import { FeedbackButtons } from './FeedbackButtons';

interface ResultAnimationProps {
  winner: {
    id: string;
    texte: string;
    percentage: number;
  };
  loser: {
    id: string;
    texte: string;
    percentage: number;
  };
  streak: {
    matched: boolean;
    current: number;
  };
  onNext: () => void;
  onStar: () => void;
  onThumbsUp: () => void;
  onThumbsDown: () => void;
}

export function ResultAnimation({
  winner,
  loser,
  streak,
  onNext,
  onStar,
  onThumbsUp,
  onThumbsDown,
}: ResultAnimationProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onNext}  // Skip animation on tap
      >
        <motion.div
          className="bg-white rounded-2xl p-6 m-4 max-w-sm w-full"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ 
            type: 'spring', 
            duration: 1.2,
            ease: 'easeOut'
          }}
        >
          {/* Winner */}
          <div className="text-center mb-4">
            <p className="text-gray-500 text-sm">Le pire selon {winner.percentage}%</p>
            <p className="text-xl font-bold text-red-600 mt-2">{winner.texte}</p>
            <motion.div
              className="text-4xl font-bold text-red-600 mt-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              {winner.percentage}%
            </motion.div>
          </div>

          {/* Loser */}
          <div className="text-center mb-4 opacity-60">
            <p className="text-lg">{loser.texte}</p>
            <p className="text-2xl font-bold">{loser.percentage}%</p>
          </div>

          {/* Streak */}
          <StreakBadge matched={streak.matched} count={streak.current} />

          {/* Feedback Buttons */}
          <FeedbackButtons
            onStar={onStar}
            onThumbsUp={onThumbsUp}
            onThumbsDown={onThumbsDown}
          />

          {/* Next hint */}
          <p className="text-center text-gray-400 text-sm mt-4">
            Touche pour continuer
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

---

### Zustand Stores

#### Game Store
```typescript
// stores/gameStore.ts
import { create } from 'zustand';
import { Element } from '@/types/element';

interface GameState {
  // State
  phase: 'profile' | 'loading' | 'playing' | 'result' | 'finished';
  currentDuel: { elementA: Element; elementB: Element } | null;
  lastResult: VoteResult | null;
  
  // Actions
  setPhase: (phase: GameState['phase']) => void;
  setCurrentDuel: (duel: GameState['currentDuel']) => void;
  setLastResult: (result: VoteResult | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  phase: 'profile',
  currentDuel: null,
  lastResult: null,

  setPhase: (phase) => set({ phase }),
  setCurrentDuel: (currentDuel) => set({ currentDuel }),
  setLastResult: (lastResult) => set({ lastResult }),
  reset: () => set({ 
    phase: 'profile', 
    currentDuel: null, 
    lastResult: null 
  }),
}));
```

#### Elements Store
```typescript
// stores/elementsStore.ts
import { create } from 'zustand';
import { Element } from '@/types/element';

interface ElementsState {
  elements: Element[];
  isLoaded: boolean;
  
  setElements: (elements: Element[]) => void;
  getActiveElements: () => Element[];
  getElementById: (id: string) => Element | undefined;
  getElementsByCategory: (category: string) => Element[];
}

export const useElementsStore = create<ElementsState>((set, get) => ({
  elements: [],
  isLoaded: false,

  setElements: (elements) => set({ elements, isLoaded: true }),
  
  getActiveElements: () => get().elements.filter(e => e.actif),
  
  getElementById: (id) => get().elements.find(e => e.id === id),
  
  getElementsByCategory: (category) => 
    get().elements.filter(e => e.categorie === category && e.actif),
}));
```

---

### Custom Hooks

#### useDuelSelection
```typescript
// hooks/useDuelSelection.ts
import { useCallback } from 'react';
import { useElementsStore } from '@/stores/elementsStore';
import { useSeenDuels } from './useSeenDuels';
import { Element } from '@/types/element';

export function useDuelSelection() {
  const { getActiveElements, getElementsByCategory } = useElementsStore();
  const { seenDuels, markAsSeen } = useSeenDuels();

  const selectNextDuel = useCallback((): { elementA: Element; elementB: Element } | null => {
    const elements = getActiveElements();
    
    if (elements.length < 2) return null;

    // Check if all duels have been seen
    const maxDuels = (elements.length * (elements.length - 1)) / 2;
    if (seenDuels.size >= maxDuels) return null;

    const random = Math.random();
    let duel: { elementA: Element; elementB: Element } | null = null;

    if (random < 0.50) {
      // 50%: ELO-close duels
      duel = selectEloCloseDuel(elements, seenDuels);
    } else if (random < 0.80) {
      // 30%: Cross-category
      duel = selectCrossCategoryDuel(elements, seenDuels, getElementsByCategory);
    } else {
      // 20%: Random (including starred fallback)
      duel = selectRandomDuel(elements, seenDuels);
    }

    return duel;
  }, [getActiveElements, getElementsByCategory, seenDuels]);

  return { selectNextDuel, markAsSeen };
}

// Helper functions
function selectEloCloseDuel(
  elements: Element[],
  seenDuels: Set<string>
): { elementA: Element; elementB: Element } | null {
  // Find pairs with ELO difference between 50-300
  const candidates: Array<{ a: Element; b: Element; diff: number }> = [];
  
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const pairKey = createPairKey(elements[i].id, elements[j].id);
      if (seenDuels.has(pairKey)) continue;
      
      const diff = Math.abs(elements[i].elo_global - elements[j].elo_global);
      if (diff >= 50 && diff <= 300) {
        candidates.push({ a: elements[i], b: elements[j], diff });
      }
    }
  }

  if (candidates.length === 0) {
    return selectRandomDuel(elements, seenDuels);
  }

  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  return { elementA: selected.a, elementB: selected.b };
}

function selectCrossCategoryDuel(
  elements: Element[],
  seenDuels: Set<string>,
  getByCategory: (cat: string) => Element[]
): { elementA: Element; elementB: Element } | null {
  const categories = ['metier', 'comportement', 'trait', 'preference', 'absurde'];
  const catA = categories[Math.floor(Math.random() * categories.length)];
  let catB = categories[Math.floor(Math.random() * categories.length)];
  while (catB === catA) {
    catB = categories[Math.floor(Math.random() * categories.length)];
  }

  const elementsA = getByCategory(catA);
  const elementsB = getByCategory(catB);

  if (elementsA.length === 0 || elementsB.length === 0) {
    return selectRandomDuel(elements, seenDuels);
  }

  // Find unseen pair
  for (let attempts = 0; attempts < 50; attempts++) {
    const a = elementsA[Math.floor(Math.random() * elementsA.length)];
    const b = elementsB[Math.floor(Math.random() * elementsB.length)];
    const pairKey = createPairKey(a.id, b.id);
    
    if (!seenDuels.has(pairKey)) {
      return { elementA: a, elementB: b };
    }
  }

  return selectRandomDuel(elements, seenDuels);
}

function selectRandomDuel(
  elements: Element[],
  seenDuels: Set<string>
): { elementA: Element; elementB: Element } | null {
  for (let attempts = 0; attempts < 100; attempts++) {
    const a = elements[Math.floor(Math.random() * elements.length)];
    const b = elements[Math.floor(Math.random() * elements.length)];
    
    if (a.id === b.id) continue;
    
    const pairKey = createPairKey(a.id, b.id);
    if (!seenDuels.has(pairKey)) {
      return { elementA: a, elementB: b };
    }
  }
  return null;
}

function createPairKey(id1: string, id2: string): string {
  return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
}
```

---

## 🖥️ Backend Components (API Routes)

### API Routes Structure

```
src/app/api/
├── elements/
│   └── route.ts              # GET /api/elements (public)
│
├── duel/
│   └── route.ts              # GET /api/duel (fallback)
│
├── vote/
│   └── route.ts              # POST /api/vote
│
├── feedback/
│   └── route.ts              # POST /api/feedback
│
└── admin/
    ├── auth/
    │   └── route.ts          # POST /api/admin/auth
    ├── elements/
    │   ├── route.ts          # GET, POST /api/admin/elements
    │   └── [id]/route.ts     # GET, PUT, PATCH /api/admin/elements/:id
    ├── stats/
    │   └── route.ts          # GET /api/admin/stats
    └── export/
        └── route.ts          # GET /api/admin/export
```

### Vote Route Handler
```typescript
// app/api/vote/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { calculateElo, calculatePercentage } from '@/lib/elo';

const voteSchema = z.object({
  winnerId: z.string().uuid(),
  loserId: z.string().uuid(),
  sexe: z.enum(['homme', 'femme', 'nonbinaire', 'autre']),
  age: z.enum(['16-18', '19-22', '23-26', '27+']),
}).refine(d => d.winnerId !== d.loserId, {
  message: 'Winner and loser must be different',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { winnerId, loserId, sexe, age } = voteSchema.parse(body);

    // 1. Fetch current elements
    const { data: elements, error: fetchError } = await supabase
      .from('elements')
      .select('id, texte, elo_global, nb_participations')
      .in('id', [winnerId, loserId]);

    if (fetchError || !elements || elements.length !== 2) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Elements not found' } },
        { status: 404 }
      );
    }

    const winner = elements.find(e => e.id === winnerId)!;
    const loser = elements.find(e => e.id === loserId)!;

    // 2. Calculate new ELO
    const { newWinnerElo, newLoserElo } = calculateElo(
      winner.elo_global,
      loser.elo_global
    );

    // 3. SYNC: Update global ELO + participations
    const [winnerUpdate, loserUpdate, voteInsert] = await Promise.all([
      supabase
        .from('elements')
        .update({
          elo_global: newWinnerElo,
          nb_participations: winner.nb_participations + 1,
        })
        .eq('id', winnerId),
      supabase
        .from('elements')
        .update({
          elo_global: newLoserElo,
          nb_participations: loser.nb_participations + 1,
        })
        .eq('id', loserId),
      supabase
        .from('votes')
        .insert({
          element_gagnant_id: winnerId,
          element_perdant_id: loserId,
          sexe_votant: sexe,
          age_votant: age,
        }),
    ]);

    // 4. ASYNC: Update segmented ELOs (fire-and-forget)
    updateSegmentedElos(winnerId, loserId, sexe, age).catch(console.error);

    // 5. Calculate percentages for response
    const winnerPercentage = calculatePercentage(newWinnerElo, newLoserElo);

    return NextResponse.json({
      success: true,
      data: {
        winner: {
          id: winnerId,
          texte: winner.texte,
          percentage: winnerPercentage,
          participations: winner.nb_participations + 1,
        },
        loser: {
          id: loserId,
          texte: loser.texte,
          percentage: 100 - winnerPercentage,
          participations: loser.nb_participations + 1,
        },
        streak: {
          matched: winner.elo_global > loser.elo_global,
          current: 0, // Client manages streak
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Vote error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

// Async segmented ELO update
async function updateSegmentedElos(
  winnerId: string,
  loserId: string,
  sexe: string,
  age: string
) {
  const sexeColumn = `elo_${sexe}`;
  const ageColumn = `elo_${age.replace('-', '_').replace('+', 'plus')}`;
  
  // Fetch current segmented ELOs and update
  // Implementation details...
}
```

---

## 🔧 Utility Functions

### ELO Calculator
```typescript
// lib/elo.ts
const K = 32;

export function calculateElo(
  winnerElo: number,
  loserElo: number
): { newWinnerElo: number; newLoserElo: number } {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 - expectedWinner;

  return {
    newWinnerElo: Math.round(winnerElo + K * (1 - expectedWinner)),
    newLoserElo: Math.round(loserElo + K * (0 - expectedLoser)),
  };
}

export function calculatePercentage(winnerElo: number, loserElo: number): number {
  return Math.round(
    (1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400))) * 100
  );
}
```

---

## 📊 Component Dependencies

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐          │
│   │    Page     │────▶│   Stores    │────▶│ LocalStorage│          │
│   │  (app/)     │     │  (Zustand)  │     │             │          │
│   └──────┬──────┘     └──────┬──────┘     └─────────────┘          │
│          │                   │                                       │
│          ▼                   ▼                                       │
│   ┌─────────────┐     ┌─────────────┐                               │
│   │ Components  │◀───▶│   Hooks     │                               │
│   │  (game/)    │     │             │                               │
│   └──────┬──────┘     └──────┬──────┘                               │
│          │                   │                                       │
│          └───────────────────┘                                       │
│                   │                                                  │
│                   ▼                                                  │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                      API Client (lib/api.ts)                 │   │
│   └──────────────────────────────┬──────────────────────────────┘   │
│                                  │                                   │
└──────────────────────────────────┼───────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐          │
│   │ API Routes  │────▶│    Zod      │────▶│   Supabase  │          │
│   │  (app/api)  │     │ Validation  │     │   Client    │          │
│   └─────────────┘     └─────────────┘     └──────┬──────┘          │
│                                                  │                   │
│                                                  ▼                   │
│                                          ┌─────────────┐            │
│                                          │  PostgreSQL │            │
│                                          │  (Supabase) │            │
│                                          └─────────────┘            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📝 Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Component file | PascalCase | `DuelCard.tsx` |
| Hook file | camelCase with use prefix | `useDuelSelection.ts` |
| Store file | camelCase with Store suffix | `gameStore.ts` |
| API route | lowercase route.ts | `app/api/vote/route.ts` |
| Type file | camelCase | `element.ts` |
| Utility file | camelCase | `elo.ts` |
| CSS classes | Tailwind utilities | `className="flex-1 p-4"` |
| Constants | SCREAMING_SNAKE | `const K_FACTOR = 32` |

---

🚦 **Note:** All new components must follow these established patterns and conventions.
