'use client';

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useApp } from '@/lib/AppContext';

export default function Footer() {
  const { t } = useApp();

  const contacts = [
    {
      name: 'GitHub',
      href: 'https://github.com/shlelisa',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      ),
      label: 'github.com/shlelisa',
      color: 'hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-zinc-500',
    },
    {
      name: 'Portfolio',
      href: 'https://lelisa1.vercel.app',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
      ),
      label: 'Portfolio Website',
      color: 'hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500',
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/lelisa-shashura-4935a2259/',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
      label: 'LinkedIn Profile',
      color: 'hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-400 dark:hover:border-sky-500',
    },
    {
      name: 'Email',
      href: 'mailto:lelisashashura@gmail.com',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      label: 'lelisashashura@gmail.com',
      color: 'hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-400 dark:hover:border-emerald-500',
    },
  ];

  return (
    <footer className="border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Main 3-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Column 1: Brand & Mission (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <Logo size="md" showBadge={true} asLink={true} />
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              Next-generation AI-powered career platform. Craft recruiter-ready CVs, ATS-tailored job matches, and professional application letters in English, Afaan Oromoo, and Amharic.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Free & Open AI Career Assistant</span>
            </div>
          </div>

          {/* Column 2: Navigation Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-zinc-200">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-zinc-400">
              <li>
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors block">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors block">
                  {t.nav.templates}
                </Link>
              </li>
              <li>
                <Link href="/builder" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors block">
                  {t.nav.builder}
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors block">
                  {t.nav.jobs}
                </Link>
              </li>
              <li>
                <Link href="/letters" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors block">
                  {t.nav.letters}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Developer Profiles (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-zinc-200">
                Contact Us
              </h4>
              <span className="text-[11px] text-gray-400 dark:text-zinc-500">Lelisa</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2 pt-1">
              {contacts.map((c) => (
                <a
                  key={c.name}
                  href={c.href}
                  target={c.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={c.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/40 text-gray-700 dark:text-zinc-300 text-xs font-semibold transition-all hover:shadow-xs group ${c.color}`}
                >
                  <span className="shrink-0 transition-transform group-hover:scale-110">{c.icon}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-bold">
                      {c.name}
                    </span>
                    <span className="text-xs truncate">{c.label}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} Developed By Lelisa Shashura</p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-[11px] font-medium text-gray-600 dark:text-zinc-400">
              🌍 English · Afaan Oromoo · አማርኛ
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
