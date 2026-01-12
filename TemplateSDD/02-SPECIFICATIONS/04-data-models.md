# 📊 Data Models - Red or Green Game

> **Definition of entities, relations and data structures**

---

## 📌 Overview

This document defines the data models for the Red or Green Game system. These models constitute the **data contract** between frontend, backend, and database.

**Key Principles:**
- No user accounts (anonymous voting)
- Session data stored in LocalStorage only
- Minimal server-side data (elements, votes, feedback)

---

## 🗄️ Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              ELEMENTS                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ id (PK)              UUID                                               │
│ texte                VARCHAR(200)                                        │
│ categorie            ENUM                                                │
│ niveau_provocation   INTEGER (1-4)                                       │
│ actif                BOOLEAN                                             │
│                                                                          │
│ elo_global           INTEGER (default 1000)                              │
│ elo_homme            INTEGER (default 1000)                              │
│ elo_femme            INTEGER (default 1000)                              │
│ elo_nonbinaire       INTEGER (default 1000)                              │
│ elo_autre            INTEGER (default 1000)                              │
│ elo_16_18            INTEGER (default 1000)                              │
│ elo_19_22            INTEGER (default 1000)                              │
│ elo_23_26            INTEGER (default 1000)                              │
│ elo_27plus           INTEGER (default 1000)                              │
│                                                                          │
│ nb_participations    INTEGER (default 0)                                 │
│ created_at           TIMESTAMPTZ                                         │
│ updated_at           TIMESTAMPTZ                                         │
└─────────────────────────────────────────────────────────────────────────┘
        │                                    │
        │ 1:N (winner)                       │ 1:N (loser)
        ▼                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                               VOTES                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ id (PK)               UUID                                               │
│ element_gagnant_id    UUID (FK → elements.id)                            │
│ element_perdant_id    UUID (FK → elements.id)                            │
│ sexe_votant           ENUM                                               │
│ age_votant            ENUM                                               │
│ created_at            TIMESTAMPTZ                                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           DUEL_FEEDBACK                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ id (PK)               UUID                                               │
│ element_a_id          UUID (FK → elements.id)                            │
│ element_b_id          UUID (FK → elements.id)                            │
│ stars_count           INTEGER (default 0)                                │
│ thumbs_up_count       INTEGER (default 0)                                │
│ thumbs_down_count     INTEGER (default 0)                                │
│ updated_at            TIMESTAMPTZ                                        │
└─────────────────────────────────────────────────────────────────────────┘

Note: element_a_id < element_b_id (alphabetically sorted) to ensure uniqueness
```

---

## 📋 Entities

### Elements

#### Description
Represents a game element (proposition/statement) that players vote on. Each element has a text, category, provocation level, and multiple ELO scores for different demographic segments.

#### Attributes

| Attribute | Type | Required | Unique | Description | Validation |
|-----------|------|----------|--------|-------------|------------|
| `id` | UUID | Yes | Yes | Unique identifier | Auto-generated |
| `texte` | String | Yes | Yes | Element text content | 3-200 chars |
| `categorie` | Enum | Yes | No | Element category | See enum below |
| `niveau_provocation` | Integer | Yes | No | Provocation level | 1-4 |
| `actif` | Boolean | Yes | No | Is element active | Default: true |
| `elo_global` | Integer | Yes | No | Global ELO score | Default: 1000 |
| `elo_homme` | Integer | Yes | No | ELO for men segment | Default: 1000 |
| `elo_femme` | Integer | Yes | No | ELO for women segment | Default: 1000 |
| `elo_nonbinaire` | Integer | Yes | No | ELO for non-binary segment | Default: 1000 |
| `elo_autre` | Integer | Yes | No | ELO for other segment | Default: 1000 |
| `elo_16_18` | Integer | Yes | No | ELO for 16-18 age segment | Default: 1000 |
| `elo_19_22` | Integer | Yes | No | ELO for 19-22 age segment | Default: 1000 |
| `elo_23_26` | Integer | Yes | No | ELO for 23-26 age segment | Default: 1000 |
| `elo_27plus` | Integer | Yes | No | ELO for 27+ age segment | Default: 1000 |
| `nb_participations` | Integer | Yes | No | Total vote participations | Default: 0 |
| `created_at` | DateTime | Yes | No | Creation timestamp | Auto |
| `updated_at` | DateTime | Yes | No | Last update timestamp | Auto |

#### Enums

**categorie:**
```typescript
type Categorie = 'metier' | 'comportement' | 'trait' | 'preference' | 'absurde';
```

| Value | Description | Example |
|-------|-------------|---------|
| `metier` | Profession/Job | "Être policier" |
| `comportement` | Behavior | "Manger ses crottes de nez" |
| `trait` | Character trait | "Être avare" |
| `preference` | Preference/Fetish | "Aimer les pieds" |
| `absurde` | Absurd/Funny | "Être fan de sardines" |

#### Indexes
- `PRIMARY KEY (id)`
- `UNIQUE INDEX (texte)`
- `INDEX (actif)` - For filtering active elements
- `INDEX (elo_global)` - For ELO-based duel selection
- `INDEX (categorie)` - For cross-category algorithm

#### Schema (TypeScript)
```typescript
interface Element {
  id: string;
  texte: string;
  categorie: 'metier' | 'comportement' | 'trait' | 'preference' | 'absurde';
  niveau_provocation: 1 | 2 | 3 | 4;
  actif: boolean;
  
