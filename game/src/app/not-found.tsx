'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen min-h-[100dvh] bg-[#0D0D0D] p-6">
      <motion.div
        className="text-center space-y-6 max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-8xl">🚩</div>
        <h1 className="text-5xl font-black text-[#F5F5F5]">404</h1>
        <p className="text-[#A3A3A3] text-lg">
          Oups, cette page n&apos;existe pas...
          <br />
          <span className="text-[#737373] text-sm">C&apos;est un vrai Red Flag de se perdre ici.</span>
        </p>

        <div className="flex flex-col gap-3 pt-4">
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link
              href="/"
              className="px-8 py-3 rounded-xl bg-[#DC2626] text-white font-bold text-lg hover:bg-[#EF4444] transition-colors text-center block"
            >
              Retour à l&apos;accueil
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link
              href="/flagornot"
              className="px-8 py-3 rounded-xl bg-[#1A1A1A] border border-[#333] text-[#A3A3A3] font-medium hover:border-[#059669] hover:text-[#059669] transition-all text-center block"
            >
              Essaye l&apos;Oracle
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
