# 🔒 Security Design - Red or Green Game

> **Security architecture and practices**

---

## 📌 Security Principles

### Foundational Principles

| Principle | Description | Application |
|-----------|-------------|-------------|
| **Simplicity** | Simple systems have fewer vulnerabilities | Minimal stack, no complex auth |
| **Privacy First** | No PII collection | Only sex/age (non-identifying) |
| **Defense in Depth** | Multiple protection layers | Vercel + Supabase + Validation |
| **Secure by Default** | Safe configuration out of box | HTTPS, RLS, strict TypeScript |
| **Least Privilege** | Minimal permissions | Anon key for public, service key for admin |

---

## 🏗️ Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET                                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   VERCEL EDGE NETWORK                            │
│  • Automatic HTTPS (TLS 1.3)                                     │
│  • DDoS Protection                                               │
│  • Edge Caching                                                  │
│  • Geographic Distribution                                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   NEXT.JS APPLICATION                            │
│  • Input Validation (Zod)                                        │
│  • Admin Route Protection (Middleware)                           │
│  • CSRF Protection (default)                                     │
│  • Security Headers                                              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SUPABASE                                       │
│  • Row Level Security (RLS)                                      │
│  • Parameterized Queries (SQL Injection protection)              │
│  • Connection Pooling (PgBouncer)                                │
│  • Encryption at Rest                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication

### Strategy: Admin-Only Authentication

The Red or Green Game uses **anonymous voting** for players. Only admin functions require authentication.

```
PLAYERS           ADMIN
   │                 │
   │ (No auth)       │ (JWT auth)
   ▼                 ▼
┌─────────┐    ┌─────────────┐
│ Public  │    │   Admin     │
│ Routes  │    │   Routes    │
│         │    │             │
│ /api/   │    │ /api/admin/ │
│ vote    │    │ elements    │
│ duel    │    │ stats       │
│ feedback│    │ export      │
└─────────┘    └─────────────┘
```

### Admin Authentication Flow

```typescript
// Supabase Auth for Admin
import { createClient } from '@supabase/supabase-js';

// 1. Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@redorgreen.app',
  password: process.env.ADMIN_PASSWORD,
});

// 2. Get JWT
const token = data.session.access_token;

// 3. Use in API requests
fetch('/api/admin/elements', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### JWT Configuration

| Aspect | Value |
|--------|-------|
| Algorithm | HS256 (Supabase default) |
| Expiration | 24 hours |
| Issuer | Supabase |
| Storage | LocalStorage (admin dashboard) |

### Admin Middleware

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Only protect /admin and /api/admin routes
  if (req.nextUrl.pathname.startsWith('/admin') || 
      req.nextUrl.pathname.startsWith('/api/admin')) {
    
    const supabase = createMiddlewareClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED' } },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }
  
  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
```

---

## �️ Input Validation

### Zod Schemas

All API inputs are validated with Zod schemas:

```typescript
// lib/schemas.ts
import { z } from 'zod';

// Vote schema
export const voteSchema = z.object({
  winnerId: z.string().uuid('Invalid winner ID'),
  loserId: z.string().uuid('Invalid loser ID'),
  sexe: z.enum(['homme', 'femme', 'nonbinaire', 'autre'], {
    errorMap: () => ({ message: 'Invalid sex value' }),
  }),
  age: z.enum(['16-18', '19-22', '23-26', '27+'], {
    errorMap: () => ({ message: 'Invalid age value' }),
  }),
}).refine(data => data.winnerId !== data.loserId, {
  message: 'Winner and loser must be different',
});

// Feedback schema
export const feedbackSchema = z.object({
  elementAId: z.string().uuid(),
  elementBId: z.string().uuid(),
  type: z.enum(['star', 'thumbs_up', 'thumbs_down']),
});

// Element create schema (admin)
export const elementCreateSchema = z.object({
  texte: z.string().min(3).max(200),
  categorie: z.enum(['metier', 'comportement', 'trait', 'preference', 'absurde']),
  niveau_provocation: z.number().int().min(1).max(4).default(2),
});
```

### Validation Middleware Pattern

```typescript
// In API route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = voteSchema.parse(body);
    
    // Proceed with validated data...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          details: error.errors,
        },
      }, { status: 400 });
    }
    throw error;
  }
}
```

---

## 🔒 Database Security

### Supabase Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE duel_feedback ENABLE ROW LEVEL SECURITY;

-- ELEMENTS: Public can read active, only auth can write
CREATE POLICY "Public read active elements"
  ON elements FOR SELECT
  USING (actif = true);

CREATE POLICY "Auth users can manage elements"
  ON elements FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- VOTES: Anyone can insert, no one can read/update/delete
CREATE POLICY "Anyone can vote"
  ON votes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No SELECT policy = votes are write-only for players
CREATE POLICY "Auth can read votes"
  ON votes FOR SELECT
  TO authenticated
  USING (true);