  // ELO Scores
  elo_global: number;
  elo_homme: number;
  elo_femme: number;
  elo_nonbinaire: number;
  elo_autre: number;
  elo_16_18: number;
  elo_19_22: number;
  elo_23_26: number;
  elo_27plus: number;
  
  nb_participations: number;
  created_at: Date;
  updated_at: Date;
}
```

#### Validation (Zod)
```typescript
import { z } from 'zod';

export const elementSchema = z.object({
  texte: z.string()
    .min(3, 'Text must be at least 3 characters')
    .max(200, 'Text must not exceed 200 characters'),
  categorie: z.enum(['metier', 'comportement', 'trait', 'preference', 'absurde']),
  niveau_provocation: z.number().int().min(1).max(4).default(2),
  actif: z.boolean().default(true),
});

export const elementCreateSchema = elementSchema;

export const elementUpdateSchema = elementSchema.partial();
```

---

### Votes

#### Description
Records each vote cast by a player. Stores the winner/loser element IDs and voter demographic data for segmented ELO calculations.

#### Attributes

| Attribute | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| `id` | UUID | Yes | Unique identifier | Auto-generated |
| `element_gagnant_id` | UUID | Yes | Winner element | FK → elements.id |
| `element_perdant_id` | UUID | Yes | Loser element | FK → elements.id |
| `sexe_votant` | Enum | Yes | Voter sex | See enum |
| `age_votant` | Enum | Yes | Voter age range | See enum |
| `created_at` | DateTime | Yes | Vote timestamp | Auto |

#### Enums

**sexe_votant:**
```typescript
type SexeVotant = 'homme' | 'femme' | 'nonbinaire' | 'autre';
```

**age_votant:**
```typescript
type AgeVotant = '16-18' | '19-22' | '23-26' | '27+';
```

#### Indexes
- `PRIMARY KEY (id)`
- `INDEX (element_gagnant_id)` - For ELO queries
- `INDEX (element_perdant_id)` - For ELO queries
- `INDEX (created_at)` - For analytics
- `INDEX (sexe_votant, age_votant)` - For segmented analytics

#### Schema (TypeScript)
```typescript
interface Vote {
  id: string;
  element_gagnant_id: string;
  element_perdant_id: string;
  sexe_votant: 'homme' | 'femme' | 'nonbinaire' | 'autre';
  age_votant: '16-18' | '19-22' | '23-26' | '27+';
  created_at: Date;
}
```

#### Validation (Zod)
```typescript
import { z } from 'zod';

