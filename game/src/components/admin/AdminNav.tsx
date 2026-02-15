'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '🏠', shortLabel: 'Home' },
  { href: '/admin/elements', label: 'Éléments', icon: '📝', shortLabel: 'Élém.' },
  { href: '/admin/categories', label: 'Catégories', icon: '🏷️', shortLabel: 'Catég.' },
  { href: '/admin/stats', label: 'Statistiques', icon: '📊', shortLabel: 'Stats' },
  { href: '/admin/demographics', label: 'Démographie', icon: '📈', shortLabel: 'Démo' },
  { href: '/admin/moderation', label: 'Modération', icon: '🛡️', shortLabel: 'Modér.' },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    router.push('/admin');
  };

  return (
    <nav className="bg-[#0D0D0D] border-b border-[#333] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide">
            <span className="text-[#DC2626] font-bold text-lg mr-3 hidden sm:block flex-shrink-0">🚩 Admin</span>
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  pathname === item.href
                    ? 'bg-[#DC2626]/20 text-[#DC2626]'
                    : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]'
                }`}>
                  <span className="mr-1">{item.icon}</span>
                  <span className="hidden md:inline">{item.label}</span>
                  <span className="md:hidden">{item.shortLabel}</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
            <Link href="/" className="text-[#737373] hover:text-[#F5F5F5] text-sm transition-colors hidden sm:block">
              ↗ Site
            </Link>
            <button onClick={handleLogout} className="text-[#737373] hover:text-[#DC2626] text-sm transition-colors">
              Déco
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
