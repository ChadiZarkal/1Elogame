'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '🏠', shortLabel: 'Home' },
  { href: '/admin/elements', label: 'Éléments', icon: '📝', shortLabel: 'Éléments' },
  { href: '/admin/categories', label: 'Catégories', icon: '🏷️', shortLabel: 'Catégories' },
  { href: '/admin/stats', label: 'Statistiques', icon: '📊', shortLabel: 'Stats' },
  { href: '/admin/demographics', label: 'Démographie', icon: '📈', shortLabel: 'Démo' },
  { href: '/admin/moderation', label: 'Modération', icon: '🛡️', shortLabel: 'Modérer' },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    router.push('/admin');
  };

  return (
    <nav className="bg-[#111] border-b border-[#222] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-1">
            <span className="text-[#DC2626] font-bold text-lg mr-4 hidden sm:block">🚩 Admin</span>
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === item.href
                    ? 'bg-[#DC2626]/20 text-[#DC2626]'
                    : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]'
                }`}>
                  <span className="mr-1.5">{item.icon}</span>
                  <span className="hidden md:inline">{item.label}</span>
                  <span className="md:hidden">{item.shortLabel}</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[#737373] hover:text-[#F5F5F5] text-sm transition-colors">
              ↗ Jeu
            </Link>
            <button onClick={handleLogout} className="text-[#737373] hover:text-[#DC2626] text-sm transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