export const voteSchema = z.object({
  winnerId: z.string().uuid('Invalid UUID format'),
  loserId: z.string().uuid('Invalid UUID format'),
  sexe: z.enum(['homme', 'femme', 'nonbinaire', 'autre']),
  age: z.enum(['16-18', '19-22', '23-26', '27+']),
}).refine(data => data.winnerId !== data.loserId, {
  message: 'Winner and loser cannot be the same element',
  path: ['loserId'],
});
```

---

### DuelFeedback

#### Description
Aggregates feedback (stars and thumbs) for specific duel pairs. Elements are stored in sorted order (element_a_id < element_b_id alphabetically) to ensure unique pair identification.

#### Attributes

| Attribute | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| `id` | UUID | Yes | Unique identifier | Auto-generated |
| `element_a_id` | UUID | Yes | First element (sorted) | FK → elements.id |
| `element_b_id` | UUID | Yes | Second element (sorted) | FK → elements.id |
| `stars_count` | Integer | Yes | Star feedback count | Default: 0, ≥ 0 |
| `thumbs_up_count` | Integer | Yes | Thumbs up count | Default: 0, ≥ 0 |
| `thumbs_down_count` | Integer | Yes | Thumbs down count | Default: 0, ≥ 0 |
| `updated_at` | DateTime | Yes | Last update timestamp | Auto |

#### Constraints
- `element_a_id < element_b_id` (CHECK constraint)
- `UNIQUE (element_a_id, element_b_id)`

#### Indexes
- `PRIMARY KEY (id)`
- `UNIQUE INDEX (element_a_id, element_b_id)` - For upsert operations
- `INDEX (stars_count DESC)` - For starred duel algorithm

#### Schema (TypeScript)
```typescript
interface DuelFeedback {
  id: string;
  element_a_id: string;
  element_b_id: string;
  stars_count: number;
  thumbs_up_count: number;
  thumbs_down_count: number;
  updated_at: Date;
}
```

---

## 📦 DTOs (Data Transfer Objects)

### ElementDTO (Response)
```typescript
// Sent to client (game view)
interface ElementDTO {
  id: string;
  texte: string;
  categorie: string;
}
```

### ElementDetailDTO (Admin Response)
```typescript
// Sent to admin dashboard
interface ElementDetailDTO {
  id: string;
  texte: string;
  categorie: string;
  niveau_provocation: number;
  actif: boolean;
  elo_global: number;
  nb_participations: number;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
```

### DuelDTO (Response)
```typescript
// Sent when requesting a duel
interface DuelDTO {
  elementA: ElementDTO;
  elementB: ElementDTO;
}
```

### VoteResultDTO (Response)
```typescript
// Sent after recording a vote
interface VoteResultDTO {
  winner: {
    id: string;
    texte: string;
    percentage: number;
    participations: number;
  };
  loser: {
    id: string;
    texte: string;
    percentage: number;
    participations: number;
  };
  streak: {
    matched: boolean;
    current: number;
  };
}
```

### VoteRequestDTO (Request)
```typescript
// Received from client when voting
interface VoteRequestDTO {
  winnerId: string;
  loserId: string;
  sexe: 'homme' | 'femme' | 'nonbinaire' | 'autre';
  age: '16-18' | '19-22' | '23-26' | '27+';
}
```

### FeedbackRequestDTO (Request)
```typescript
// Received from client for feedback
interface FeedbackRequestDTO {
  elementAId: string;
  elementBId: string;
  type: 'star' | 'thumbs_up' | 'thumbs_down';
}
```

---

## 💾 Client-Side Data (LocalStorage)

### Session State
```typescript
interface LocalStorageSession {
  profile: {
    sexe: 'homme' | 'femme' | 'nonbinaire' | 'autre';
    age: '16-18' | '19-22' | '23-26' | '27+';
  };
  seenDuels: string[]; // Array of "id1-id2" sorted pairs
  streak: number;
}
```

### Storage Keys
| Key | Type | Description |
|-----|------|-------------|
| `rog_profile` | JSON | User demographic profile |
| `rog_seenDuels` | JSON Array | List of seen duel pairs |
| `rog_streak` | Number | Current streak count |

**Notes:**
- All data is cleared on page refresh (intentional for party game flow)
- Maximum ~200 elements × 199 / 2 ≈ 19,900 possible pairs

---

## 🔄 Migrations

### Convention
```
YYYYMMDDHHMMSS_description.sql
```

### 001 - Create Elements Table
```sql
-- Migration: 20260110120000_create_elements_table.sql

-- Up
CREATE TABLE elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  texte VARCHAR(200) UNIQUE NOT NULL,
  categorie VARCHAR(50) NOT NULL CHECK (categorie IN ('metier', 'comportement', 'trait', 'preference', 'absurde')),
  niveau_provocation INTEGER NOT NULL DEFAULT 2 CHECK (niveau_provocation BETWEEN 1 AND 4),
  actif BOOLEAN NOT NULL DEFAULT true,
  
