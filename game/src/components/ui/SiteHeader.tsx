'use client';

/**
 * @module components/ui/SiteHeader
 * Barre de navigation, présente sur toutes les routes publiques.
 *
 * Le site n'en avait aucune : la seule navigation en liens texte était le pied
 * de page, et le choix d'un jeu passait par un carrousel à glissement qu'aucun
 * robot ne parcourt. Sur les écrans de jeu, qui occupent toute la fenêtre, il
 * n'existait littéralement aucun chemin visible vers le reste du site.
 *
 * Elle est *statique* et non collante : les écrans de jeu sont dimensionnés en
 * `calc(100dvh - 3rem)` pour lui laisser sa place, et une barre qui suivrait le
 * défilement mangerait cette hauteur une seconde fois sur les petits écrans.
 *
 * Le panneau est un `<details>` : il s'ouvre sans JavaScript, et son contenu
 * est présent dans le HTML même fermé — la navigation reste donc explorable.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

const HIDDEN_PATHS = [/^\/admin(\/|$)/, /^\/dixmais\/admin(\/|$)/];

/** Groupée par thème, comme le demandent les consignes de qualité. */
export const NAV_SECTIONS: {
  title: string;
  links: { href: string; label: string }[];
}[] = [
  {
    title: 'Jouer',
    links: [
      { href: '/jeu', label: 'Le pire des deux' },
      { href: '/dixmais', label: "C'est un 10 mais…" },
      { href: '/flagornot', label: "L'Oracle" },
      { href: '/flashflag', label: 'Flash Flag' },
    ],
  },
  {
    title: 'Comprendre',
    links: [
      { href: '/guide', label: 'Guide des flags' },
      { href: '/classement', label: 'Classement' },
      { href: '/observatoire', label: 'Observatoire' },
      { href: '/methodologie', label: 'Méthodologie' },
    ],
  },
  {
    title: "S'évaluer",
    links: [
      { href: '/ressources', label: 'Tous les outils' },
      { href: '/ressources/violentometre', label: 'Violentomètre' },
      { href: '/ressources/consentometre', label: 'Consentomètre' },
      { href: '/ressources/incestometre', label: 'Incestomètre' },
      { href: '/ressources/harcelometre', label: 'Harcèlomètre' },
      { href: '/ressources/discriminometre', label: 'Discriminomètre' },
    ],
  },
  {
    title: 'Le site',
    links: [
      { href: '/a-propos', label: 'À propos' },
      { href: '/sources', label: 'Sources' },
      { href: '/mentions-legales', label: 'Mentions légales' },
      { href: '/confidentialite', label: 'Confidentialité' },
    ],
  },
];

/** Raccourcis affichés à plat dès qu'il y a la place. */
const INLINE = [
  { href: '/jeu', label: 'Jouer' },
  { href: '/guide', label: 'Guide' },
  { href: '/classement', label: 'Classement' },
  { href: '/ressources', label: 'Outils' },
];

export function SiteHeader() {
  const pathname = usePathname() ?? '';
  if (HIDDEN_PATHS.some((re) => re.test(pathname))) return null;

  const isCurrent = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link href="/" className="site-header__brand" aria-label="Red or Green — accueil">
          RED<span>OR</span>GREEN
        </Link>

        <nav className="site-header__inline" aria-label="Navigation principale">
          {INLINE.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isCurrent(l.href) ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <details className="site-header__menu">
          <summary aria-label="Ouvrir le menu de navigation">
            <Menu size={16} aria-hidden />
            <span>Menu</span>
          </summary>
          <div className="site-header__panel">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title}>
                <h2>{section.title}</h2>
                <ul>
                  {section.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} aria-current={isCurrent(l.href) ? 'page' : undefined}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      </div>
    </header>
  );
}
