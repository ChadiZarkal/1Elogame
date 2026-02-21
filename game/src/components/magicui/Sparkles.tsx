'use client';

import { useEffect, useRef, useState } from 'react';
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
}

export function Sparkles({ 
  children, 
  className = '',
  color = '#EF4444',
  count = 6,
}: SparklesProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const newSparkles: Sparkle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setSparkles(newSparkles);
  }, [count]);

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
            repeatDelay: Math.random() * 2 + 1,
          }}
        />
      ))}
    </span>
  );
}
