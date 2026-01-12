# 🚀 Deployment Design - Red or Green Game

> **Deployment strategy and infrastructure**

---

## 📋 General Information

| Attribute | Value |
|-----------|-------|
| **Environments** | Development, Production |
| **Hosting Provider** | Vercel (Hobby tier) |
| **Database Provider** | Supabase (Free tier) |
| **CI/CD** | Vercel Git Integration |
| **Domain** | TBD (Vercel subdomain for MVP) |

---

## 🏗️ Infrastructure Overview

### Simple Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                             INTERNET                                     │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE NETWORK                               │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  CDN (Global)          │  Edge Functions        │  SSL/TLS      │    │
│  │  • Static assets       │  • Middleware          │  • Auto HTTPS │    │
│  │  • HTML/JS/CSS         │  • Auth checks         │  • TLS 1.3    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                  │                                       │
│                                  ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    VERCEL SERVERLESS                             │    │
│  │  ┌──────────────────────────────────────────────────────────┐   │    │
│  │  │               NEXT.JS APPLICATION                         │   │    │
│  │  │                                                           │   │    │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │   │    │
│  │  │  │  Frontend   │  │  API Routes │  │   Admin     │       │   │    │
│  │  │  │  (React)    │  │  (vote,     │  │  Dashboard  │       │   │    │
│  │  │  │             │  │  feedback)  │  │             │       │   │    │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘       │   │    │
│  │  └──────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                  │                                       │
└──────────────────────────────────┼───────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE                                       │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  PostgreSQL (Managed)        │  Auth                            │    │
│  │  • elements table            │  • Admin JWT                     │    │
│  │  • votes table               │  • Session management            │    │
│  │  • duel_feedback table       │                                  │    │
│  │  • RLS policies              │                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🌍 Environments

### Configuration by Environment

| Aspect | Development | Production |
|--------|-------------|------------|
| **URL** | localhost:3000 | redorgreen.vercel.app |
| **Database** | Supabase (same project) | Supabase (same project) |
| **Build Mode** | Development | Production |
| **Logging** | Console (verbose) | Vercel Analytics |
| **Caching** | Disabled | Enabled |
| **HTTPS** | Optional | Automatic |

### Why Single Database?

For MVP with ~15 users, a single Supabase project is sufficient:
- Simplifies deployment
- Zero cost
- Easy data management
- No sync issues

---

## ⚙️ Environment Variables

### Local Development (.env.local)

```bash
# .env.local (NEVER commit this file)

# Public variables (safe for client)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server-side only (secret)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel Production

Set in Vercel Dashboard → Settings → Environment Variables:

| Variable | Type | Environments |
|----------|------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Plain | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Plain | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Production only |
| `NEXT_PUBLIC_APP_URL` | Plain | Production |

---

## � Build Configuration

### package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict mode for development
  reactStrictMode: true,
  
  // TypeScript strict
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint on build
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Optimizations
  swcMinify: true,
  
  // Image optimization (if needed)
  images: {
    unoptimized: true, // No external images in MVP
  },
};

module.exports = nextConfig;
```

### vercel.json

```json
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
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

---

## 🚀 Deployment Flow

### Git-Based Deployment

```
Developer         GitHub              Vercel
    │                │                   │
    │── git push ───▶│                   │
    │                │── webhook ───────▶│
    │                │                   │── install dependencies
    │                │                   │── run build
    │                │                   │── run lint + type-check
    │                │                   │── deploy to edge
    │                │                   │
    │◀── Deployment URL ─────────────────│
    │                │                   │
```

### Branch Strategy

| Branch | Deployment | URL |
|--------|------------|-----|
| `main` | Production | redorgreen.vercel.app |
| `develop` | Preview | redorgreen-xxx-username.vercel.app |
| Feature branches | Preview | redorgreen-branch-xxx.vercel.app |

---

## 🔧 Vercel Setup Steps

### 1. Initial Setup

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Link project
vercel link
```

### 2. Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import from GitHub
4. Select repository
5. Configure:
   - Framework: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3. Set Environment Variables

1. Go to Project → Settings → Environment Variables
2. Add each variable with appropriate environments
3. Mark `SUPABASE_SERVICE_ROLE_KEY` as secret

### 4. Deploy

```bash
# Automatic on push to main
git push origin main

# Or manual deployment
vercel --prod
```

---

## 🗄️ Database Deployment (Supabase)

### 1. Create Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project
3. Choose region: West EU (Paris)
4. Save password securely

### 2. Run Migrations

