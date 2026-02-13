# Red or Green Game 🚩

A mobile-first party game where players vote on which of two options is the biggest "Red Flag" in dating/relationships. Features real-time ELO ranking, streak tracking, and segmented statistics by demographics.

## 🎮 Game Features

- **Duel System**: Players choose between two red flags - which one is worse?
- **ELO Ranking**: Elements are ranked using an ELO system (like chess ratings)
- **Streak Tracking**: Keep track of how often you match the majority opinion
- **Demographic Segmentation**: ELO scores tracked separately by sex and age group
- **Swipe Gestures**: Mobile-optimized with touch/swipe support
- **Smooth Animations**: 60fps Framer Motion animations

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS 3.x
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Validation**: Zod

## 📁 Project Structure

```
game/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Global styles
│   │   ├── jeu/
│   │   │   ├── page.tsx        # Profile form
│   │   │   └── jouer/
│   │   │       └── page.tsx    # Main game
│   │   ├── admin/              # Admin interface
│   │   │   ├── page.tsx        # Login
│   │   │   ├── dashboard/      # Dashboard
│   │   │   ├── elements/       # CRUD elements
│   │   │   ├── stats/          # Rankings
│   │   │   └── moderation/     # Feedback review
│   │   └── api/                # API routes
│   │       ├── duel/           # GET next duel
│   │       ├── vote/           # POST vote
│   │       ├── feedback/       # POST feedback
│   │       └── admin/          # Admin APIs
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   └── game/               # Game-specific components
│   ├── lib/                    # Utilities
│   │   ├── elo.ts              # ELO calculations
│   │   ├── algorithm.ts        # Duel selection
│   │   ├── session.ts          # LocalStorage helpers
│   │   ├── validations.ts      # Zod schemas
│   │   ├── supabase.ts         # Supabase client
│   │   ├── mockData.ts         # Mock data for development
│   │   └── utils.ts            # Helper functions
│   ├── stores/
│   │   └── gameStore.ts        # Zustand store
│   └── types/                  # TypeScript types
├── supabase/
│   └── migrations/             # SQL migrations
└── public/                     # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for production)

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd game
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   For local development (mock mode):
   ```env
   NEXT_PUBLIC_MOCK_MODE=true
   ```
   
   For production (with Supabase):
   ```env
   NEXT_PUBLIC_MOCK_MODE=false
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ADMIN_PASSWORD_HASH=$2b$10$your-hashed-password
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open the game**:
   - Game: http://localhost:3000
   - Admin: http://localhost:3000/admin (password: "admin" in mock mode)

### Database Setup (Production)

1. Create a Supabase project
2. Run the migration script:
   ```bash
   # Copy contents of supabase/migrations/001_initial_schema.sql
   # and run in Supabase SQL Editor
   ```

## 🎯 API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/duel?seenDuels=` | Get next duel pair |
| POST | `/api/vote` | Record a vote |
| POST | `/api/feedback` | Submit feedback (star/thumbs) |

### Admin (requires token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Authenticate admin |
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/elements` | List all elements |
| POST | `/api/admin/elements` | Create element |
| PATCH | `/api/admin/elements/[id]` | Update element |
| DELETE | `/api/admin/elements/[id]` | Soft delete element |

## 🎨 Design System

### Colors
- **Background**: Dark gradient (slate-900 → purple-900)
- **Red Flag**: `#ef4444` (red-500)
- **Success**: `#22c55e` (green-500)
- **Text**: White/gray scale

### Mobile-First
- Touch targets ≥ 44px
- Swipe gestures supported
- Safe area handling (notches)
- PWA-ready

## 🔧 Development

### Mock Mode

When `NEXT_PUBLIC_MOCK_MODE=true`:
- Uses in-memory data (40 sample elements)
- No database required
- Admin password: "admin"
- Great for local development/testing

### Building

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## 📊 ELO System

The game uses a modified ELO rating system:
- **Default ELO**: 1000
- **K-Factor**: 32 (standard), varies with participation count
- **Segmentation**: Separate ELO scores by sex and age group
- **Percentage Estimation**: Based on ELO difference

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub  
2. Connect to Vercel (Settings → Git → Connected repository)
3. Configure environment variables (Settings → Environment Variables)
4. Deploy!

### Environment Variables for Production on Vercel

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_MOCK_MODE` | `false` | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | ✅ Yes |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | GCP service account JSON (full object) | ⚠️ Recommended |
| `VERTEX_AI_LOCATION` | `us-central1` | Optional (default) |
| `VERTEX_AI_MODEL` | `gemini-2.0-flash-001` | Optional (default) |
| `OPENAI_API_KEY` | OpenAI API key | Optional (fallback) |
| `ADMIN_EMAIL` | Admin email | ✅ Yes |
| `ADMIN_PASSWORD_HASH` | bcrypt hash | ✅ Yes |

### Getting GCP Service Account for Gemini

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project and enable Vertex AI API
3. Service Accounts → Create → Grant "Vertex AI User" role
4. Keys → Create JSON key → Download
5. Copy entire JSON content and paste into `GOOGLE_SERVICE_ACCOUNT_JSON` env var on Vercel

⚠️ **Security**: Never commit this key to Git. Use Vercel's environment variables UI.

### Generate Admin Password Hash

```javascript
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('your-password', 10));
```

### AI Fallback Chain

The app uses this cascade for the "Flag or Not" AI feature:
1. **Gemini** (via GCP service account) — Primary
2. **OpenAI** (fallback) — If Gemini unavailable
3. **Local** (keyword-based) — If both APIs fail

Mock mode disables all AI and uses local keyword matching.

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Commit changes
4. Push and create a PR

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS.