-- FEEDBACK: Anyone can insert/update
CREATE POLICY "Anyone can give feedback"
  ON duel_feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update feedback"
  ON duel_feedback FOR UPDATE
  TO anon, authenticated
  USING (true);
```

### SQL Injection Prevention

Supabase client uses parameterized queries by default:

```typescript
// SAFE: Parameterized query
const { data } = await supabase
  .from('elements')
  .select('*')
  .eq('id', winnerId); // Properly escaped

// NEVER do this:
// const { data } = await supabase
//   .from('elements')
//   .select('*')
//   .filter(`id = '${userInput}'`); // VULNERABLE!
```

---

## � Security Headers

### Vercel Configuration

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    }
  ]
}
```

### Content Security Policy

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // For Next.js
      "style-src 'self' 'unsafe-inline'", // For Tailwind
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];
```

---

## 🔏 Data Privacy

### No PII Collection

The Red or Green Game collects **zero personally identifiable information**:

| Data Collected | PII Status | Purpose |
|----------------|------------|---------|
| Sex (4 options) | ❌ Not PII | Segmented ELO |
| Age (4 ranges) | ❌ Not PII | Segmented ELO |
| Vote choices | ❌ Not PII | Game mechanics |
| Feedback | ❌ Not PII | Quality metrics |

### What We DON'T Collect

- ❌ Names
- ❌ Email addresses
- ❌ Phone numbers
- ❌ IP addresses (not stored)
- ❌ Device identifiers
- ❌ Location data
- ❌ Cookies for tracking

### Data Retention

| Data | Retention | Reason |
|------|-----------|--------|
| Votes | Indefinite | Core game data |
| Elements | Indefinite | Content database |
| Feedback | Indefinite | Quality metrics |
| Admin sessions | 24 hours | JWT expiration |

---

## 🚨 Security Checklist

### Pre-Launch

- [ ] Supabase RLS policies enabled and tested
- [ ] Environment variables in Vercel (not in code)
- [ ] Admin password is strong (>16 chars, random)
- [ ] HTTPS verified (automatic on Vercel)
- [ ] Security headers configured
- [ ] Zod validation on all endpoints
- [ ] No sensitive data in client-side code
- [ ] Service role key only in server-side code

### Post-Launch

- [ ] Monitor Supabase logs for anomalies
- [ ] Review Vercel analytics for unusual traffic
- [ ] Rotate admin password periodically
- [ ] Keep dependencies updated

---

## 🔧 Environment Variables Security

### Secure Configuration

```bash
# .env.local (NEVER commit)
# Public keys (safe for client)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Secret keys (server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # DANGER: Full access
```

### Vercel Environment Variables

| Variable | Environment | Sensitivity |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Production | **Secret** |

---

## 📊 Security Threat Model

### Potential Threats & Mitigations

| Threat | Likelihood | Impact | Mitigation |
|--------|------------|--------|------------|
| Vote manipulation (bots) | Medium | Low | Rate limiting, CAPTCHA (future) |
| SQL injection | Low | High | Parameterized queries |
| XSS | Low | Medium | React escaping, CSP |
| Admin account compromise | Low | High | Strong password, 2FA (future) |
| DDoS | Medium | Medium | Vercel Edge protection |
| Data breach | Low | Low | No PII stored |

### Accepted Risks (MVP)

1. **No rate limiting on votes** - Acceptable for party game with ~15 users
2. **No CAPTCHA** - Would harm UX, low bot incentive
3. **LocalStorage for session** - No sensitive data stored
4. **Single admin account** - Sufficient for MVP

---

🚦 **Gate:** Security design must be validated before deployment. 
  authorize('users:delete'), 
  userController.delete
);
```

### Resource-Based Access Control

```typescript
// Vérifier si l'utilisateur peut accéder à une ressource spécifique
async function canAccessResource(user: User, resource: Resource): Promise<boolean> {
  // Admin peut tout faire
  if (user.role === 'admin') return true;
  
  // L'utilisateur peut accéder à ses propres ressources
  if (resource.userId === user.id) return true;
  
  // Vérifier les partages
  const share = await shareService.findShare(resource.id, user.id);
  if (share) return true;
  
  return false;
}
```

---

## 🔒 Validation et Sanitization

### Input Validation

```typescript
// validators/user.validator.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .transform(email => email.toLowerCase().trim()),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain uppercase')
    .regex(/[a-z]/, 'Password must contain lowercase')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
  
  name: z.string()
    .min(2, 'Name too short')
    .max(100, 'Name too long')
    .regex(/^[\p{L}\s'-]+$/u, 'Invalid characters in name'),
});

// Middleware de validation
export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues,
      });
    }
    req.body = result.data;
    next();
  };
}
```

### Output Encoding

```typescript
// Échapper les données avant rendu HTML
import { escape } from 'lodash';

function sanitizeForHtml(data: any): any {
  if (typeof data === 'string') {
    return escape(data);
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeForHtml);
  }
  if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, sanitizeForHtml(value)])
    );
  }
  return data;
}
```

