import Link from 'next/link';

/**
 * Page 404.
 *
 * Ni `'use client'` ni Framer Motion : c'est la page qu'on atteint depuis un
 * lien mort d'indexation ou sur une connexion dégradée, et elle chargeait
 * quelque quarante kilooctets de JavaScript pour une entrée en fondu et deux
 * effets d'appui. `globals.css` fournit déjà `animate-fade-slide-up`, et les
 * liens portent leur propre `active:scale`. `template.tsx` documente cet
 * arbitrage et l'applique partout ailleurs — la 404 était l'oubli.
 */
export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex flex-col items-center justify-center min-h-[calc(100dvh-var(--header-h,3rem))] bg-[#0D0D0D] p-6"
    >
      <div className="text-center space-y-6 max-w-md animate-fade-slide-up">
        <div className="text-8xl">🚩</div>
        <h1 className="text-5xl font-black text-[#F5F5F5]">404</h1>
        <p className="text-[#A3A3A3] text-lg">
          Oups, cette page n&apos;existe pas...
          <br />
          <span className="text-[#737373] text-sm">C&apos;est un vrai Red Flag de se perdre ici.</span>
        </p>

        <div className="flex flex-col gap-3 pt-4">
          <Link
            href="/"
            className="flex min-h-12 items-center justify-center rounded-xl bg-[#DC2626] px-8 text-lg font-bold text-white transition-all hover:bg-[#EF4444] active:scale-[0.97]"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/flagornot"
            className="flex min-h-12 items-center justify-center rounded-xl border border-[#333] bg-[#1A1A1A] px-8 font-medium text-[#A3A3A3] transition-all hover:border-[#059669] hover:text-[#059669] active:scale-[0.97]"
          >
            Essaye l&apos;Oracle
          </Link>
        </div>
      </div>
    </main>
  );
}
