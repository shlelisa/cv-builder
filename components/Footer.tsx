'use client';

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useApp } from '@/lib/AppContext';

export default function Footer() {
  const { t } = useApp();

  return (
    <footer className="border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo Brand */}
          <div className="flex flex-col items-center md:items-start space-y-1">
            <Logo size="md" showBadge={true} asLink={true} />
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 max-w-sm text-center md:text-left">
              Next-generation AI-powered career assistant. Build recruiter-tested CVs, application letters, and ATS diagnostic reports in minutes.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-6 text-xs sm:text-sm font-semibold text-gray-600 dark:text-zinc-300">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t.nav.home}
            </Link>
            <Link href="/templates" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t.nav.templates}
            </Link>
            <Link href="/builder" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t.nav.builder}
            </Link>
            <Link href="/jobs" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t.nav.jobs}
            </Link>
            <Link href="/letters" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t.nav.letters}
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} LelisaCV Builder. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>English · Afaan Oromoo · አማርኛ</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
