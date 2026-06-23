# 🧪 Guide des Tests — Red Flag Games

## Vue d'ensemble

Le projet utilise **Vitest 4.0.18** avec **@testing-library/react** dans un environnement **jsdom**.

- **Nouveaux tests Flash Flag** : helpers, validations, routes API, smoke E2E
- **Couverture étendue** : duel + oracle + flashflag
- **100% de passage**

---

## Configuration

### Fichier de setup : `src/test/setup.tsx`

Le setup global mock :
- **framer-motion** : `motion.*` → éléments HTML natifs, `AnimatePresence` → passthrough, `useMotionValue`/`useTransform` → valeurs simples
- **next/navigation** : `useRouter`, `usePathname`, `useSearchParams`
- **next/link** → `<a>` natif
- **localStorage / sessionStorage** → in-memory
- **matchMedia** → mock
- **IntersectionObserver** → mock

### Configuration Vitest : `vitest.config.ts`

```ts
{
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.tsx'],
  alias: { '@/*': './src/*' }
}
```

---

## Patterns de test

### 1. Tests de modules lib (unitaires)

```ts
import { myFunction } from '@/lib/myModule';

describe('myFunction', () => {
  it('fait X', () => {
    expect(myFunction(input)).toBe(expected);
  });
});
```

### 2. Tests de routes API

Pattern avec `vi.resetModules()` pour tester les deux modes (mock/prod) :

```ts
async function importRoute() {
  vi.resetModules();
  const mod = await import('@/app/api/myroute/route');
  return mod;
}

it('mode mock', async () => {
  process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
  const { GET } = await importRoute();
  const res = await GET(new Request('http://localhost/api/myroute'));
  const json = await res.json();
  expect(json.success).toBe(true);
});
```

Exemples Flash Flag ajoutés:
- `src/app/api/__tests__/flashflag-tests.test.ts`
- `src/app/api/__tests__/flashflag-session-create.test.ts`
- `src/app/api/__tests__/flashflag-session-submit.test.ts`
- `src/app/api/__tests__/admin-flashflag.test.ts`
- `src/app/api/__tests__/admin-flashflag-id.test.ts`

### 3. Tests de composants

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '@/components/ui/MyComponent';

it('renders correctly', () => {
  render(<MyComponent prop="value" />);
  expect(screen.getByText('Expected text')).toBeDefined();
});
```

### 4. Tests de hooks

```ts
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '@/lib/hooks';

it('returns initial state', () => {
  const { result } = renderHook(() => useMyHook());
  expect(result.current.value).toBe(initial);
});
```

### 5. Tests avec VertexAI/Gemini

Utiliser `vi.hoisted()` pour les mocks stables :

```ts
const { mockGenerate } = vi.hoisted(() => ({
  mockGenerate: vi.fn(),
}));

vi.mock('@google-cloud/vertexai', () => ({
  VertexAI: class { getGenerativeModel() { return { generateContent: mockGenerate }; } },
}));
```

---

## Lancer les tests

```bash
# Tous les tests
npx vitest run

# Tests spécifiques
npx vitest run src/lib/__tests__/
npx vitest run src/app/api/__tests__/
npx vitest run src/components/

# Mode watch
npx vitest

# Avec couverture
npx vitest run --coverage

# E2E (config dédiée)
npx vitest run --config vitest.e2e.config.ts
```

---

## Pièges connus

| Piège | Solution |
|-------|----------|
| `vi.mock('fs')` échoue | Utiliser `vi.mock(import('fs'))` avec `default: actual` |
| `vi.fn().mockImplementation()` pour constructeur | Utiliser class-based mock |
| `vi.resetModules()` perd les refs mock | Utiliser `vi.hoisted()` |
| Categories: 'love' n'existe pas | Utiliser 'sexe', 'lifestyle', 'quotidien', 'bureau' |
| `useMotionValue` rend objet | Mock dans setup.tsx retourne valeur simple |
| Input contrôlé: `fireEvent.change` | Fonctionne si React gère le state correctement |
