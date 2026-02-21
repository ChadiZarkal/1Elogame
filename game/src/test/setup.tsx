import '@testing-library/jest-dom/vitest';

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Clear storages between tests
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    // Mock useMotionValue / useTransform to return plain values (not MotionValue objects)
    useMotionValue: (initial: number) => initial,
    useTransform: (_value: unknown, fn?: (v: number) => string) => (fn ? fn(0) : '0'),
    animate: vi.fn(() => ({ stop: vi.fn() })),
    motion: new Proxy(actual.motion, {
      get: (target, prop) => {
        if (typeof prop === 'string' && ['div', 'span', 'button', 'p', 'h1', 'h2', 'h3', 'a', 'section', 'ul', 'li'].includes(prop)) {
          return (props: Record<string, unknown>) => {
            const { initial, animate, exit, whileHover, whileTap, transition, variants, layout, layoutId, ...rest } = props;
            const Tag = prop as keyof JSX.IntrinsicElements;
            // @ts-expect-error dynamic tag
            return <Tag {...rest} />;
          };
        }
        return Reflect.get(target, prop);
      },
    }),
  };
});
