/**
 * Design Tokens — Single source of truth for the design system.
 * Used for JS-side references; CSS custom properties are the primary source.
 */

export const colors = {
  // Backgrounds
  bg: {
    primary: '#0A0A0B',
    secondary: '#111113',
    tertiary: '#1A1A1F',
    elevated: '#222228',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
  // Surfaces (cards, modals)
  surface: {
    default: '#151518',
    hover: '#1C1C21',
    active: '#242429',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(255, 255, 255, 0.12)',
  },
  // Text
  text: {
    primary: '#F5F5F7',
    secondary: '#A1A1AA',
    muted: '#71717A',
    inverse: '#0A0A0B',
  },
  // Brand / Accent
  accent: {
    red: '#EF4444',
    redGlow: 'rgba(239, 68, 68, 0.35)',
    redSoft: 'rgba(239, 68, 68, 0.12)',
    green: '#10B981',
    greenGlow: 'rgba(16, 185, 129, 0.35)',
    greenSoft: 'rgba(16, 185, 129, 0.12)',
    gold: '#F59E0B',
    goldGlow: 'rgba(245, 158, 11, 0.35)',
    goldSoft: 'rgba(245, 158, 11, 0.12)',
    purple: '#8B5CF6',
    purpleGlow: 'rgba(139, 92, 246, 0.35)',
    purpleSoft: 'rgba(139, 92, 246, 0.12)',
    blue: '#3B82F6',
    blueSoft: 'rgba(59, 130, 246, 0.12)',
  },
  // Gradients
  gradient: {
    redToOrange: 'linear-gradient(135deg, #EF4444, #F97316)',
    purpleToBlue: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
    goldToAmber: 'linear-gradient(135deg, #F59E0B, #D97706)',
    darkOverlay: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.8))',
    radialGlow: 'radial-gradient(circle at 50% 0%, rgba(239,68,68,0.08) 0%, transparent 60%)',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  '4xl': '64px',
} as const;

export const radii = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  full: '9999px',
} as const;

export const typography = {
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    display: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.625,
  },
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 12px rgba(0, 0, 0, 0.4)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.6)',
  glow: {
    red: '0 0 30px rgba(239, 68, 68, 0.3), 0 0 60px rgba(239, 68, 68, 0.1)',
    green: '0 0 30px rgba(16, 185, 129, 0.3), 0 0 60px rgba(16, 185, 129, 0.1)',
    gold: '0 0 30px rgba(245, 158, 11, 0.3), 0 0 60px rgba(245, 158, 11, 0.1)',
    purple: '0 0 30px rgba(139, 92, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.1)',
  },
} as const;

export const transitions = {
  fast: '150ms cubic-bezier(0.25, 0.1, 0.25, 1)',
  normal: '250ms cubic-bezier(0.25, 0.1, 0.25, 1)',
  slow: '400ms cubic-bezier(0.25, 0.1, 0.25, 1)',
  spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  toast: 60,
} as const;
