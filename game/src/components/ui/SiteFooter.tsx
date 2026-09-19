'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CONTACT_EMAIL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/config/contact';

/**
 * Pied de page présent sur toutes les routes publiques.
 *
 * Deux rôles :
 * - rendre les pages légales atteignables depuis n'importe où (un examinateur
 *   arrivant sur /jeu doit pouvoir trouver la politique de confidentialité) ;
 * - fournir une navigation en liens texte vers les pages de contenu, que le
 *   carrousel à swipe de l'accueil ne permet pas d'explorer.
 *
 * Il est placé après le contenu — mais « sous la ligne de flottaison » ne veut
 * pas dire « sans effet ». Ses 17 liens forment près de 600 px qui rendent le
 * document défilable sous des écrans de jeu dimensionnés à un écran pile : un
 * glissement du pouce chassait la partie hors de vue. D'où deux mesures : la
 * navigation est repliée sur mobile, et le pied de page disparaît des écrans
 * réellement immersifs, où il n'a aucun contenu à servir.
 */
const HIDDEN_PATHS = [
  /^\/admin(\/|$)/,
  /^\/dixmais\/admin(\/|$)/,
  /^\/jeu\/jouer(\/|$)/,
  /^\/flashflag\/session(\/|$)/,
  /* Le test tient dans un écran, mesureur ancré en bas compris : un pied de
     page en dessous le ferait déborder à chaque question. */
  /^\/redflagtest(\/|$)/,
];

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
  /* Replié sur mobile, toujours ouvert dès la tablette. Les liens restent dans
     le HTML servi — donc suivis par les moteurs et atteignables par un
     examinateur — mais ne pèsent plus 600 px sous chaque écran de jeu. */
  const [navOpen, setNavOpen] = useState(false);

  if (HIDDEN_PATHS.some((re) => re.test(pathname))) return null;

  return (
    <footer
      className="relative z-20 w-full border-t border-white/6 bg-black/60 px-5 pt-6 sm:pt-10"
      /* Dernier bloc du document : c'est lui qui doit dégager la barre
         gestuelle, sans quoi la ligne de contact passe dessous. */
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
    >
      <div className="mx-auto w-full max-w-3xl">
        <button
          type="button"
          onClick={() => setNavOpen((open) => !open)}
          aria-expanded={navOpen}
          aria-controls="site-footer-nav"
          className="mb-5 flex min-h-11 items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#8A8A8E] transition-colors hover:text-white sm:hidden"
        >
          <span
            aria-hidden
            className={`transition-transform ${navOpen ? 'rotate-90' : ''}`}
          >
            ›
          </span>
          Plan du site
        </button>

        {/* Intitulés en `p` et non en `h2` : le pied de page est rendu sur
            toutes les routes, et ses trois titres de groupe s'ajoutaient à la
            hiérarchie de chaque page — devant son `h1` dans le flux HTML
            diffusé. Le `nav` et son `aria-label` suffisent au repérage. */}
        <nav
          id="site-footer-nav"
          aria-label="Navigation du site"
          className={`grid-cols-2 gap-8 sm:grid sm:grid-cols-3 ${navOpen ? 'grid' : 'hidden'}`}
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#5C5C5F]">
                {group.title}
              </p>
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
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#5C5C5F]">
              Le site
            </p>
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
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-[12px] font-semibold text-[#A6A6A6] transition-colors hover:text-white"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] font-semibold text-[#A6A6A6] transition-colors hover:text-white"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <p className="text-[10px] text-[#5C5C5F]">
            RED OR GREEN © 2026 • POUR REPÉRER LES TOXICITÉS ORDINAIRES
          </p>
          <span aria-hidden className="text-[10px] text-[#3A3A3D]">•</span>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-semibold text-[#7C7C80] transition-colors hover:text-white"
          >
            @{INSTAGRAM_HANDLE}
          </a>
          <span aria-hidden className="text-[10px] text-[#3A3A3D]">•</span>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-[10px] font-semibold text-[#7C7C80] transition-colors hover:text-white"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
}