---

## 🔑 Gestion des Secrets

### Variables d'Environnement

```bash
# NE JAMAIS commiter ces valeurs

# Database
DATABASE_URL=postgresql://user:password@host:5432/db

# JWT
JWT_ACCESS_SECRET=<random-256-bit-hex>
JWT_REFRESH_SECRET=<random-256-bit-hex>

# External Services
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG....

# Encryption
ENCRYPTION_KEY=<random-256-bit-hex>
```

### Rotation des Secrets

| Secret | Fréquence de rotation | Procédure |
|--------|----------------------|-----------|
| JWT Secrets | Trimestriel | Blue-green deployment |
| API Keys | Annuel | Generate new, deprecate old |
| DB Password | Semestriel | Coordinated update |
| Encryption Keys | Annuel | Key versioning |

---

## 🛡️ Protection OWASP Top 10

### 1. Injection (SQL, NoSQL, Command)

```typescript
// ❌ Vulnérable
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Sécurisé - Paramètres préparés
const user = await prisma.user.findUnique({
  where: { email },
});
```

### 2. Broken Authentication

```typescript
// Rate limiting sur login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives
  message: 'Too many login attempts',
});

// Délai sur échec (timing attack prevention)
async function login(email: string, password: string) {
  const user = await userRepo.findByEmail(email);
  
  // Toujours hasher même si user non trouvé (timing attack)
  const passwordToCheck = user?.passwordHash || 'dummy-hash';
  const isValid = await bcrypt.compare(password, passwordToCheck);
  
  if (!user || !isValid) {
    throw new UnauthorizedError('Invalid credentials');
  }
  
  return user;
}
```

### 3. XSS (Cross-Site Scripting)

```typescript
// Headers de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-{random}'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// React échappe automatiquement
// ❌ Dangereux
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Sécurisé
<div>{userInput}</div>
```

### 4. CSRF (Cross-Site Request Forgery)

```typescript
// Utiliser des tokens CSRF
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Vérifier Origin/Referer pour APIs
function validateOrigin(req: Request) {
  const origin = req.get('Origin') || req.get('Referer');
  const allowedOrigins = ['https://example.com'];
  
  if (!origin || !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    throw new ForbiddenError('Invalid origin');
  }
}
```

---

## 📝 Audit Logging

### Événements à Logger

```typescript
interface AuditLog {
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  details?: Record<string, unknown>;
}

// Actions à auditer
const AUDIT_ACTIONS = [
  'user.login',
  'user.logout',
  'user.password_change',
  'user.created',
  'user.deleted',
  'permission.granted',
  'permission.revoked',
  'data.export',
  'settings.changed',
];
```

### Implémentation

```typescript
// services/audit.service.ts
export class AuditService {
  async log(params: AuditLogParams): Promise<void> {
    const entry: AuditLog = {
      timestamp: new Date(),
      userId: params.userId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      status: params.status,
      details: params.details,
    };

    await this.auditRepository.create(entry);

    // Alerter sur actions sensibles
    if (this.isSensitiveAction(params.action)) {
      await this.alertService.notify(entry);
    }
  }

  private isSensitiveAction(action: string): boolean {
    return [
      'user.deleted',
      'permission.granted',
      'settings.changed',
    ].includes(action);
  }
}
```

---

## 🔐 Encryption

### At Rest

```typescript
// Chiffrement des données sensibles en base
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

export function encrypt(plaintext: string): EncryptedData {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    iv: iv.toString('hex'),
    data: encrypted,
    tag: cipher.getAuthTag().toString('hex'),
  };
}

export function decrypt(encrypted: EncryptedData): string {
  const decipher = createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(encrypted.iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(encrypted.tag, 'hex'));
  
  let decrypted = decipher.update(encrypted.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### In Transit

```yaml
# Configuration TLS
TLS_VERSION: "1.3"
CIPHER_SUITES:
  - TLS_AES_128_GCM_SHA256
  - TLS_AES_256_GCM_SHA384
  - TLS_CHACHA20_POLY1305_SHA256

# HSTS
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

## ✅ Security Checklist

### Avant Déploiement

- [ ] Tous les secrets sont dans des variables d'environnement
- [ ] HTTPS est activé et forcé
- [ ] Headers de sécurité configurés
- [ ] Rate limiting en place
- [ ] Input validation sur tous les endpoints
- [ ] Output encoding pour HTML
- [ ] CORS configuré strictement
- [ ] Audit logging activé
- [ ] Tests de sécurité exécutés

### Monitoring Continue

- [ ] Alertes sur tentatives de login échouées
- [ ] Alertes sur erreurs 4xx/5xx anormales
- [ ] Scan de vulnérabilités hebdomadaire
- [ ] Revue des dépendances (npm audit, Snyk)

---

🚦 **Gate:** La revue de sécurité est obligatoire avant tout déploiement en production.
