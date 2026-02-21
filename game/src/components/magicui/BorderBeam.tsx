'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  color?: string;
  colorFrom?: string;
  colorTo?: string;
}

export function BorderBeam({
  className = '',
  size = 200,
  duration = 12,
  delay = 0,
  colorFrom = '#EF4444',
  colorTo = '#F97316',
}: BorderBeamProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 rounded-[inherit] ${className}`}>
      <motion.div
        className="absolute inset-[-1px] rounded-[inherit]"
        style={{
          background: `conic-gradient(from var(--angle, 0deg), transparent 80%, ${colorFrom}, ${colorTo}, transparent)`,
          mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px',
        }}
        animate={{
          '--angle': ['0deg', '360deg'],
        } as any}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}
