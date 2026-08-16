'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Pied de page présent sur toutes les routes publiques.
 *
 * Deux rôles :
 * - rendre les pages légales atteignables depuis n'importe où (un examinateur
 *   arrivant sur /jeu doit pouvoir trouver la politique de confidentialité) ;
 * - fournir une navigation en liens texte vers les pages de contenu, que le
 *   carrousel à swipe de l'accueil ne permet pas d'explorer.
 *
 * Il est placé après le contenu : sur les écrans de jeu il reste sous la ligne
 * de flottaison et ne perturbe pas le parcours.
 */
const HIDDEN_PATHS = [/^\/admin(\/|$)/, /^\/dixmais\/admin(\/|$)/];

const NAV_GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Les jeux',
    links: [
      { href: '/jeu', label: 'Red or Green Duel' },
      { href: '/dixmais', label: "C'est un 10 mais..." },
      { href: '/flagornot', label: 'Oracle IA' },
      { href: '/flashflag', label: 'Flash Flag' },
    ],
  },
  {
    title: 'Comprendre',
    links: [
      { href: '/guide', label: 'Guide des flags' },
      { href: '/classement', label: 'Classement des red flags' },
      { href: '/observatoire', label: "L'Observatoire" },
      { href: '/ressources', label: "Outils d'auto-évaluation" },
      { href: '/ressources/violentometre', label: 'Violentomètre' },
    ],
  },
];

const LEGAL_LINKS = [
  { href: '/a-propos', label: 'À propos' },
  { href: '/methodologie', label: 'Méthodologie' },
  { href: '/sources', label: 'Sources' },
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/confidentialite', label: 'Confidentialité' },
  { href: '/cgu', label: 'CGU' },
];

export function SiteFooter() {
  const pathname = usePathname() ?? '';
  if (HIDDEN_PATHS.some((re) => re.test(pathname))) return null;

  return (
    <footer className="relative z-20 w-full border-t border-white/6 bg-black/60 px-5 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <nav aria-label="Navigation du site" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#5C5C5F]">
                {group.title}
              </h2>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[12px] font-semibold text-[#A6A6A6] transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#5C5C5F]">
              Le site
            </h2>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[12px] font-semibold text-[#A6A6A6] transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {/* Le contact n'était joignable que depuis le corps de quatre
                  pages : un examinateur qui cherche comment nous écrire doit le
                  trouver depuis n'importe quelle route. */}
              <li>
                <a
                  href="mailto:contact@redorgreen.fr"
                  className="text-[12px] font-semibold text-[#A6A6A6] transition-colors hover:text-white"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <p className="mt-8 text-[10px] text-[#5C5C5F]">
          RED OR GREEN © 2026 • POUR REPÉRER LES TOXICITÉS ORDINAIRES
        </p>
      </div>
    </footer>
  );
}
