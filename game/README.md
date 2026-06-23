# Red Flag Games 🚩

A mobile-first party game where players vote on which of two options is the biggest "Red Flag" in dating/relationships. Features ELO ranking, streak tracking, an AI judge mode, and segmented statistics by demographics.

## Games

- **Red Flag Duel** (`/jeu/jouer`) — Choose between two red flags: which one is worse? ELO-ranked.
- **Flag or Not** (`/flagornot`) — Submit your own red flag and get judged by AI (Gemini) + community votes.
- **Flash Flag Sprint** (`/flashflag`) — Timed questionnaire with no backtracking, local or share-link mode.
- **Classement** (`/classement`) — Leaderboard with category filters and demographic breakdowns.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4, Framer Motion 12 |
| State | Zustand 5 |
| Database | Supabase (PostgreSQL) |
| AI | Google Vertex AI (Gemini) |
| Validation | Zod 4 |
| Testing | Vitest 4, Testing Library, Puppeteer (E2E) |

## Project Structure

```
game/src/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Landing page
│   ├── layout.tsx              # Root layout + ErrorBoundary
│   ├── jeu/                    # Red Flag Duel game
│   │   ├── page.tsx            # Profile form
│   │   └── jouer/page.tsx      # Main duel gameplay
│   ├── flagornot/              # Flag or Not AI game
│   │   ├── page.tsx            # Orchestrator (~90 lines)
│   │   ├── useFlagOrNot.ts     # Custom hook (state machine)
│   │   ├── IdlePhase.tsx       # Input phase
│   │   ├── LoadingPhase.tsx    # AI judging animation
│   │   └── RevealPhase.tsx     # Result reveal
│   ├── classement/page.tsx     # Leaderboard
│   ├── flashflag/              # Flash Flag Sprint (timed quiz)
│   │   ├── page.tsx            # Session creation (standard/custom)
│   │   └── session/[code]/page.tsx # Timed play + recap
│   ├── redflag/page.tsx        # Game mode selection
│   ├── admin/                  # Admin panel (7 pages)
│   └── api/                    # API routes
│       ├── duel/               # GET next duel pair
│       ├── vote/               # POST vote + ELO update
│       ├── flagornot/          # AI judge + community
│       ├── flashflag/          # Timed quiz sessions
│       ├── leaderboard/        # GET rankings
│       └── admin/              # Admin CRUD APIs
├── components/
│   ├── ui/                     # Reusable: Button, Loading, CategoryBadge, etc.
│   ├── game/                   # DuelInterface, ResultDisplay, ProfileForm, etc.
│   └── magicui/                # Animated effects (gradient text, sparkles)
├── lib/                        # Core logic
│   ├── algorithm.ts            # Duel selection (4 strategies + anti-repeat)
│   ├── algorithmConfig.ts      # Tunable algorithm parameters
│   ├── elo.ts                  # ELO calculation engine
│   ├── gemini.ts               # Vertex AI integration
│   ├── analytics.ts            # Client-side event tracking
│   ├── session.ts              # Server-side duel session management
│   ├── supabase.ts             # DB client + typed helpers
│   └── ...                     # utils, hooks, validation, rate limiting
├── stores/gameStore.ts         # Zustand store (game state)
├── config/categories.ts        # Game categories definition
└── types/                      # TypeScript types (database, game, API)
```

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase + Vertex AI credentials

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_MOCK_MODE` | Set to `true` for local dev without Supabase |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Vertex AI service account (JSON string) |
| `VERTEX_AI_LOCATION` | GCP region (default: `us-central1`) |
| `VERTEX_AI_MODEL` | Gemini model (default: `gemini-2.5-flash`) |
| `ADMIN_PASSWORD` | Admin panel password |

## Database Migrations

Migrations are in `supabase/migrations/` and numbered sequentially:

1. `001_initial_schema.sql` — Base tables (elements, votes)
2. `002_new_categories.sql` — Category system
3. `003_add_is_starred.sql` — Starred elements feature
4. `004_segment_participations.sql` — Per-demographic participation counters
5. `005_flagornot_submissions.sql` — Flag or Not submissions table
6. `013_flashflag_quiz.sql` — Flash Flag tests/sessions/answers schema
7. `014_flashflag_seed_standard.sql` — Standard Flash Flag test seed data

## Key Algorithms

### Duel Selection (`lib/algorithm.ts`)
Four weighted strategies (configurable via admin panel):
- **ELO Close (50%)** — Balanced debates between similarly-ranked items
- **Cross-Category (30%)** — Absurd mashups across categories for virality
- **Starred (15%)** — Recycles popular community-starred duels
- **Random (5%)** — Surfaces unseen elements, prevents filter bubbles

Anti-repeat system tracks element appearances per session with cooldown periods.

### ELO System (`lib/elo.ts`)
Chess-style rating with K-factor tiers based on participation count. Scores tracked globally and per demographic segment (sex × age bracket).
