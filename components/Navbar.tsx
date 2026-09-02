'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { LanguageCode } from '@/types';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { t, language, setLanguage, theme, toggleTheme } = useApp();

  const links = [
    { href: '/', label: t.nav.home },
    { href: '/templates', label: t.nav.templates },
    { href: '/builder', label: t.nav.builder },
    { href: '/jobs', label: t.nav.jobs },
    { href: '/letters', label: t.nav.letters },
  ];

  const languages: { code: LanguageCode; label: string; natives: string }[] = [
    { code: 'en', label: 'English', natives: 'EN' },
    { code: 'om', label: 'Afaan Oromo', natives: 'OM' },
    { code: 'am', label: 'አማርኛ', natives: 'አማ' },
  ];

  return (
    <nav className="border-b sticky top-0 z-50 bg-white/95 backdrop-blur dark:bg-zinc-900/95 border-gray-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
            LelisaCV Builder
          </Link>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:flex gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === link.href
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <select
                aria-label="Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="px-2 py-1.5 rounded-md border text-sm bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.natives}
                  </option>
                ))}
              </select>

              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-md border hover:bg-gray-100 dark:hover:bg-zinc-800 border-gray-300 dark:border-zinc-700 transition-colors"
              >
                {theme === 'light' ? (
                  <svg className="w-4 h-4 text-gray-700 dark:text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-700 dark:text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${pathname === link.href
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'text-gray-600 dark:text-zinc-300'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
