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

import { useEffect, useRef } from 'react';
import Link from '@/components/ui/LienIntention';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { DON_URL } from '@/config/contact';
import { cheminLocalise, estTraduit, langueDuChemin } from '@/lib/i18n/langue';
import { BoutonLangue } from './BoutonLangue';

/**
 * L'accueil est exclu : il porte déjà le logo en grand, la rangée d'onglets
 * des quatre jeux et celle des quatre raccourcis. La barre y répétait la
 * marque une seconde fois, vingt pixels au-dessus du logo, et coûtait 52 px
 * de hauteur sur l'écran où chaque pixel se dispute au descriptif des jeux.
 * Le plan du site reste atteignable par le pied de page, replié juste dessous.
 */
/* Le Red Flag Test porte la barre comme les autres jeux. Il en était exclu
   parce que les deux en-têtes s'appelaient `.site-header` — celui de la barre,
   et celui du front-end de référence, que `flac.css` habille. Les classes de la
   barre s'appellent désormais `barre-site` : plus aucun nom en commun. */
const HIDDEN_PATHS = [/^\/$/, /^\/en$/, /^\/admin(\/|$)/, /^\/dixmais\/admin(\/|$)/];

/*
 * Les jeux, les outils et les pages de lecture portent tous cette même barre.
 * Ils avaient chacun la leur — « ← Menu », « ← Accueil », une flèche seule —,
 * tantôt empilée sous celle-ci, tantôt à sa place : un site qui changeait de
 * navigation d'une page à l'autre. Les jeux ne gardent que ce qui leur est
 * propre (progression, recommencer, statistiques) ; le retour à l'accueil est
 * le logo, ici, partout.
 */