```sql
-- Execute in Supabase SQL Editor

-- 1. Create elements table
CREATE TABLE elements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  texte VARCHAR(200) NOT NULL,
  categorie VARCHAR(50) NOT NULL CHECK (categorie IN ('metier', 'comportement', 'trait', 'preference', 'absurde')),
  niveau_provocation INTEGER NOT NULL DEFAULT 2 CHECK (niveau_provocation BETWEEN 1 AND 4),
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
  actif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create votes table
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  element_gagnant_id UUID NOT NULL REFERENCES elements(id),
  element_perdant_id UUID NOT NULL REFERENCES elements(id),
  sexe_votant VARCHAR(20) NOT NULL,
  age_votant VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create duel_feedback table
CREATE TABLE duel_feedback (
  element_a_id UUID NOT NULL REFERENCES elements(id),
  element_b_id UUID NOT NULL REFERENCES elements(id),
  stars_count INTEGER NOT NULL DEFAULT 0,
  thumbs_up_count INTEGER NOT NULL DEFAULT 0,
  thumbs_down_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (element_a_id, element_b_id)
);

-- 4. Create indexes
CREATE INDEX idx_elements_actif ON elements(actif);
CREATE INDEX idx_elements_elo ON elements(elo_global);
CREATE INDEX idx_votes_created ON votes(created_at);
CREATE INDEX idx_feedback_stars ON duel_feedback(stars_count);

-- 5. Enable RLS
ALTER TABLE elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE duel_feedback ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
CREATE POLICY "Public read active elements" ON elements 
  FOR SELECT USING (actif = true);

CREATE POLICY "Auth manage elements" ON elements 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can vote" ON votes 
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Auth read votes" ON votes 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can give feedback" ON duel_feedback 
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone update feedback" ON duel_feedback 
  FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Anyone read feedback" ON duel_feedback 
  FOR SELECT USING (true);
```

### 3. Create Admin User

```sql
-- In Supabase Auth Dashboard:
-- 1. Go to Authentication → Users
-- 2. Click "Add User"
-- 3. Set email: admin@redorgreen.app
-- 4. Set strong password
-- 5. Click "Create User"
```

### 4. Get API Keys

1. Go to Settings → API
2. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 📊 Monitoring

### Vercel Analytics (Built-in)

Vercel provides free analytics for:
- Page views
- Web Vitals (LCP, FID, CLS)
- Geographic distribution
- Device breakdown

**No additional setup required.**

### Supabase Dashboard

Monitor in Supabase Dashboard:
- Database connections
- Query performance
- Storage usage
- Auth logs

### Manual Logging

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      ...data,
      timestamp: new Date().toISOString(),
    }));
  },
  error: (message: string, error?: Error) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
    }));
  },
};
```

---

## 🔄 Rollback Strategy

### Vercel Instant Rollback

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

### Database Rollback

For MVP, manual intervention:
1. Identify issue in Supabase logs
2. Execute corrective SQL
3. If critical, restore from Supabase daily backup

---

## 📝 Deployment Checklist

### Pre-Deployment

- [ ] All tests pass locally
- [ ] TypeScript has no errors (`npm run type-check`)
- [ ] ESLint has no errors (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables set in Vercel
- [ ] Database schema is up to date
- [ ] RLS policies are enabled

### Post-Deployment

- [ ] Verify app loads at production URL
- [ ] Test voting flow
- [ ] Test admin login
- [ ] Check Vercel function logs for errors
- [ ] Verify Supabase connections

---

## 🔧 Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Build fails | Type errors | Run `npm run type-check` locally |
| 500 on API routes | Missing env vars | Check Vercel env variables |
| Database connection refused | Wrong URL | Verify `SUPABASE_URL` |
| Admin login fails | Wrong credentials | Reset in Supabase Auth |
| Slow cold starts | Normal for serverless | Acceptable for MVP |

### Logs Location

- **Vercel Logs**: Dashboard → Project → Logs
- **Supabase Logs**: Dashboard → Database → Logs

---

## 💰 Cost Analysis

### Vercel (Hobby Tier - Free)

| Resource | Limit | Usage |
|----------|-------|-------|
| Bandwidth | 100 GB/month | ~1 GB estimated |
| Serverless | 100 GB-hours | ~5 GB-hours estimated |
| Builds | Unlimited | ~10/week |
| Projects | 1 production domain | 1 |

### Supabase (Free Tier)

| Resource | Limit | Usage |
|----------|-------|-------|
| Database | 500 MB | ~10 MB estimated |
| Auth Users | 50,000 | 1 (admin) |
| Edge Functions | 500,000/month | 0 (not used) |
| Storage | 1 GB | 0 (not used) |

**Total Cost: $0/month**

---

🚦 **Gate:** Deployment must be validated before production release.
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### Service & Ingress

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  selector:
    app: api-server
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - api.example.com
      secretName: api-tls
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 80
```

