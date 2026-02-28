/**
 * Template — page transition wrapper.
 * Uses pure CSS animation instead of Framer Motion to avoid pulling
 * ~40 KB of JS into every route's critical bundle.
 * Respects prefers-reduced-motion via the global CSS rule.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-page-in">
      {children}
    </div>
  );
}
