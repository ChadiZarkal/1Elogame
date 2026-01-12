# 🔗 Integration Design - Red or Green Game

> **Design of integrations with external systems**

---

## 📌 Overview

This document describes the integrations with third-party services for the Red or Green Game. The MVP has a **minimal integration footprint** to maintain simplicity and zero-cost operation.

---

## 🗺️ Integration Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RED OR GREEN GAME                                 │
│                                                                      │
│   ┌───────────────────────────────────────────────────────────┐     │
│   │                  NEXT.JS APPLICATION                       │     │
│   │                                                            │     │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │     │
│   │  │ Frontend │  │   API    │  │  Admin   │  │ Middleware│  │     │
│   │  │   SPA    │  │  Routes  │  │  Routes  │  │   Auth    │  │     │
│   │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │     │
│   │       │             │             │             │         │     │
│   └───────┼─────────────┼─────────────┼─────────────┼─────────┘     │
│           │             │             │             │                │
│           ▼             ▼             ▼             ▼                │
│   ┌───────────────────────────────────────────────────────────┐     │
│   │                   INTEGRATION LAYER                        │     │
│   └───────────────────────────────────────────────────────────┘     │
│           │             │             │             │                │
│           ▼             ▼             ▼             ▼                │
└───────────┼─────────────┼─────────────┼─────────────┼────────────────┘
            │             │             │             │
            ▼             ▼             ▼             ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   SUPABASE   │ │    VERCEL    │ │  LocalStorage│ │   Browser    │
    │  PostgreSQL  │ │   Hosting    │ │   (Client)   │ │    APIs      │
    │    + Auth    │ │    + CDN     │ │              │ │              │
    └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 🔐 Supabase Integration

### Overview

| Aspect | Details |
|--------|---------|
| **Service** | Supabase (BaaS) |
| **Tier** | Free (for MVP) |
| **Components Used** | PostgreSQL, Auth (JWT), Connection Pooling |
| **SDK** | @supabase/supabase-js |

### Configuration

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role (for admin operations)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

### Usage Patterns

#### Public Queries (Elements, Duels)
```typescript
// API route - fetching elements
export async function GET() {
  const { data: elements, error } = await supabase
    .from('elements')
    .select('id, texte, categorie, elo_global')
    .eq('actif', true);

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: elements });
}
```

#### Transactional Writes (Votes)
```typescript
// API route - recording a vote
export async function POST(request: NextRequest) {
  const { winnerId, loserId, sexe, age } = await request.json();

  // Use Promise.all for parallel updates
  const [voteResult, winnerUpdate, loserUpdate] = await Promise.all([
    supabase.from('votes').insert({
      element_gagnant_id: winnerId,
      element_perdant_id: loserId,
      sexe_votant: sexe,
      age_votant: age,
    }),
    supabase
      .from('elements')
      .update({ elo_global: newWinnerElo, nb_participations: winner.nb_participations + 1 })
      .eq('id', winnerId),
    supabase
      .from('elements')
      .update({ elo_global: newLoserElo, nb_participations: loser.nb_participations + 1 })
      .eq('id', loserId),
  ]);

  // Handle results...
}
```

### Supabase Auth (Admin Only)

```typescript
// Admin authentication
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      token: data.session.access_token,
      expiresIn: data.session.expires_in,
    },
  });
}
```

### Connection Limits

| Limit | Value | Notes |
|-------|-------|-------|
| Connections | 60 (free tier) | Use connection pooling |
| Requests/day | 500,000 (free) | Sufficient for MVP |
| Storage | 500 MB | Sufficient for MVP |
| Auth Users | 50,000 | Only admin accounts needed |

---

## 🌐 Vercel Integration

### Overview

| Aspect | Details |
|--------|---------|
| **Service** | Vercel (Hosting) |
| **Tier** | Hobby (free) |
| **Components Used** | Edge Functions, CDN, Analytics |

### Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["cdg1"],
  "functions": {
    "app/api/**/*": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

### Environment Variables

| Variable | Description | Where Set |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Vercel Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Vercel Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | Vercel Dashboard (secret) |
| `ADMIN_EMAIL` | Admin email for auth | Vercel Dashboard |

### Deployment Flow

```
Developer        GitHub           Vercel            CDN
    │               │                │                │
    │── Push ──────▶│                │                │
    │               │── Webhook ────▶│                │
    │               │                │── Build ───────│
    │               │                │── Deploy ─────▶│
    │               │                │◀── Edge Ready ─│
    │◀── Preview URL─┼────────────────│                │
    │               │                │                │
```

### Vercel Limits (Hobby)

| Limit | Value | Notes |
|-------|-------|-------|
| Bandwidth | 100 GB/month | Sufficient for MVP |
| Serverless Functions | 100 GB-hours | Ample for ~15 users |
| Build Time | 45 min/build | No concerns |
| Edge Regions | 1 | CDG (Paris) recommended |

---

## 💾 LocalStorage Integration (Client-Side)

### Overview

LocalStorage is used for session persistence within a browser session. This is a **client-side only** integration.

### Implementation

```typescript
// lib/localStorage.ts

const KEYS = {
  profile: 'rog_profile',
  seenDuels: 'rog_seenDuels',
  streak: 'rog_streak',
} as const;

export const storage = {
  // Profile
  getProfile(): Profile | null {
    const data = localStorage.getItem(KEYS.profile);
    return data ? JSON.parse(data) : null;
  },

  setProfile(profile: Profile): void {
    localStorage.setItem(KEYS.profile, JSON.stringify(profile));
  },

  // Seen Duels
  getSeenDuels(): string[] {
    const data = localStorage.getItem(KEYS.seenDuels);
    return data ? JSON.parse(data) : [];
  },

  addSeenDuel(pairKey: string): void {
    const duels = this.getSeenDuels();
    if (!duels.includes(pairKey)) {
      duels.push(pairKey);
      localStorage.setItem(KEYS.seenDuels, JSON.stringify(duels));
    }
  },

  // Streak
  getStreak(): number {
    return parseInt(localStorage.getItem(KEYS.streak) || '0', 10);
  },

  setStreak(count: number): void {
    localStorage.setItem(KEYS.streak, count.toString());
  },

  // Clear all (on page refresh behavior)
  clearAll(): void {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  },
};
```

### Data Structure

```typescript
// Types stored in LocalStorage
interface StoredProfile {
  sexe: 'homme' | 'femme' | 'nonbinaire' | 'autre';
  age: '16-18' | '19-22' | '23-26' | '27+';
}

interface StoredSeenDuels {
  // Array of "id1-id2" pairs (alphabetically sorted)
  duels: string[];
}

// Streak is just a number
```

### Storage Limits

| Browser | Limit | Notes |
|---------|-------|-------|
| Chrome | 5 MB | Well above our needs |
| Firefox | 5 MB | Well above our needs |
| Safari | 5 MB | Well above our needs |
| Mobile | 2.5-5 MB | Sufficient |

**Estimated Usage:**
- Profile: ~100 bytes
- SeenDuels (max ~20k pairs): ~1 MB max
- Streak: ~10 bytes

---

## 🔄 Error Handling Strategy

### Supabase Errors

```typescript
// lib/errors.ts
export function handleSupabaseError(error: PostgrestError): ApiError {
  const errorMap: Record<string, ApiError> = {
    '23505': { code: 'CONFLICT', message: 'Resource already exists', status: 409 },
    '23503': { code: 'FOREIGN_KEY', message: 'Referenced resource not found', status: 400 },
    'PGRST116': { code: 'NOT_FOUND', message: 'Resource not found', status: 404 },
  };

  return errorMap[error.code] || {
    code: 'INTERNAL_ERROR',
    message: 'Database error',
    status: 500,
  };
}
```

### Retry Strategy

```typescript
// lib/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  delayMs = 500
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }

  throw lastError!;
}

// Usage in API route
const { data, error } = await withRetry(() =>
  supabase.from('elements').select('*').eq('actif', true)
);
```

---

## 📊 Monitoring

### Vercel Analytics

Built-in Vercel analytics provides:
- Request counts
- Response times
- Error rates
- Geographic distribution

**No additional setup required for MVP.**

### Manual Logging

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: 'info', message, ...data, timestamp: new Date().toISOString() }));
  },
  error: (message: string, error?: Error, data?: Record<string, unknown>) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      ...data,
      timestamp: new Date().toISOString(),
    }));
  },
};

// Usage
logger.info('Vote recorded', { winnerId, loserId, duration: Date.now() - start });
logger.error('Vote failed', error, { winnerId, loserId });
```

---

## 🔐 Security Considerations

### API Security

| Measure | Implementation |
|---------|----------------|
| HTTPS | Automatic via Vercel |
| Input Validation | Zod schemas on all endpoints |
| SQL Injection | Supabase parameterized queries |
| Admin Auth | JWT tokens via Supabase Auth |
| CORS | Handled by Next.js |

### Environment Variables

```bash
# .env.local (never commit)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-side only
```

### Supabase RLS (Row Level Security)

```sql
-- Allow anyone to read active elements
CREATE POLICY "Anyone can read active elements"
ON elements FOR SELECT
USING (actif = true);

-- Allow anyone to insert votes (anonymous)
CREATE POLICY "Anyone can insert votes"
ON votes FOR INSERT
WITH CHECK (true);

-- Only admin can modify elements
CREATE POLICY "Only admin can modify elements"
ON elements FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
```

---

## 📋 Integration Checklist

### Pre-Launch

- [ ] Supabase project created and configured
- [ ] Database schema migrated
- [ ] Environment variables set in Vercel
- [ ] Admin user created in Supabase Auth
- [ ] RLS policies enabled and tested
- [ ] Vercel deployment successful
- [ ] Custom domain configured (optional)

### Post-Launch

- [ ] Monitor Vercel analytics
- [ ] Check Supabase connection usage
- [ ] Review error logs
- [ ] Verify admin access working

---

🚦 **Note:** The integration layer is intentionally minimal for MVP. Future versions may add analytics (Plausible), error tracking (Sentry), or email notifications.