### Auto-Scaling

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-server
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, staging]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linter
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image_tag: ${{ steps.meta.outputs.tags }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=
            type=ref,event=branch
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to Staging
        uses: azure/k8s-deploy@v4
        with:
          namespace: staging
          manifests: |
            k8s/staging/
          images: |
            ${{ needs.build.outputs.image_tag }}

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to Production
        uses: azure/k8s-deploy@v4
        with:
          namespace: production
          manifests: |
            k8s/production/
          images: |
            ${{ needs.build.outputs.image_tag }}
          strategy: canary
          percentage: 20
```

---

## 📊 Monitoring & Observability

### Health Checks

```typescript
// health.controller.ts
@Controller()
export class HealthController {
  @Get('/health')
  async healthCheck(): Promise<HealthStatus> {
    return { status: 'healthy' };
  }

  @Get('/ready')
  async readinessCheck(): Promise<ReadinessStatus> {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkExternalServices(),
    ]);

    const allHealthy = checks.every(c => c.healthy);
    
    return {
      status: allHealthy ? 'ready' : 'not_ready',
      checks,
    };
  }
}
```

### Logging

```typescript
// Configuration centralisée
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME,
    version: process.env.APP_VERSION,
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console(),
    new WinstonCloudWatch({
      logGroupName: `/app/${process.env.NODE_ENV}`,
      logStreamName: process.env.HOSTNAME,
    }),
  ],
});
```

### Metrics

```typescript
// Prometheus metrics
import { Counter, Histogram, Registry } from 'prom-client';

const register = new Registry();

// Request metrics
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
});

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
```

---

## 🔁 Deployment Strategies

### Blue-Green Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                        Load Balancer                             │
│                            │                                     │
│              ┌─────────────┼─────────────┐                       │
│              │                           │                       │
│              ▼                           ▼                       │
│     ┌─────────────────┐         ┌─────────────────┐             │
│     │   BLUE (v1.0)   │         │  GREEN (v1.1)   │             │
│     │   [ACTIVE]      │         │   [STANDBY]     │             │
│     │   100% traffic  │         │    0% traffic   │             │
│     └─────────────────┘         └─────────────────┘             │
│                                                                  │
│  1. Deploy new version to GREEN                                  │
│  2. Run smoke tests on GREEN                                     │
│  3. Switch traffic to GREEN                                      │
│  4. Monitor for issues                                           │
│  5. If OK: terminate BLUE, else: rollback                        │
└─────────────────────────────────────────────────────────────────┘
```

### Canary Deployment

```yaml
# Istio VirtualService pour canary
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: api-canary
spec:
  hosts:
    - api.example.com
  http:
    - match:
        - headers:
            x-canary:
              exact: "true"
      route:
        - destination:
            host: api-canary
            port:
              number: 80
    - route:
        - destination:
            host: api-stable
            port:
              number: 80
          weight: 90
        - destination:
            host: api-canary
            port:
              number: 80
          weight: 10
```

---

## 🔙 Rollback Strategy

### Procédure de Rollback

```bash
#!/bin/bash
# rollback.sh

# Récupérer la version précédente
PREVIOUS_VERSION=$(kubectl rollout history deployment/api-server | tail -2 | head -1 | awk '{print $1}')

# Rollback
kubectl rollout undo deployment/api-server --to-revision=$PREVIOUS_VERSION

# Vérifier le statut
kubectl rollout status deployment/api-server

# Notifier
curl -X POST $SLACK_WEBHOOK -d "{
  \"text\": \"🔙 Rollback to revision $PREVIOUS_VERSION completed\"
}"
```

### Database Migrations

```typescript
// Migrations réversibles uniquement
export class AddUserAvatarColumn1234567890 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', new TableColumn({
      name: 'avatar_url',
      type: 'varchar',
      isNullable: true,
    }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'avatar_url');
  }
}
```

---

## ✅ Deployment Checklist

### Avant Déploiement

- [ ] Tous les tests passent
- [ ] Code review approuvée
- [ ] Migrations testées (up + down)
- [ ] Variables d'environnement configurées
- [ ] Secrets mis à jour si nécessaire
- [ ] Changelog mis à jour

### Pendant Déploiement

- [ ] Monitoring actif
- [ ] Équipe on-call notifiée
- [ ] Canary/Blue-green en cours

### Après Déploiement

- [ ] Smoke tests passés
- [ ] Métriques normales
- [ ] Pas d'erreurs dans les logs
- [ ] Tag de release créé

---

🚦 **Gate:** Le déploiement en production nécessite l'approbation d'un reviewer et le passage de tous les tests automatisés.