/** Groupée par thème, comme le demandent les consignes de qualité. */
const NAV_SECTIONS: {
  title: string;
  links: { href: string; label: string }[];
}[] = [
  {
    title: 'Jouer',
    // Les deux jeux phares d'abord. Le Red Flag Test n'était dans aucun menu :
    // aucune page du site ne le liait, hors l'accueil.
    links: [
      { href: '/redflagtest', label: 'Red Flag Test' },
      { href: '/dixmais', label: "C'est un 10 mais…" },
      { href: '/flagornot', label: "L'Oracle" },
      { href: '/jeu', label: 'Le pire des deux' },
    ],
  },
  {
    title: 'Comprendre',
    links: [
      { href: '/guide', label: 'Guide des flags' },
      { href: '/red-flags', label: 'Les pires red flags' },
      { href: '/articles', label: 'Articles' },
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

/*
 * LA BARRE EN ANGLAIS (2026-11-14)
 *   Sur une page sous `/en`, les libellés passent en anglais et les liens vont
 *   à la version anglaise quand elle existe. Une page qui n'existe qu'en
 *   français le dit (« FR ») : on n'y envoie personne par surprise.
 */
const LIBELLES_EN: Record<string, string> = {
  'Jouer': 'Play',
  "C'est un 10 mais…": "It's a 10 but…",
  "L'Oracle": 'The Oracle',
  'Le pire des deux': 'The worse of two',
  'Comprendre': 'Understand',
  "S'évaluer": 'Self-check',
  'Le site': 'About the site',
  'Guide des flags': 'Flag guide',
  'Les pires red flags': 'The worst red flags',
  'Articles': 'Articles',
  'Classement': 'Ranking',
  'Observatoire': 'Observatory',
  'Méthodologie': 'Methodology',
  'Tous les outils': 'All the tools',
  'Violentomètre': 'Violence meter',
  'Consentomètre': 'Consent meter',
  'Incestomètre': 'Incest meter',
  'Harcèlomètre': 'Harassment meter',
  'Discriminomètre': 'Discrimination meter',
  'À propos': 'About',
  'Sources': 'Sources',
  'Mentions légales': 'Legal notice',
  'Confidentialité': 'Privacy',
  'Guide': 'Guide',
  'Outils': 'Tools',
};

/** Un lien de la barre, dans la langue de la page. */
function lienLocalise(enAnglais: boolean, l: { href: string; label: string }) {
  if (!enAnglais) return l;
  const label = LIBELLES_EN[l.label] ?? l.label;
  return estTraduit(l.href)
    ? { href: cheminLocalise('en', l.href), label }
    : { href: l.href, label: `${label} · FR` };
}

/**
 * L'adresse de la page, l'accueil ramené à « / ».
 *
 * L'accueil est régénéré en arrière-plan toutes les cinq minutes
 * (`revalidate = 300`), et pendant cette régénération Next le rend sous
 * `/index`. La barre, qui ne reconnaissait que « / », s'y affichait côté
 * serveur alors que le navigateur, qui lit « / », la masquait : React laissait
 * la copie du serveur orpheline dans la page, et en ajoutait une seconde au
 * premier clic vers un jeu. Deux barres empilées, sur tous les ordinateurs,
 * dès qu'on venait de l'accueil.
 */
export function normaliserChemin(pathname: string | null): string {
  if (!pathname || pathname === '/index') return pathname ? '/' : '';
  return pathname;
}

export function SiteHeader() {
  const pathname = normaliserChemin(usePathname());
  const panelRef = useRef<HTMLDetailsElement>(null);

  // Le composant vit dans la mise en page racine : il n'est jamais remonté au
  // changement de route, et le panneau restait donc ouvert après un clic.
  useEffect(() => {
    if (panelRef.current) panelRef.current.open = false;
  }, [pathname]);

  if (HIDDEN_PATHS.some((re) => re.test(pathname))) return null;

  const enAnglais = langueDuChemin(pathname) === 'en';

  const isCurrent = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="barre-site">
      <div className="barre-site__bar">
        {/* Le logo plutôt que le nom en texte : c'est la marque telle qu'on la
            voit partout ailleurs sur le site. Image décorative dans un lien
            nommé — le nom accessible est porté par le lien. */}
        <Link
          href={enAnglais ? '/en' : '/'}
          className="barre-site__brand"
          aria-label={enAnglais ? 'Red or Green — home' : 'Red or Green — accueil'}
        >
          <Image src="/logo-rog-new.svg" alt="" width={192} height={86} priority />
        </Link>

        <nav className="barre-site__inline" aria-label={enAnglais ? 'Main navigation' : 'Navigation principale'}>
          {/* En anglais, « Jouer » mènerait à un jeu français : le Red Flag Test le remplace. */}
          {(enAnglais ? [{ href: '/redflagtest', label: 'Red Flag Test' }, ...INLINE.slice(1)] : INLINE)
            .map((brut) => lienLocalise(enAnglais, brut)).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isCurrent(l.href) ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* La langue, en vue sur toutes les pages qui portent la barre. */}
        <BoutonLangue className="barre-site__langue" />

        {/* Toujours visible, à côté du menu : replié dans le panneau, le don
            n'était vu que de ceux qui ouvraient le menu. */}
        <a
          href={DON_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="barre-site__cafe"
          aria-label={enAnglais ? 'Buy us a coffee (Ko-fi, new tab)' : 'Offrir un café (Ko-fi, nouvel onglet)'}
        >
          <span aria-hidden>☕</span>
          <span>{enAnglais ? 'Coffee' : 'Café'}</span>
        </a>

        <details className="barre-site__menu" ref={panelRef}>
          <summary aria-label={enAnglais ? 'Open the navigation menu' : 'Ouvrir le menu de navigation'}>
            <Menu size={16} aria-hidden />
            <span>Menu</span>
          </summary>
          <div className="barre-site__panel">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title}>
                {/* `p` et non `h2` : ce panneau est present dans le DOM sur
                    toutes les pages, avant leur titre de niveau 1. Quatre `h2`
                    en tete de document inverseraient la hierarchie partout. Le
                    `nav` et son `aria-label` portent deja le reperage. */}
                <p>{enAnglais ? LIBELLES_EN[section.title] ?? section.title : section.title}</p>
                <ul>
                  {section.links.map((brut) => lienLocalise(enAnglais, brut)).map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} aria-current={isCurrent(l.href) ? 'page' : undefined}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <a href={DON_URL} target="_blank" rel="noopener noreferrer" className="barre-site__panel-cafe">
              {enAnglais ? '☕ Buy the site a coffee' : '☕ Offrir un café au site'}
            </a>
          </div>
        </details>
      </div>
    </header>
  );
}