  elo_global INTEGER NOT NULL DEFAULT 1000,
  elo_homme INTEGER NOT NULL DEFAULT 1000,
  elo_femme INTEGER NOT NULL DEFAULT 1000,
  elo_nonbinaire INTEGER NOT NULL DEFAULT 1000,
  elo_autre INTEGER NOT NULL DEFAULT 1000,
  elo_16_18 INTEGER NOT NULL DEFAULT 1000,
  elo_19_22 INTEGER NOT NULL DEFAULT 1000,
  elo_23_26 INTEGER NOT NULL DEFAULT 1000,
  elo_27plus INTEGER NOT NULL DEFAULT 1000,
  
  nb_participations INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_elements_actif ON elements(actif);
CREATE INDEX idx_elements_elo_global ON elements(elo_global);
CREATE INDEX idx_elements_categorie ON elements(categorie);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_elements_updated_at
  BEFORE UPDATE ON elements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Down
DROP TRIGGER IF EXISTS update_elements_updated_at ON elements;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS elements;
```

### 002 - Create Votes Table
```sql
-- Migration: 20260110120001_create_votes_table.sql

-- Up
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  element_gagnant_id UUID NOT NULL REFERENCES elements(id) ON DELETE CASCADE,
  element_perdant_id UUID NOT NULL REFERENCES elements(id) ON DELETE CASCADE,
  sexe_votant VARCHAR(20) NOT NULL CHECK (sexe_votant IN ('homme', 'femme', 'nonbinaire', 'autre')),
  age_votant VARCHAR(10) NOT NULL CHECK (age_votant IN ('16-18', '19-22', '23-26', '27+')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CHECK (element_gagnant_id != element_perdant_id)
);

CREATE INDEX idx_votes_element_gagnant ON votes(element_gagnant_id);
CREATE INDEX idx_votes_element_perdant ON votes(element_perdant_id);
CREATE INDEX idx_votes_created_at ON votes(created_at);
CREATE INDEX idx_votes_demographics ON votes(sexe_votant, age_votant);

-- Down
DROP TABLE IF EXISTS votes;
```

### 003 - Create DuelFeedback Table
```sql
-- Migration: 20260110120002_create_duel_feedback_table.sql

-- Up
CREATE TABLE duel_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  element_a_id UUID NOT NULL REFERENCES elements(id) ON DELETE CASCADE,
  element_b_id UUID NOT NULL REFERENCES elements(id) ON DELETE CASCADE,
  stars_count INTEGER NOT NULL DEFAULT 0 CHECK (stars_count >= 0),
  thumbs_up_count INTEGER NOT NULL DEFAULT 0 CHECK (thumbs_up_count >= 0),
  thumbs_down_count INTEGER NOT NULL DEFAULT 0 CHECK (thumbs_down_count >= 0),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CHECK (element_a_id < element_b_id),
  UNIQUE (element_a_id, element_b_id)
);

CREATE INDEX idx_duel_feedback_stars ON duel_feedback(stars_count DESC);

-- Trigger for updated_at
CREATE TRIGGER update_duel_feedback_updated_at
  BEFORE UPDATE ON duel_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Down
DROP TRIGGER IF EXISTS update_duel_feedback_updated_at ON duel_feedback;
DROP TABLE IF EXISTS duel_feedback;
```

---

## 📊 ELO Calculation Logic

### Formula
```typescript
const K = 32; // K-factor

function calculateNewElo(
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
```

### Percentage Estimation
```typescript
function calculatePercentage(winnerElo: number, loserElo: number): number {
  return Math.round(
    (1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400))) * 100
  );
}
```

---

## 📝 Data Validation Rules

### Standard Types

| Logical Type | DB Type | TS Type | Validation |
|--------------|---------|---------|------------|
| ID | UUID | string | UUID v4 format |
| Text | VARCHAR(200) | string | 3-200 chars |
| Category | VARCHAR(50) | string | Enum values |
| ELO Score | INTEGER | number | Default 1000, positive |
| Counter | INTEGER | number | ≥ 0 |
| DateTime | TIMESTAMPTZ | Date | ISO 8601 |

### Constraints Summary

| Table | Constraint | Description |
|-------|------------|-------------|
| elements | texte UNIQUE | No duplicate elements |
| votes | gagnant ≠ perdant | Can't vote for same element |
| duel_feedback | a_id < b_id | Alphabetical sorting for uniqueness |
| duel_feedback | (a_id, b_id) UNIQUE | One record per duel pair |

---

🚦 **Note:** Any data model changes require a migration and update to this document.
