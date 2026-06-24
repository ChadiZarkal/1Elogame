'use client';

import { motion } from 'framer-motion';

interface SparklesProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  count?: number;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  repeatDelay: number;
}

function deterministicUnit(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export function Sparkles({ 
  children, 
  className = '',
  color = '#EF4444',
  count = 6,
}: SparklesProps) {
  const sparkles: Sparkle[] = Array.from({ length: count }, (_, i) => {
    const base = i + 1;
    return {
      id: i,
      x: deterministicUnit(base * 11) * 100,
      y: deterministicUnit(base * 17) * 100,
      size: deterministicUnit(base * 23) * 3 + 2,
      delay: deterministicUnit(base * 29) * 2,
      repeatDelay: deterministicUnit(base * 31) * 2 + 1,
    };
  });

  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      {sparkles.map((sparkle) => (
        <motion.span
          key={sparkle.id}
          className="absolute pointer-events-none"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
            borderRadius: '50%',
            backgroundColor: color,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            delay: sparkle.delay,
            repeat: Infinity,
            repeatDelay: sparkle.repeatDelay,
          }}
        />
      ))}
    </span>
  );
}
